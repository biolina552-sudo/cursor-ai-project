import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from ai_video_tool import cli
from ai_video_tool.client import PredictionResult


class CliParsingTests(unittest.TestCase):
    def test_parse_params_decodes_json_values(self) -> None:
        self.assertEqual(
            cli.parse_params(["duration=5", "loop=true", "aspect_ratio=\"16:9\"", "style=cinematic"]),
            {"duration": 5, "loop": True, "aspect_ratio": "16:9", "style": "cinematic"},
        )

    def test_load_input_json_from_inline_object(self) -> None:
        self.assertEqual(cli.load_input_json('{"duration": 5}'), {"duration": 5})

    def test_load_input_json_from_file(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "input.json"
            path.write_text('{"fps": 24}', encoding="utf-8")

            self.assertEqual(cli.load_input_json(f"@{path}"), {"fps": 24})


class CliGenerateTests(unittest.TestCase):
    def test_generate_builds_inputs_and_saves_metadata(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            output = Path(tmpdir) / "video.mp4"
            metadata = Path(tmpdir) / "prediction.json"
            result = PredictionResult(
                prediction={"id": "prediction-1", "status": "succeeded"},
                output_url="https://files.example/video.mp4",
            )

            with mock.patch.dict(os.environ, {"REPLICATE_API_TOKEN": "token"}), mock.patch(
                "ai_video_tool.cli.load_dotenv"
            ) as load_dotenv, mock.patch("ai_video_tool.cli.ReplicateClient") as client_class:
                client = client_class.return_value
                client.generate_video.return_value = result

                exit_code = cli.main(
                    [
                        "generate",
                        "a cat riding a bicycle",
                        "--output",
                        str(output),
                        "--input-json",
                        '{"duration": 5}',
                        "--param",
                        "fps=24",
                        "--metadata",
                        str(metadata),
                    ]
                )

            self.assertEqual(exit_code, 0)
            load_dotenv.assert_called_once_with()
            client_class.assert_called_once_with("token")
            client.generate_video.assert_called_once()
            kwargs = client.generate_video.call_args.kwargs
            self.assertEqual(kwargs["model"], cli.DEFAULT_MODEL)
            self.assertIsNone(kwargs["version"])
            self.assertEqual(kwargs["inputs"], {"duration": 5, "fps": 24, "prompt": "a cat riding a bicycle"})
            self.assertEqual(json.loads(metadata.read_text(encoding="utf-8")), result.prediction)

    def test_generate_requires_api_token(self) -> None:
        with mock.patch.dict(os.environ, {}, clear=True), mock.patch("ai_video_tool.cli.load_dotenv"):
            exit_code = cli.main(["generate", "a cat", "--output", "cat.mp4"])

        self.assertEqual(exit_code, 1)


if __name__ == "__main__":
    unittest.main()
