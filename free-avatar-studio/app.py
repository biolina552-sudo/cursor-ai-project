import json
import os
import time
from pathlib import Path

import requests
from flask import Flask, jsonify, render_template, request


BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "config.json"
HEYGEN_BASE_URL = "https://api.heygen.com"
DEFAULT_ASPECT_RATIO = "16:9"
POLL_INTERVAL_SECONDS = 5
POLL_TIMEOUT_SECONDS = 600

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 4 * 1024 * 1024


def load_config():
    if not CONFIG_PATH.exists():
        return {}
    try:
        return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}


def save_config(config):
    CONFIG_PATH.write_text(json.dumps(config, ensure_ascii=False, indent=2), encoding="utf-8")


def get_api_key():
    return load_config().get("heygen_api_key", "").strip()


def require_api_key():
    api_key = get_api_key()
    if not api_key:
        raise ValueError("Please add your HeyGen API key in Settings before generating videos.")
    return api_key


def heygen_headers(api_key):
    return {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": api_key,
    }


def heygen_request(method, path, api_key, **kwargs):
    url = f"{HEYGEN_BASE_URL}{path}"
    try:
        response = requests.request(method, url, headers=heygen_headers(api_key), timeout=60, **kwargs)
    except requests.RequestException as exc:
        raise RuntimeError(f"Could not reach HeyGen: {exc}") from exc

    try:
        payload = response.json()
    except ValueError:
        payload = {"message": response.text}

    if not response.ok:
        message = payload.get("message") or payload.get("error") or payload.get("detail") or response.text
        raise RuntimeError(f"HeyGen API error ({response.status_code}): {message}")

    return payload


def extract_collection(payload, keys):
    data = payload.get("data", payload)
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in keys:
            value = data.get(key)
            if isinstance(value, list):
                return value
        for value in data.values():
            if isinstance(value, list):
                return value
    return []


def normalize_avatar(raw):
    avatar_id = raw.get("avatar_id") or raw.get("id")
    name = raw.get("avatar_name") or raw.get("name") or raw.get("display_name") or avatar_id
    image_url = (
        raw.get("preview_image_url")
        or raw.get("thumbnail_url")
        or raw.get("image_url")
        or raw.get("portrait_url")
        or raw.get("preview_url")
    )
    return {
        "id": avatar_id,
        "name": name,
        "image_url": image_url,
        "gender": raw.get("gender"),
        "raw": raw,
    }


def normalize_voice(raw):
    voice_id = raw.get("voice_id") or raw.get("id")
    name = raw.get("name") or raw.get("voice_name") or raw.get("display_name") or voice_id
    language = raw.get("language") or raw.get("locale") or raw.get("language_name") or ""
    gender = raw.get("gender") or raw.get("sex") or ""
    return {
        "id": voice_id,
        "name": name,
        "language": language,
        "gender": gender,
        "preview_audio": raw.get("preview_audio") or raw.get("preview_audio_url"),
        "raw": raw,
    }


def build_generate_payload(avatar_id, voice_id, input_text, aspect_ratio):
    # HeyGen v2 accepts video_inputs with a text voice and avatar character.
    # The aspect_ratio field is included because the UI exposes the requested
    # 16:9/9:16/1:1 choice; dimension is also supplied for broad v2 compatibility.
    dimension = {"width": 1280, "height": 720}
    if aspect_ratio == "9:16":
        dimension = {"width": 720, "height": 1280}
    elif aspect_ratio == "1:1":
        dimension = {"width": 1080, "height": 1080}

    return {
        "video_inputs": [
            {
                "character": {
                    "type": "avatar",
                    "avatar_id": avatar_id,
                    "avatar_style": "normal",
                },
                "voice": {
                    "type": "text",
                    "voice_id": voice_id,
                    "input_text": input_text,
                },
            }
        ],
        "aspect_ratio": aspect_ratio,
        "dimension": dimension,
    }


def get_video_id(payload):
    data = payload.get("data", payload)
    if isinstance(data, dict):
        return data.get("video_id") or data.get("id")
    return payload.get("video_id") or payload.get("id")


