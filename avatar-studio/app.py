import json
import os
import uuid
from pathlib import Path

import requests
from flask import Flask, jsonify, redirect, render_template, request, url_for
from werkzeug.utils import secure_filename


BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "config.json"
UPLOAD_DIR = BASE_DIR / "static" / "uploads"
GENERATED_DIR = BASE_DIR / "static" / "generated"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
GENERATED_DIR.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "shoplina-video-studio-dev")
app.config["MAX_CONTENT_LENGTH"] = 12 * 1024 * 1024


AVATARS = [
    {
        "id": "noelle",
        "name_en": "Noelle",
        "name_ar": "نويل",
        "role": "Luxury presenter",
        "source_url": "https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.png",
        "photo_url": "https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.png",
    },
    {
        "id": "emma",
        "name_en": "Emma",
        "name_ar": "إيما",
        "role": "Beauty specialist",
        "source_url": "https://create-images-results.d-id.com/DefaultPresenters/Emma_f/image.png",
        "photo_url": "https://create-images-results.d-id.com/DefaultPresenters/Emma_f/image.png",
    },
    {
        "id": "eric",
        "name_en": "Eric",
        "name_ar": "إريك",
        "role": "Tech reviewer",
        "source_url": "https://create-images-results.d-id.com/DefaultPresenters/Eric_m/image.png",
        "photo_url": "https://create-images-results.d-id.com/DefaultPresenters/Eric_m/image.png",
    },
    {
        "id": "sara",
        "name_en": "Sara",
        "name_ar": "سارة",
        "role": "Lifestyle host",
        "source_url": "https://create-images-results.d-id.com/DefaultPresenters/Sara_f/image.png",
        "photo_url": "https://create-images-results.d-id.com/DefaultPresenters/Sara_f/image.png",
    },
    {
        "id": "william",
        "name_en": "William",
        "name_ar": "ويليام",
        "role": "Retail consultant",
        "source_url": "https://create-images-results.d-id.com/DefaultPresenters/William_m/image.png",
        "photo_url": "https://create-images-results.d-id.com/DefaultPresenters/William_m/image.png",
    },
    {
        "id": "emily",
        "name_en": "Emily",
        "name_ar": "إيميلي",
        "role": "Social media host",
        "source_url": "https://create-images-results.d-id.com/DefaultPresenters/Emily_f/image.png",
        "photo_url": "https://create-images-results.d-id.com/DefaultPresenters/Emily_f/image.png",
    },
    {
        "id": "ahmed",
        "name_en": "Ahmed",
        "name_ar": "أحمد",
        "role": "Arabic male presenter",
        "source_url": "https://create-images-results.d-id.com/DefaultPresenters/Eric_m/image.png",
        "photo_url": "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
        "id": "fatima",
        "name_en": "Fatima",
        "name_ar": "فاطمة",
        "role": "Arabic female presenter",
        "source_url": "https://create-images-results.d-id.com/DefaultPresenters/Sara_f/image.png",
        "photo_url": "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
        "id": "mohammed",
        "name_en": "Mohammed",
        "name_ar": "محمد",
        "role": "Arabic male presenter",
        "source_url": "https://create-images-results.d-id.com/DefaultPresenters/William_m/image.png",
        "photo_url": "https://randomuser.me/api/portraits/men/45.jpg",
    },
    {
        "id": "noura",
        "name_en": "Noura",
        "name_ar": "نورة",
        "role": "Arabic female presenter",
        "source_url": "https://create-images-results.d-id.com/DefaultPresenters/Emma_f/image.png",
        "photo_url": "https://randomuser.me/api/portraits/women/68.jpg",
    },
]

LANGUAGES = {
    "ar-gulf": {
        "label_en": "Arabic Gulf",
        "label_ar": "عربي خليجي",
        "voice_id": "ar-SA-ZariyahNeural",
        "language": "Arabic (Saudi Arabia)",
    },
    "ar-morocco": {
        "label_en": "Arabic Morocco",
        "label_ar": "عربي مغربي",
        "voice_id": "ar-MA-MounaNeural",
        "language": "Arabic (Morocco)",
    },
    "en": {
        "label_en": "English",
        "label_ar": "الإنجليزية",
        "voice_id": "en-US-JennyNeural",
        "language": "English (United States)",
    },
    "fr": {
        "label_en": "French",
        "label_ar": "الفرنسية",
        "voice_id": "fr-FR-DeniseNeural",
        "language": "French (France)",
    },
}


def load_config():
    if not CONFIG_PATH.exists():
        return {"did_api_key": ""}
    try:
        with CONFIG_PATH.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except (json.JSONDecodeError, OSError):
        return {"did_api_key": ""}
    return {"did_api_key": data.get("did_api_key", "")}


