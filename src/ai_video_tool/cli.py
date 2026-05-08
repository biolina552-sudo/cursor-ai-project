"""Command-line interface for AI video generation."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any, Sequence

from ai_video_tool.client import ReplicateClient, VideoGenerationError, build_inputs
from ai_video_tool.env import load_dotenv


DEFAULT_MODEL = "minimax/video-01"


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "generate":
        return generate(args)

    parser.print_help()
    return 2


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="ai-video",
        description="Generate AI videos from text prompts.",
    )
    subparsers = parser.add_subparsers(dest="command")

    generate_parser = subparsers.add_parser(
        "generate",
        help="Generate a video from a text prompt.",
    )
    generate_parser.add_argument("prompt", help="Text prompt to send to the video model.")
    generate_parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("generated-video.mp4"),
        help="Where to save the generated video. Defaults to generated-video.mp4.",
    )
    generate_parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"Replicate owner/name model to run. Defaults to {DEFAULT_MODEL}.",
    )
    generate_parser.add_argument(
        "--version",
        help="Pinned Replicate model version. When set, --model is not used for the request.",
    )
    generate_parser.add_argument(
        "--prompt-key",
        default="prompt",
        help="Input field name for the prompt. Defaults to prompt.",
    )
    generate_parser.add_argument(
        "--input-json",
        default="{}",
        help="JSON object of model-specific inputs, or @path/to/file.json.",
    )
    generate_parser.add_argument(
        "--param",
        action="append",
        default=[],
        metavar="KEY=VALUE",
        help="Model-specific input. VALUE is parsed as JSON when possible. Can be repeated.",
    )
    generate_parser.add_argument(
        "--token-env",
        default="REPLICATE_API_TOKEN",
        help="Environment variable containing the Replicate API token.",
    )
    generate_parser.add_argument(
        "--poll-interval",
        type=float,
        default=5,
        help="Seconds between prediction polling requests. Defaults to 5.",
    )
    generate_parser.add_argument(
        "--timeout",
        type=float,
        default=1800,
        help="Maximum seconds to wait for completion. Defaults to 1800.",
    )
    generate_parser.add_argument(
        "--wait",
        action="store_true",
        help="Ask Replicate to wait briefly for completion on the initial request.",
    )
    generate_parser.add_argument(
        "--metadata",
        type=Path,
        help="Optional path where the final prediction JSON should be saved.",
    )

    return parser


def generate(args: argparse.Namespace) -> int:
    try:
        load_dotenv()
        token = os.environ.get(args.token_env)
        if not token:
            raise VideoGenerationError(f"{args.token_env} is not set. Add it to .env or export it in your shell.")

        base_inputs = load_input_json(args.input_json)
        base_inputs.update(parse_params(args.param))
        inputs = build_inputs(args.prompt, prompt_key=args.prompt_key, base_inputs=base_inputs)

        client = ReplicateClient(token)
        result = client.generate_video(
            model=args.model,
            version=args.version,
            inputs=inputs,
            output_path=args.output,
            poll_interval=args.poll_interval,
            timeout=args.timeout,
            wait=args.wait,
        )

        if args.metadata:
            args.metadata.parent.mkdir(parents=True, exist_ok=True)
            args.metadata.write_text(json.dumps(result.prediction, indent=2, sort_keys=True) + "\n", encoding="utf-8")

        print(f"Generated video saved to {args.output}")
        return 0
    except (OSError, ValueError, TimeoutError, VideoGenerationError) as exc:
        print(f"ai-video: error: {exc}", file=sys.stderr)
        return 1


def load_input_json(value: str) -> dict[str, Any]:
    """Load model input JSON from an inline object or @file path."""

    if value.startswith("@"):
        raw = Path(value[1:]).read_text(encoding="utf-8")
    else:
        raw = value

    try:
        decoded = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"--input-json is not valid JSON: {exc}") from exc

    if not isinstance(decoded, dict):
        raise ValueError("--input-json must decode to a JSON object")
    return decoded


def parse_params(raw_params: Sequence[str]) -> dict[str, Any]:
    """Parse repeated KEY=VALUE command-line parameters."""

    parsed: dict[str, Any] = {}
    for raw_param in raw_params:
        if "=" not in raw_param:
            raise ValueError(f"--param must use KEY=VALUE syntax: {raw_param}")
        key, raw_value = raw_param.split("=", 1)
        key = key.strip()
        if not key:
            raise ValueError("--param keys cannot be empty")
        parsed[key] = parse_value(raw_value)
    return parsed


def parse_value(raw_value: str) -> Any:
    """Parse a CLI parameter value as JSON, falling back to a string."""

    try:
        return json.loads(raw_value)
    except json.JSONDecodeError:
        return raw_value


if __name__ == "__main__":
    raise SystemExit(main())
