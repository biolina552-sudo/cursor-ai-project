import json
import unittest
from unittest import mock

from ai_video_tool.client import (
    ReplicateClient,
    VideoGenerationError,
    build_inputs,
    extract_output_url,
    parse_model_name,
)


class FakeResponse:
    def __init__(self, payload: bytes) -> None:
        self.payload = payload
        self.closed = False

    def read(self, size: int | None = None) -> bytes:
        if size is None:
            payload = self.payload
            self.payload = b""
            return payload
        payload = self.payload[:size]
        self.payload = self.payload[size:]
        return payload

    def close(self) -> None:
        self.closed = True


class ReplicateClientTests(unittest.TestCase):
    def test_create_prediction_uses_model_endpoint(self) -> None:
        client = ReplicateClient("token", base_url="https://api.example.test/v1")
        payload = {"id": "prediction-1", "status": "starting", "urls": {"get": "https://api.example.test/p/1"}}

        with mock.patch("ai_video_tool.client.request.urlopen", return_value=FakeResponse(json.dumps(payload).encode())) as urlopen:
            prediction = client.create_prediction(
                model="owner/video-model",
                version=None,
                inputs={"prompt": "hello"},
            )

        self.assertEqual(prediction, payload)
        sent_request = urlopen.call_args.args[0]
        self.assertEqual(sent_request.full_url, "https://api.example.test/v1/models/owner/video-model/predictions")
        self.assertEqual(sent_request.get_method(), "POST")
        self.assertEqual(sent_request.headers["Authorization"], "Bearer token")
        self.assertEqual(json.loads(sent_request.data.decode()), {"input": {"prompt": "hello"}})

    def test_create_prediction_uses_version_endpoint(self) -> None:
        client = ReplicateClient("token", base_url="https://api.example.test/v1")
        payload = {"id": "prediction-1", "status": "starting"}

        with mock.patch("ai_video_tool.client.request.urlopen", return_value=FakeResponse(json.dumps(payload).encode())) as urlopen:
            client.create_prediction(
                model="ignored/model",
                version="owner/model:abc123",
                inputs={"prompt": "hello"},
                wait=True,
            )

        sent_request = urlopen.call_args.args[0]
        self.assertEqual(sent_request.full_url, "https://api.example.test/v1/predictions")
        self.assertEqual(sent_request.headers["Prefer"], "wait")
        self.assertEqual(
            json.loads(sent_request.data.decode()),
            {"version": "owner/model:abc123", "input": {"prompt": "hello"}},
        )

    def test_generate_video_downloads_output_url(self) -> None:
        client = ReplicateClient("token")
        client.create_prediction = mock.Mock(return_value={"status": "succeeded", "output": ["https://files.example/video.mp4"]})
        client.download_output = mock.Mock()

        result = client.generate_video(
            model="owner/model",
            version=None,
            inputs={"prompt": "hello"},
            output_path=mock.sentinel.output_path,
            poll_interval=0,
            timeout=1,
        )

        self.assertEqual(result.output_url, "https://files.example/video.mp4")
        client.download_output.assert_called_once_with("https://files.example/video.mp4", mock.sentinel.output_path)

    def test_generate_video_raises_without_output_url(self) -> None:
        client = ReplicateClient("token")
        client.create_prediction = mock.Mock(return_value={"status": "succeeded", "output": {"text": "done"}})

        with self.assertRaises(VideoGenerationError):
            client.generate_video(
                model="owner/model",
                version=None,
                inputs={"prompt": "hello"},
                output_path=mock.sentinel.output_path,
                poll_interval=0,
                timeout=1,
            )

    def test_parse_model_name_requires_owner_and_name(self) -> None:
        self.assertEqual(parse_model_name("owner/model"), ("owner", "model"))
        with self.assertRaises(ValueError):
            parse_model_name("model")

    def test_build_inputs_adds_prompt_key(self) -> None:
        self.assertEqual(
            build_inputs("make a video", prompt_key="text", base_inputs={"duration": 5}),
            {"duration": 5, "text": "make a video"},
        )

    def test_extract_output_url_prefers_video_extension(self) -> None:
        self.assertEqual(
            extract_output_url({"preview": "https://files.example/preview.png", "video": "https://files.example/out.mp4?download=1"}),
            "https://files.example/out.mp4?download=1",
        )


if __name__ == "__main__":
    unittest.main()
