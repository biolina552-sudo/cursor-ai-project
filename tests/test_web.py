import json
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest import mock
from urllib import request

from ai_video_tool.client import PredictionResult
from ai_video_tool.web import (
    build_model_options,
    create_handler,
    enhance_prompt,
    normalize_generation_request,
    normalize_static_path,
    sanitize_video_filename,
)


class WebRequestTests(unittest.TestCase):
    def test_normalize_generation_request_supports_darija(self) -> None:
        request_data = normalize_generation_request(
            {"prompt": "مدينة فالمستقبل", "language": "moroccan_darija", "duration": 5},
            default_model="default/model",
        )

        self.assertEqual(request_data["model"], "default/model")
        self.assertEqual(request_data["language"], "moroccan_darija")
        self.assertEqual(request_data["inputs"]["duration"], 5)
        self.assertIn("Moroccan Darija", request_data["inputs"]["prompt"])
        self.assertIn("مدينة فالمستقبل", request_data["inputs"]["prompt"])

    def test_normalize_generation_request_accepts_custom_prompt_key_and_model(self) -> None:
        request_data = normalize_generation_request(
            {"prompt": "A neon city", "language": "english", "model": "custom/model"},
            default_model="default/model",
            prompt_key="text",
        )

        self.assertEqual(request_data["model"], "custom/model")
        self.assertIn("text", request_data["inputs"])
        self.assertNotIn("prompt", request_data["inputs"])

    def test_normalize_generation_request_rejects_unsupported_language(self) -> None:
        with self.assertRaises(ValueError):
            normalize_generation_request({"prompt": "hello", "language": "spanish"}, default_model="default/model")

    def test_build_model_options_validates_duration(self) -> None:
        self.assertEqual(build_model_options({"duration": "7", "aspect_ratio": "16:9"}), {"duration": 7, "aspect_ratio": "16:9"})
        with self.assertRaises(ValueError):
            build_model_options({"duration": "40"})

    def test_enhance_prompt_adds_language_instruction(self) -> None:
        enhanced = enhance_prompt("une ville futuriste", "french")

        self.assertIn("French", enhanced)
        self.assertIn("une ville futuriste", enhanced)

    def test_static_and_video_paths_are_sanitized(self) -> None:
        self.assertEqual(normalize_static_path("app.css"), "app.css")
        self.assertIsNone(normalize_static_path("../secret"))
        self.assertEqual(sanitize_video_filename("a" * 32 + ".mp4"), "a" * 32 + ".mp4")
        self.assertIsNone(sanitize_video_filename("../../secret.mp4"))


class WebHandlerTests(unittest.TestCase):
    def test_generate_endpoint_returns_video_url(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            client = mock.Mock()
            client.generate_video.return_value = PredictionResult(
                prediction={"status": "succeeded"},
                output_url="https://files.example/video.mp4",
            )
            handler = create_handler(
                client_factory=lambda: client,
                video_dir=Path(tmpdir),
                model="default/model",
                prompt_key="prompt",
                poll_interval=0,
                timeout=1,
                wait=False,
            )
            server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
            thread = threading.Thread(target=server.serve_forever)
            thread.start()
            try:
                url = f"http://127.0.0.1:{server.server_port}/api/generate"
                http_request = request.Request(
                    url,
                    data=json.dumps({"prompt": "A robot chef", "language": "english"}).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST",
                )
                response = request.urlopen(http_request, timeout=5)
                try:
                    body = json.loads(response.read().decode("utf-8"))
                    status = response.status
                finally:
                    response.close()
            finally:
                server.shutdown()
                server.server_close()
                thread.join(timeout=5)

        self.assertEqual(status, 200)
        self.assertRegex(body["video_url"], r"^/videos/[a-f0-9]{32}\.mp4$")
        self.assertEqual(body["provider_output_url"], "https://files.example/video.mp4")
        client.generate_video.assert_called_once()


if __name__ == "__main__":
    unittest.main()
