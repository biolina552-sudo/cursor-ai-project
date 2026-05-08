import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from ai_video_tool.env import load_dotenv, strip_optional_quotes


class EnvTests(unittest.TestCase):
    def test_load_dotenv_reads_key_values_without_overriding_existing_env(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            env_file = Path(tmpdir) / ".env"
            env_file.write_text(
                "\n".join(
                    [
                        "# comment",
                        "REPLICATE_API_TOKEN=r8_from_file",
                        "export MODEL_NAME=\"minimax/video-01\"",
                    ]
                ),
                encoding="utf-8",
            )

            with mock.patch.dict(os.environ, {"REPLICATE_API_TOKEN": "r8_existing"}, clear=True):
                loaded = load_dotenv(env_file)

                self.assertEqual(loaded["REPLICATE_API_TOKEN"], "r8_from_file")
                self.assertEqual(loaded["MODEL_NAME"], "minimax/video-01")
                self.assertEqual(os.environ["REPLICATE_API_TOKEN"], "r8_existing")
                self.assertEqual(os.environ["MODEL_NAME"], "minimax/video-01")

    def test_load_dotenv_missing_file_is_empty(self) -> None:
        self.assertEqual(load_dotenv("/tmp/does-not-exist-ai-video.env"), {})

    def test_load_dotenv_rejects_invalid_lines(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            env_file = Path(tmpdir) / ".env"
            env_file.write_text("REPLICATE_API_TOKEN\n", encoding="utf-8")

            with self.assertRaises(ValueError):
                load_dotenv(env_file)

    def test_strip_optional_quotes(self) -> None:
        self.assertEqual(strip_optional_quotes('"abc"'), "abc")
        self.assertEqual(strip_optional_quotes("'abc'"), "abc")
        self.assertEqual(strip_optional_quotes("abc"), "abc")


if __name__ == "__main__":
    unittest.main()
