"""Web interface for the AI video generator."""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import re
import sys
import uuid
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from importlib import resources
from pathlib import Path
from typing import Any, Callable, Sequence
from urllib.parse import unquote, urlparse

from ai_video_tool.cli import DEFAULT_MODEL
from ai_video_tool.client import ReplicateClient, VideoGenerationError, build_inputs
from ai_video_tool.env import load_dotenv


SUPPORTED_LANGUAGES = {
    "moroccan_darija": {
        "label": "Moroccan Darija",
        "instruction": "The user's prompt is written in Moroccan Darija. Preserve the intended meaning and cultural context.",
    },
    "gulf_arabic": {
        "label": "Gulf Arabic",
        "instruction": "The user's prompt is written in Gulf Arabic. Preserve the intended meaning and cultural context.",
    },
    "english": {
        "label": "English",
        "instruction": "The user's prompt is written in English. Follow it directly.",
    },
    "french": {
        "label": "French",
        "instruction": "The user's prompt is written in French. Preserve the intended meaning and visual details.",
    },
}

MAX_REQUEST_BYTES = 32_768
VIDEO_OUTPUT_DIR = Path("generated-videos")


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    load_dotenv()
    token = os.environ.get(args.token_env)
    if not token:
        print(f"ai-video-web: warning: {args.token_env} is not set. Add it to .env before generating videos.", file=sys.stderr)

    video_dir = args.output_dir.resolve()
    video_dir.mkdir(parents=True, exist_ok=True)

    def client_factory() -> ReplicateClient:
        api_token = os.environ.get(args.token_env)
        if not api_token:
            raise VideoGenerationError(f"{args.token_env} is not set. Add it to .env before generating videos.")
        return ReplicateClient(api_token)
    handler_class = create_handler(
        client_factory=client_factory,
        video_dir=video_dir,
        model=args.model,
        prompt_key=args.prompt_key,
        poll_interval=args.poll_interval,
        timeout=args.timeout,
        wait=args.wait,
    )

    server = ThreadingHTTPServer((args.host, args.port), handler_class)
    print(f"AI Video Studio running at http://{args.host}:{args.port}")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
    finally:
        server.server_close()
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="ai-video-web",
        description="Run the AI Video Studio web interface.",
    )
    parser.add_argument("--host", default="127.0.0.1", help="Host interface to bind. Defaults to 127.0.0.1.")
    parser.add_argument("--port", type=int, default=8000, help="Port to listen on. Defaults to 8000.")
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"Replicate model to run. Defaults to {DEFAULT_MODEL}.")
    parser.add_argument("--prompt-key", default="prompt", help="Model input field name for the prompt.")
    parser.add_argument("--token-env", default="REPLICATE_API_TOKEN", help="Environment variable with the API token.")
    parser.add_argument("--output-dir", type=Path, default=VIDEO_OUTPUT_DIR, help="Directory for generated videos.")
    parser.add_argument("--poll-interval", type=float, default=5, help="Seconds between provider polling requests.")
    parser.add_argument("--timeout", type=float, default=1800, help="Maximum seconds to wait for generation.")
    parser.add_argument("--wait", action="store_true", help="Ask Replicate to wait briefly on the initial request.")
    return parser


