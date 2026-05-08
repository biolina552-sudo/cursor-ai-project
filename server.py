from __future__ import annotations

import base64
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any


HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8000"))
ROOT = Path(__file__).resolve().parent
D_ID_API_KEY = os.environ.get("D_ID_API_KEY", "demo_username:demo_password")


AVATARS = {
    "maya": {
        "name": "مايا",
        "imageUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=90",
    },
    "adam": {
        "name": "آدم",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=90",
    },
    "lina": {
        "name": "لينا",
        "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=90",
    },
    "nour": {
        "name": "نور",
        "imageUrl": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=90",
    },
}


LANGUAGES = {
    "moroccan": {
        "voiceId": "ar-MA-MounaNeural",
        "voiceLanguage": "Arabic (Morocco)",
    },
    "gulf": {
        "voiceId": "ar-SA-ZariyahNeural",
        "voiceLanguage": "Arabic (Saudi Arabia)",
    },
    "english": {
        "voiceId": "en-US-JennyNeural",
        "voiceLanguage": "English (United States)",
    },
    "french": {
        "voiceId": "fr-FR-DeniseNeural",
        "voiceLanguage": "French (France)",
    },
}


def build_auth_header() -> str:
    if D_ID_API_KEY.startswith("Basic "):
        return D_ID_API_KEY

    if ":" in D_ID_API_KEY:
        encoded_key = base64.b64encode(D_ID_API_KEY.encode("utf-8")).decode("ascii")
        return f"Basic {encoded_key}"

    return f"Basic {D_ID_API_KEY}"


def build_script(description: str, language: str) -> str:
    clean_description = " ".join(description.strip().split())
    scripts = {
        "moroccan": (
            "واش كتقلب على منتج يبان احترافي ويقنع الزبون من أول ثواني؟ "
            f"{clean_description}. هاد الفيديو كيبرز القيمة ديال المنتج بطريقة "
            "واضحة وجذابة، وكيخلي العرض ديالك يبقى فالبال. جرّبو اليوم وخلي "
            "منتجك يهضر بلا مجهود."
        ),
        "gulf": (
            "إذا تبي منتجك يلفت الانتباه ويقنع العميل بسرعة، فهذا العرض مناسب لك. "
            f"{clean_description}. الفيديو يوضح القيمة، يبرز المميزات، ويعطي "
            "علامتك حضور احترافي من أول لحظة. اطلبه الآن وخل منتجك يتكلم عن نفسه."
        ),
        "english": (
            "Meet a product designed to stand out and turn attention into action. "
            f"{clean_description}. This short video highlights the value clearly, "
            "builds trust fast, and gives your audience a strong reason to choose you today."
        ),
        "french": (
            "Découvrez un produit conçu pour attirer l'attention et transformer "
            f"l'intérêt en action. {clean_description}. Cette vidéo met en avant "
            "sa valeur, inspire confiance et donne à votre audience une vraie raison d'acheter."
        ),
    }
    return scripts[language]