def normalize_video_status(payload):
    data = payload.get("data", payload)
    if not isinstance(data, dict):
        data = payload

    status = (data.get("status") or data.get("state") or "").lower()
    video_url = (
        data.get("video_url")
        or data.get("video_url_caption")
        or data.get("url")
        or data.get("download_url")
    )
    error = data.get("error") or data.get("message") or payload.get("message")
    return status, video_url, error


def poll_video(api_key, video_id):
    deadline = time.time() + POLL_TIMEOUT_SECONDS
    last_payload = {}

    while time.time() < deadline:
        last_payload = heygen_request("GET", f"/v1/video_status.get?video_id={video_id}", api_key)
        status, video_url, error = normalize_video_status(last_payload)
        if status in {"completed", "complete", "success", "done"} and video_url:
            return video_url, last_payload
        if status in {"failed", "error", "canceled", "cancelled"}:
            raise RuntimeError(error or f"HeyGen video generation failed with status: {status}")
        time.sleep(POLL_INTERVAL_SECONDS)

    raise TimeoutError(f"Timed out waiting for HeyGen video {video_id}. Last response: {last_payload}")


@app.route("/")
def index():
    return render_template("index.html", has_api_key=bool(get_api_key()))


@app.get("/api/settings")
def settings_status():
    return jsonify({"has_api_key": bool(get_api_key())})


@app.post("/api/settings")
def save_settings():
    payload = request.get_json(silent=True) or request.form
    api_key = (payload.get("heygen_api_key") or "").strip()
    if not api_key:
        return jsonify({"error": "Please enter a HeyGen API key."}), 400
    save_config({"heygen_api_key": api_key})
    return jsonify({"has_api_key": True})


@app.get("/api/heygen/avatars")
def list_avatars():
    try:
        api_key = require_api_key()
        payload = heygen_request("GET", "/v2/avatars", api_key)
        avatars = [avatar for avatar in (normalize_avatar(item) for item in extract_collection(payload, ["avatars"])) if avatar["id"]]
        return jsonify({"avatars": avatars})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400


@app.get("/api/heygen/voices")
def list_voices():
    try:
        api_key = require_api_key()
        payload = heygen_request("GET", "/v2/voices", api_key)
        voices = [voice for voice in (normalize_voice(item) for item in extract_collection(payload, ["voices"])) if voice["id"]]
        return jsonify({"voices": voices})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400


@app.post("/generate")
def generate():
    try:
        api_key = require_api_key()
    except ValueError as exc:
        return jsonify({"error": str(exc), "needs_api_key": True}), 400

    product_name = request.form.get("product_name", "").strip()
    input_text = (request.form.get("script") or request.form.get("input_text") or "").strip()
    avatar_id = (request.form.get("avatar_id") or request.form.get("avatar") or "").strip()
    voice_id = request.form.get("voice_id", "").strip()
    aspect_ratio = request.form.get("aspect_ratio", DEFAULT_ASPECT_RATIO).strip() or DEFAULT_ASPECT_RATIO

    if not input_text:
        return jsonify({"error": "Please enter the script text for the avatar to read."}), 400
    if not avatar_id:
        return jsonify({"error": "Please select a HeyGen avatar."}), 400
    if not voice_id:
        return jsonify({"error": "Please select a HeyGen voice."}), 400
    if aspect_ratio not in {"16:9", "9:16", "1:1"}:
        return jsonify({"error": "Unsupported aspect ratio."}), 400

    prompt_text = input_text
    if product_name:
        prompt_text = f"{product_name}\n\n{input_text}"

    try:
        generate_payload = build_generate_payload(avatar_id, voice_id, prompt_text, aspect_ratio)
        generate_response = heygen_request("POST", "/v2/video/generate", api_key, json=generate_payload)
        video_id = get_video_id(generate_response)
        if not video_id:
            return jsonify({"error": f"HeyGen did not return a video_id: {generate_response}"}), 500

        video_url, status_payload = poll_video(api_key, video_id)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    return jsonify(
        {
            "video_id": video_id,
            "video_url": video_url,
            "download_url": video_url,
            "status": "completed",
            "status_payload": status_payload,
        }
    )


if __name__ == "__main__":
    debug_enabled = os.environ.get("FLASK_DEBUG", "").lower() in {"1", "true", "yes"}
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5000")), debug=debug_enabled)
