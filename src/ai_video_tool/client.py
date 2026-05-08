"""Client utilities for AI video generation providers."""

from __future__ import annotations

import json
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib import error, request


TERMINAL_STATUSES = {"succeeded", "failed", "canceled"}
VIDEO_EXTENSIONS = (".mp4", ".mov", ".webm", ".m4v", ".avi", ".mkv")


class VideoGenerationError(RuntimeError):
    """Raised when a video generation request cannot be completed."""


@dataclass(frozen=True)
class PredictionResult:
    """A completed provider prediction."""

    prediction: dict[str, Any]
    output_url: str | None


class ReplicateClient:
    """Minimal Replicate HTTP client for text-to-video predictions."""

    def __init__(
        self,
        api_token: str,
        *,
        base_url: str = "https://api.replicate.com/v1",
        http_timeout: float = 60,
    ) -> None:
        if not api_token:
            raise ValueError("api_token is required")

        self.api_token = api_token
        self.base_url = base_url.rstrip("/")
        self.http_timeout = http_timeout

    def create_prediction(
        self,
        *,
        model: str | None,
        version: str | None,
        inputs: dict[str, Any],
        wait: bool = False,
    ) -> dict[str, Any]:
        """Create a Replicate prediction and return the initial response."""

        if version:
            url = f"{self.base_url}/predictions"
            body: dict[str, Any] = {"version": version, "input": inputs}
        else:
            if not model:
                raise ValueError("model is required when version is not provided")
            owner, name = parse_model_name(model)
            url = f"{self.base_url}/models/{owner}/{name}/predictions"
            body = {"input": inputs}

        headers = {}
        if wait:
            headers["Prefer"] = "wait"

        return self._request_json("POST", url, body=body, extra_headers=headers)

    def get_prediction(self, prediction: dict[str, Any]) -> dict[str, Any]:
        """Fetch the latest prediction state."""

        get_url = prediction.get("urls", {}).get("get")
        prediction_id = prediction.get("id")
        if not get_url and prediction_id:
            get_url = f"{self.base_url}/predictions/{prediction_id}"
        if not get_url:
            raise VideoGenerationError("Prediction response did not include a polling URL")

        return self._request_json("GET", get_url)

    def wait_for_prediction(
        self,
        prediction: dict[str, Any],
        *,
        poll_interval: float,
        timeout: float,
    ) -> dict[str, Any]:
        """Poll until a prediction reaches a terminal state."""

        deadline = time.monotonic() + timeout
        current = prediction

        while current.get("status") not in TERMINAL_STATUSES:
            if time.monotonic() >= deadline:
                raise TimeoutError(f"Prediction did not finish within {timeout:g} seconds")
            time.sleep(poll_interval)
            current = self.get_prediction(current)

        if current.get("status") != "succeeded":
            provider_error = current.get("error") or current.get("logs") or current
            raise VideoGenerationError(f"Prediction ended with status {current.get('status')}: {provider_error}")

        return current

    def download_output(self, output_url: str, output_path: Path) -> None:
        """Download a completed video output to disk."""

        response = request.urlopen(output_url, timeout=self.http_timeout)
        try:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with output_path.open("wb") as file:
                while True:
                    chunk = response.read(1024 * 1024)
                    if not chunk:
                        break
                    file.write(chunk)
        finally:
            response.close()

    def generate_video(
        self,
        *,
        model: str | None,
        version: str | None,
        inputs: dict[str, Any],
        output_path: Path,
        poll_interval: float,
        timeout: float,
        wait: bool = False,
    ) -> PredictionResult:
        """Create a prediction, wait for completion, and download the video."""

        prediction = self.create_prediction(model=model, version=version, inputs=inputs, wait=wait)
        if prediction.get("status") != "succeeded":
            prediction = self.wait_for_prediction(prediction, poll_interval=poll_interval, timeout=timeout)
        elif prediction.get("error"):
            raise VideoGenerationError(f"Prediction failed: {prediction['error']}")

        output_url = extract_output_url(prediction.get("output"))
        if not output_url:
            raise VideoGenerationError("Prediction succeeded but no downloadable output URL was found")

        self.download_output(output_url, output_path)
        return PredictionResult(prediction=prediction, output_url=output_url)

    def _request_json(
        self,
        method: str,
        url: str,
        *,
        body: dict[str, Any] | None = None,
        extra_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        data = None if body is None else json.dumps(body).encode("utf-8")
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }
        if extra_headers:
            headers.update(extra_headers)

        http_request = request.Request(url, data=data, headers=headers, method=method)
        try:
            response = request.urlopen(http_request, timeout=self.http_timeout)
            try:
                payload = response.read().decode("utf-8")
            finally:
                response.close()
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise VideoGenerationError(f"Provider request failed with HTTP {exc.code}: {detail}") from exc
        except error.URLError as exc:
            raise VideoGenerationError(f"Provider request failed: {exc.reason}") from exc

        try:
            decoded = json.loads(payload)
        except json.JSONDecodeError as exc:
            raise VideoGenerationError(f"Provider returned invalid JSON: {payload}") from exc

        if not isinstance(decoded, dict):
            raise VideoGenerationError("Provider returned an unexpected JSON payload")
        return decoded


def build_inputs(prompt: str, *, prompt_key: str, base_inputs: dict[str, Any]) -> dict[str, Any]:
    """Build the provider input object for a prompt."""

    inputs = dict(base_inputs)
    inputs[prompt_key] = prompt
    return inputs


def extract_output_url(output: Any) -> str | None:
    """Find the most likely video URL in a provider output payload."""

    urls = list(_iter_urls(output))
    if not urls:
        return None

    for url in urls:
        path = url.split("?", 1)[0].lower()
        if path.endswith(VIDEO_EXTENSIONS):
            return url
    return urls[0]


def parse_model_name(model: str) -> tuple[str, str]:
    """Split a Replicate owner/name model identifier."""

    parts = model.split("/")
    if len(parts) != 2 or not all(parts):
        raise ValueError("model must use the Replicate owner/name format")
    return parts[0], parts[1]


def _iter_urls(value: Any) -> list[str]:
    if isinstance(value, str) and value.startswith(("http://", "https://")):
        return [value]
    if isinstance(value, list):
        urls: list[str] = []
        for item in value:
            urls.extend(_iter_urls(item))
        return urls
    if isinstance(value, dict):
        urls = []
        for item in value.values():
            urls.extend(_iter_urls(item))
        return urls
    return []