def send_json_to_did(path: str, method: str = "GET", payload: dict[str, Any] | None = None) -> dict[str, Any]:
    url = f"https://api.d-id.com{path}"
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = urllib.request.Request(
        url,
        data=body,
        method=method,
        headers={
            "Authorization": build_auth_header(),
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            response_body = response.read().decode("utf-8")
            return json.loads(response_body) if response_body else {}
    except urllib.error.HTTPError as error:
        details = error.read().decode("utf-8")
        try:
            parsed_details: Any = json.loads(details)
        except json.JSONDecodeError:
            parsed_details = details
        raise DIdError(error.code, parsed_details) from error
    except urllib.error.URLError as error:
        raise DIdError(502, str(error.reason)) from error


class DIdError(Exception):
    def __init__(self, status: int, details: Any):
        super().__init__("D-ID request failed")
        self.status = status
        self.details = details


class AppHandler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args: Any) -> None:
        print(f"[{time.strftime('%H:%M:%S')}] {self.address_string()} - {format % args}")

    def do_GET(self) -> None:
        parsed_path = urllib.parse.urlparse(self.path)

        if parsed_path.path.startswith("/api/video-status/"):
            video_id = parsed_path.path.rsplit("/", 1)[-1]
            self.handle_video_status(video_id)
            return

        self.serve_static(parsed_path.path)

    def do_HEAD(self) -> None:
        parsed_path = urllib.parse.urlparse(self.path)
        self.serve_static(parsed_path.path, head_only=True)

    def do_POST(self) -> None:
        if self.path == "/api/generate-video":
            self.handle_generate_video()
            return

        self.write_json({"error": "Route not found."}, status=404)

    def handle_generate_video(self) -> None:
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(body or "{}")
        except (ValueError, json.JSONDecodeError):
            self.write_json({"error": "Invalid JSON body."}, status=400)
            return

        avatar_id = str(data.get("avatarId", "maya"))
        description = str(data.get("description", "")).strip()
        language = str(data.get("language", "moroccan"))
        product_image_name = str(data.get("productImageName", "")).strip()

        if avatar_id not in AVATARS:
            self.write_json({"error": "Unsupported avatar."}, status=400)
            return

        if language not in LANGUAGES:
            self.write_json({"error": "Unsupported language."}, status=400)
            return

        if len(description) < 12:
            self.write_json(
                {"error": "Product description must be at least 12 characters."},
                status=400,
            )
            return

        avatar = AVATARS[avatar_id]
        voice = LANGUAGES[language]
        script = build_script(description, language)
        did_payload = {
            "source_url": avatar["imageUrl"],
            "script": {
                "type": "text",
                "input": script,
                "provider": {
                    "type": "microsoft",
                    "voice_id": voice["voiceId"],
                    "voice_config": {
                        "rate": "1.03",
                        "style": "cheerful",
                        "language": voice["voiceLanguage"],
                    },
                },
            },
            "config": {
                "stitch": True,
                "result_format": "mp4",
                "driver_expressions": {
                    "expressions": [
                        {"start_frame": 0, "expression": "happy", "intensity": 0.75},
                        {"start_frame": 75, "expression": "neutral", "intensity": 0.9},
                        {"start_frame": 130, "expression": "happy", "intensity": 0.65},
                    ],
                    "transition_frames": 18,
                },
            },
        }

        if product_image_name:
            did_payload["user_data"] = f"Product image uploaded: {product_image_name}"

        try:
            did_result = send_json_to_did("/talks", method="POST", payload=did_payload)
        except DIdError as error:
            message = "D-ID video generation failed."
            if D_ID_API_KEY == "demo_username:demo_password":
                message = (
                    "D-ID rejected the default experimental key. Set a valid "
                    "D_ID_API_KEY environment variable for real generation."
                )
            self.write_json(
                {"error": message, "details": error.details},
                status=error.status,
            )
            return

        self.write_json(
            {
                "id": did_result.get("id"),
                "status": did_result.get("status", "created"),
                "script": script,
                "avatar": avatar,
            }
        )

    def handle_video_status(self, video_id: str) -> None:
        if not video_id:
            self.write_json({"error": "Missing video id."}, status=400)
            return

        try:
            did_result = send_json_to_did(f"/talks/{urllib.parse.quote(video_id)}")
        except DIdError as error:
            self.write_json(
                {"error": "D-ID status lookup failed.", "details": error.details},
                status=error.status,
            )
            return

        self.write_json(
            {
                "id": did_result.get("id", video_id),
                "status": did_result.get("status"),
                "resultUrl": did_result.get("result_url"),
                "createdAt": did_result.get("created_at"),
            }
        )

    def serve_static(self, path: str, head_only: bool = False) -> None:
        clean_path = "index.html" if path in ("", "/") else path.lstrip("/")
        file_path = (ROOT / clean_path).resolve()

        if not str(file_path).startswith(str(ROOT)) or not file_path.is_file():
            self.write_json({"error": "File not found."}, status=404)
            return

        content_type = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
            ".svg": "image/svg+xml",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
        }.get(file_path.suffix, "application/octet-stream")

        content = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        if not head_only:
            self.wfile.write(content)

    def write_json(self, payload: dict[str, Any], status: int = 200) -> None:
        content = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), AppHandler)
    print(f"Server running on http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