def create_handler(
    *,
    client_factory: Callable[[], ReplicateClient],
    video_dir: Path,
    model: str,
    prompt_key: str,
    poll_interval: float,
    timeout: float,
    wait: bool,
) -> type[BaseHTTPRequestHandler]:
    class VideoStudioHandler(BaseHTTPRequestHandler):
        server_version = "AIVideoStudio/0.1"

        def do_GET(self) -> None:
            parsed = urlparse(self.path)
            if parsed.path == "/":
                self._send_static("index.html")
                return
            if parsed.path.startswith("/static/"):
                self._send_static(parsed.path.removeprefix("/static/"))
                return
            if parsed.path.startswith("/videos/"):
                self._send_video(parsed.path.removeprefix("/videos/"))
                return
            self._send_json({"error": "Not found"}, status=HTTPStatus.NOT_FOUND)

        def do_POST(self) -> None:
            parsed = urlparse(self.path)
            if parsed.path != "/api/generate":
                self._send_json({"error": "Not found"}, status=HTTPStatus.NOT_FOUND)
                return

            try:
                payload = self._read_json_body()
                request_data = normalize_generation_request(payload, default_model=model, prompt_key=prompt_key)
                output_name = f"{uuid.uuid4().hex}.mp4"
                output_path = video_dir / output_name
                client = client_factory()
                result = client.generate_video(
                    model=request_data["model"],
                    version=None,
                    inputs=request_data["inputs"],
                    output_path=output_path,
                    poll_interval=poll_interval,
                    timeout=timeout,
                    wait=wait,
                )
                self._send_json(
                    {
                        "video_url": f"/videos/{output_name}",
                        "provider_output_url": result.output_url,
                        "language": request_data["language"],
                    }
                )
            except (ValueError, TimeoutError, OSError, VideoGenerationError) as exc:
                self._send_json({"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)

        def log_message(self, format: str, *args: Any) -> None:
            print(f"{self.address_string()} - {format % args}")

        def _read_json_body(self) -> dict[str, Any]:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length <= 0:
                raise ValueError("Request body is required")
            if content_length > MAX_REQUEST_BYTES:
                raise ValueError("Request body is too large")

            raw_body = self.rfile.read(content_length).decode("utf-8")
            try:
                payload = json.loads(raw_body)
            except json.JSONDecodeError as exc:
                raise ValueError("Request body must be valid JSON") from exc
            if not isinstance(payload, dict):
                raise ValueError("Request body must be a JSON object")
            return payload

        def _send_static(self, relative_path: str) -> None:
            safe_path = normalize_static_path(relative_path)
            if safe_path is None:
                self._send_json({"error": "Not found"}, status=HTTPStatus.NOT_FOUND)
                return

            static_root = resources.files("ai_video_tool").joinpath("web_static")
            resource = static_root.joinpath(safe_path)
            if not resource.is_file():
                self._send_json({"error": "Not found"}, status=HTTPStatus.NOT_FOUND)
                return

            content = resource.read_bytes()
            content_type = mimetypes.guess_type(safe_path)[0] or "application/octet-stream"
            self._send_bytes(content, content_type=content_type)

        def _send_video(self, filename: str) -> None:
            safe_filename = sanitize_video_filename(filename)
            if safe_filename is None:
                self._send_json({"error": "Not found"}, status=HTTPStatus.NOT_FOUND)
                return

            video_path = video_dir / safe_filename
            if not video_path.is_file():
                self._send_json({"error": "Not found"}, status=HTTPStatus.NOT_FOUND)
                return

            self._send_bytes(video_path.read_bytes(), content_type="video/mp4")

        def _send_json(self, payload: dict[str, Any], *, status: HTTPStatus = HTTPStatus.OK) -> None:
            content = json.dumps(payload).encode("utf-8")
            self._send_bytes(content, content_type="application/json; charset=utf-8", status=status)

        def _send_bytes(
            self,
            content: bytes,
            *,
            content_type: str,
            status: HTTPStatus = HTTPStatus.OK,
        ) -> None:
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(content)

    return VideoStudioHandler


def normalize_generation_request(payload: dict[str, Any], *, default_model: str, prompt_key: str = "prompt") -> dict[str, Any]:
    prompt = str(payload.get("prompt", "")).strip()
    if not prompt:
        raise ValueError("Prompt is required")

    language = str(payload.get("language", "english")).strip()
    if language not in SUPPORTED_LANGUAGES:
        raise ValueError("Unsupported language")

    requested_model = str(payload.get("model", "")).strip()
    model = requested_model or default_model
    inputs = build_inputs(
        enhance_prompt(prompt, language),
        prompt_key=prompt_key,
        base_inputs=build_model_options(payload),
    )
    return {"model": model, "language": language, "inputs": inputs}


def build_model_options(payload: dict[str, Any]) -> dict[str, Any]:
    options: dict[str, Any] = {}
    duration = payload.get("duration")
    if duration not in (None, ""):
        try:
            parsed_duration = int(duration)
        except (TypeError, ValueError) as exc:
            raise ValueError("Duration must be a number") from exc
        if not 1 <= parsed_duration <= 30:
            raise ValueError("Duration must be between 1 and 30 seconds")
        options["duration"] = parsed_duration

    aspect_ratio = str(payload.get("aspect_ratio") or "").strip()
    if aspect_ratio:
        options["aspect_ratio"] = aspect_ratio
    return options


def enhance_prompt(prompt: str, language: str) -> str:
    language_info = SUPPORTED_LANGUAGES[language]
    return (
        f"{language_info['instruction']}\n"
        "Create a polished, high-quality AI video with cinematic composition, smooth motion, and professional lighting.\n"
        f"Prompt: {prompt}"
    )


def normalize_static_path(relative_path: str) -> str | None:
    path = unquote(relative_path).strip("/")
    if not path or path.startswith(".") or ".." in Path(path).parts:
        return None
    return path


def sanitize_video_filename(filename: str) -> str | None:
    decoded = unquote(filename).strip("/")
    if not re.fullmatch(r"[a-f0-9]{32}\.mp4", decoded):
        return None
    return decoded


if __name__ == "__main__":
    raise SystemExit(main())