def save_config(api_key):
    with CONFIG_PATH.open("w", encoding="utf-8") as file:
        json.dump({"did_api_key": api_key.strip()}, file, indent=2)


def did_auth_headers():
    api_key = load_config().get("did_api_key", "").strip()
    if not api_key:
        return None

    lowered = api_key.lower()
    authorization = api_key if lowered.startswith(("basic ", "bearer ")) else f"Basic {api_key}"
    return {
        "Authorization": authorization,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def find_avatar(avatar_id):
    return next((avatar for avatar in AVATARS if avatar["id"] == avatar_id), None)


def safe_error_response(response):
    try:
        detail = response.json()
    except ValueError:
        detail = response.text
    return jsonify({"error": "D-ID API request failed", "detail": detail}), response.status_code


@app.context_processor
def inject_globals():
    api_key = load_config().get("did_api_key", "")
    return {
        "has_api_key": bool(api_key),
        "avatars": AVATARS,
        "languages": LANGUAGES,
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/settings", methods=["GET", "POST"])
def settings():
    if request.method == "POST":
        api_key = request.form.get("did_api_key", "")
        save_config(api_key)
        return redirect(url_for("settings", saved="1"))
    return render_template("settings.html")


@app.route("/api/config-status")
def config_status():
    return jsonify({"has_api_key": bool(load_config().get("did_api_key", ""))})


@app.route("/api/generate", methods=["POST"])
def generate_video():
    headers = did_auth_headers()
    if headers is None:
        return jsonify({"error": "Please save your D-ID API key in Settings first."}), 400

    product_name = request.form.get("product_name", "").strip()
    script_text = request.form.get("script", "").strip()
    avatar_id = request.form.get("avatar_id", "").strip()
    language_id = request.form.get("language", "").strip()
    duration = request.form.get("duration", "25").strip()

    avatar = find_avatar(avatar_id)
    language = LANGUAGES.get(language_id)

    if not product_name:
        return jsonify({"error": "Product name is required."}), 400
    if not script_text:
        return jsonify({"error": "Product script is required."}), 400
    if avatar is None:
        return jsonify({"error": "Please select a valid avatar."}), 400
    if language is None:
        return jsonify({"error": "Please select a valid language."}), 400

    try:
        duration_number = int(duration)
    except ValueError:
        return jsonify({"error": "Duration must be a number."}), 400
    if duration_number < 15 or duration_number > 40:
        return jsonify({"error": "Duration must be between 15 and 40 seconds."}), 400

    product_image = request.files.get("product_image")
    saved_image_url = None
    if product_image and product_image.filename:
        filename = secure_filename(product_image.filename)
        suffix = Path(filename).suffix.lower()
        if suffix not in {".jpg", ".jpeg", ".png", ".webp"}:
            return jsonify({"error": "Product image must be JPG, PNG, or WEBP."}), 400
        stored_name = f"{uuid.uuid4().hex}{suffix}"
        product_image.save(UPLOAD_DIR / stored_name)
        saved_image_url = url_for("static", filename=f"uploads/{stored_name}")

    payload = {
        "source_url": avatar["source_url"],
        "script": {
            "type": "text",
            "input": script_text,
            "provider": {
                "type": "microsoft",
                "voice_id": language["voice_id"],
                "language": language["language"],
            },
        },
    }

    try:
        response = requests.post(
            "https://api.d-id.com/talks",
            headers=headers,
            json=payload,
            timeout=45,
        )
    except requests.RequestException as exc:
        return jsonify({"error": "Could not connect to D-ID API.", "detail": str(exc)}), 502

    if response.status_code >= 400:
        return safe_error_response(response)

    data = response.json()
    return jsonify(
        {
            "talk_id": data.get("id"),
            "status": data.get("status", "created"),
            "product_image_url": saved_image_url,
            "duration": duration_number,
        }
    )


@app.route("/api/talks/<talk_id>")
def talk_status(talk_id):
    headers = did_auth_headers()
    if headers is None:
        return jsonify({"error": "Please save your D-ID API key in Settings first."}), 400

    try:
        response = requests.get(
            f"https://api.d-id.com/talks/{talk_id}",
            headers=headers,
            timeout=45,
        )
    except requests.RequestException as exc:
        return jsonify({"error": "Could not connect to D-ID API.", "detail": str(exc)}), 502

    if response.status_code >= 400:
        return safe_error_response(response)

    data = response.json()
    return jsonify(
        {
            "id": data.get("id"),
            "status": data.get("status"),
            "result_url": data.get("result_url"),
            "thumbnail_url": data.get("thumbnail_url"),
            "error": data.get("error"),
            "created_at": data.get("created_at"),
            "modified_at": data.get("modified_at"),
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
