import os
import uuid
from pathlib import Path
from urllib.error import URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

import numpy as np
from flask import Flask, jsonify, render_template, request, send_from_directory, url_for
from gtts import gTTS
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps
from werkzeug.utils import secure_filename

try:
    from moviepy import AudioFileClip, VideoClip
except ImportError:  # MoviePy 1.x compatibility
    from moviepy.editor import AudioFileClip, VideoClip


BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
UPLOAD_DIR = STATIC_DIR / "uploads"
GENERATED_DIR = STATIC_DIR / "generated"
AVATAR_DIR = STATIC_DIR / "avatars"
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

for directory in (UPLOAD_DIR, GENERATED_DIR, AVATAR_DIR):
    directory.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024


AVATARS = [
    {"id": "ahmed", "name": "Ahmed", "label_ar": "أحمد", "file": "ahmed.jpg"},
    {"id": "fatima", "name": "Fatima", "label_ar": "فاطمة", "file": "fatima.jpg"},
    {"id": "mohammed", "name": "Mohammed", "label_ar": "محمد", "file": "mohammed.jpg"},
    {"id": "noura", "name": "Noura", "label_ar": "نورة", "file": "noura.jpg"},
    {"id": "emma", "name": "Emma", "label_ar": "إيما", "file": "emma.jpg"},
    {"id": "liam", "name": "Liam", "label_ar": "ليام", "file": "liam.jpg"},
    {"id": "sofia", "name": "Sofia", "label_ar": "صوفيا", "file": "sofia.jpg"},
    {"id": "noah", "name": "Noah", "label_ar": "نوح", "file": "noah.jpg"},
]

LANGUAGES = {
    "ar": {"name": "Arabic", "gtts": "ar", "words_per_second": 1.8},
    "en": {"name": "English", "gtts": "en", "words_per_second": 2.25},
    "fr": {"name": "French", "gtts": "fr", "words_per_second": 2.05},
}


def allowed_image(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS


def validate_saved_image(path):
    with Image.open(path) as image:
        image = ImageOps.exif_transpose(image)
        image.convert("RGB").save(path, quality=92)


def download_product_image(image_url, target_path):
    parsed = urlparse(image_url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("Product image URL must start with http:// or https://.")

    request = Request(image_url, headers={"User-Agent": "free-avatar-studio/1.0"})
    try:
        with urlopen(request, timeout=20) as response:
            content_type = response.headers.get("Content-Type", "")
            if content_type and not content_type.lower().startswith("image/"):
                raise ValueError("The product image URL did not return an image.")
            target_path.write_bytes(response.read(12 * 1024 * 1024))
    except URLError as exc:
        raise ValueError(f"Could not download product image URL: {exc}") from exc

    validate_saved_image(target_path)
    return target_path


def load_font(size, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


FONT_HERO = load_font(52, bold=True)
FONT_TITLE = load_font(42, bold=True)
FONT_BODY = load_font(27)
FONT_SMALL = load_font(22)
FONT_PRODUCT = load_font(58, bold=True)
FONT_CAPTION = load_font(30, bold=True)
FONT_LOGO = load_font(26, bold=True)


def trim_script_for_duration(script, language, duration):
    clean_script = " ".join(script.split())
    if not clean_script:
        return clean_script

    language_config = LANGUAGES.get(language, LANGUAGES["en"])
    max_words = max(12, int(duration * language_config["words_per_second"]))
    words = clean_script.split()
    if len(words) <= max_words:
        return clean_script
    return " ".join(words[:max_words]).rstrip(".,،؛;:") + "..."


def cover_image(image_path, size):
    image = Image.open(image_path).convert("RGB")
    image = ImageOps.exif_transpose(image)
    return ImageOps.fit(image, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def rounded_image(image, radius=36):
    mask = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, image.size[0], image.size[1]), radius=radius, fill=255)
    rounded = Image.new("RGBA", image.size)
    rounded.paste(image.convert("RGBA"), (0, 0), mask)
    return rounded


def gradient_background(width, height):
    top = np.array([32, 10, 60], dtype=np.float32)
    middle = np.array([75, 28, 111], dtype=np.float32)
    bottom = np.array([18, 12, 38], dtype=np.float32)
    rows = np.zeros((height, width, 3), dtype=np.uint8)
    for y in range(height):
        ratio = y / max(1, height - 1)
        if ratio < 0.55:
            local = ratio / 0.55
            color = top * (1 - local) + middle * local
        else:
            local = (ratio - 0.55) / 0.45
            color = middle * (1 - local) + bottom * local
        rows[y, :, :] = color
    return Image.fromarray(rows)


def create_product_placeholder(path, product_name):
    width, height = 900, 900
    image = gradient_background(width, height).convert("RGBA")
    draw = ImageDraw.Draw(image)

    draw.ellipse((-170, -130, 360, 360), fill=(236, 196, 92, 48))
    draw.ellipse((540, 540, 1080, 1080), fill=(119, 44, 172, 100))
    draw.rounded_rectangle((85, 92, 815, 808), radius=88, fill=(255, 255, 255, 22), outline=(236, 196, 92, 170), width=6)
    draw.rounded_rectangle((132, 140, 768, 760), radius=68, fill=(26, 8, 48, 174), outline=(255, 217, 119, 80), width=3)

    title = product_name or "Your Product"
    sparkles = ["✨", "✦", "◆", "✨", "✧", "◆", "✦", "✨"]
    sparkle_points = [(172, 186), (724, 184), (220, 684), (680, 680), (450, 220), (154, 448), (746, 454), (450, 706)]
    for sparkle, point in zip(sparkles, sparkle_points):
        draw.text(point, sparkle, font=FONT_BODY, fill=(255, 217, 119, 235))

    draw_centered_text(draw, width / 2, 156, "SHOPLINA", FONT_LOGO, (236, 196, 92, 255))
    draw_centered_text(draw, width / 2, 210, "✨ عرض فاخر ✨", FONT_BODY, (255, 255, 255, 232))

    # A premium product-card silhouette keeps the fallback focused on the offer,
    # without implying a specific product photo was uploaded.
    draw.rounded_rectangle((368, 298, 532, 520), radius=42, fill=(236, 196, 92, 212), outline=(255, 239, 171, 220), width=4)
    draw.rounded_rectangle((405, 256, 495, 320), radius=18, fill=(255, 224, 130, 224))
    draw.rounded_rectangle((386, 350, 514, 464), radius=28, fill=(48, 16, 77, 210), outline=(255, 239, 171, 130), width=2)
    draw_centered_text(draw, width / 2, 386, "S", FONT_PRODUCT, (255, 239, 171, 245))

    lines = wrap_text_for_width(draw, f"✨ {title} ✨", FONT_PRODUCT, 650, max_lines=2)
    start_y = 574 - (len(lines) * 34)
    for index, line in enumerate(lines):
        draw_centered_text(draw, width / 2, start_y + index * 66, line, FONT_PRODUCT, (255, 217, 119, 255))

    draw.rounded_rectangle((185, 698, 715, 750), radius=26, fill=(236, 196, 92, 205))
    draw_centered_text(draw, width / 2, 707, "إعلان جاهز بدون صورة منتج", FONT_SMALL, (40, 13, 64, 255), shadow=False)
    image.convert("RGB").save(path, quality=92)
    return path


def draw_panel(base, box, radius=34):
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    offset_box = (box[0] + 10, box[1] + 14, box[2] + 10, box[3] + 14)
    shadow_draw.rounded_rectangle(offset_box, radius=radius, fill=(0, 0, 0, 95))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    base.alpha_composite(shadow)

    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(box, radius=radius, fill=(255, 255, 255, 18), outline=(236, 196, 92, 130), width=3)


def paste_framed_image(base, image, box):
    draw_panel(base, box)
    x1, y1, x2, y2 = box
    inset = 14
    framed = rounded_image(image, radius=28)
    base.alpha_composite(framed, (x1 + inset, y1 + inset))


def text_width(draw, text, font):
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0]


def draw_centered_text(draw, center_x, y, text, font, fill, shadow=True):
    width = text_width(draw, text, font)
    x = center_x - width / 2
    if shadow:
        draw.text((x + 3, y + 3), text, font=font, fill=(0, 0, 0, 150))
    draw.text((x, y), text, font=font, fill=fill)


def wrap_text_for_width(draw, text, font, max_width, max_lines=3):
    if not text:
        return []
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if text_width(draw, candidate, font) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
            if len(lines) == max_lines:
                break
    if current and len(lines) < max_lines:
        lines.append(current)
    if len(lines) == max_lines and len(words) > len(" ".join(lines).split()):
        lines[-1] = lines[-1].rstrip(".,،؛;:") + "..."
    return lines


def current_caption_words(script_words, t, duration, window_size=7):
    if not script_words:
        return ""
    current_index = min(len(script_words) - 1, int((t / max(duration, 0.01)) * len(script_words)))
    start = max(0, current_index - window_size + 1)
    return " ".join(script_words[start : current_index + 1])


def draw_motion_background(frame, t):
    draw = ImageDraw.Draw(frame)
    drift = int(np.sin(t * 0.45) * 42)
    drift_fast = int(np.cos(t * 0.62) * 52)
    draw.ellipse((-120 + drift, -96, 270 + drift, 270), fill=(119, 44, 172, 76))
    draw.ellipse((990 - drift_fast, 430, 1410 - drift_fast, 860), fill=(236, 196, 92, 38))
    draw.ellipse((440 + drift_fast, 220 + drift, 860 + drift_fast, 610 + drift), fill=(255, 255, 255, 10))
    for index in range(5):
        x = 70 + index * 270 + int(np.sin(t * 0.7 + index) * 20)
        draw.line((x, 118, x + 110, 570), fill=(236, 196, 92, 18), width=2)


def draw_glowing_panel(base, box, t, radius=34):
    glow_alpha = int(78 + 55 * ((np.sin(t * 5.5) + 1) / 2))
    glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    expanded = (box[0] - 8, box[1] - 8, box[2] + 8, box[3] + 8)
    glow_draw.rounded_rectangle(expanded, radius=radius + 10, outline=(236, 196, 92, glow_alpha), width=8)
    glow = glow.filter(ImageFilter.GaussianBlur(10))
    base.alpha_composite(glow)
    draw_panel(base, box, radius=radius)


def paste_talking_avatar(base, avatar_image, box, t):
    x1, y1, x2, y2 = box
    inset = 14
    inner_size = (x2 - x1 - inset * 2, y2 - y1 - inset * 2)
    draw_glowing_panel(base, box, t)

    bob = int(np.sin(t * 7.0) * 6)
    zoom = 1.0 + 0.028 * ((np.sin(t * 8.0) + 1) / 2)
    scaled_size = (int(inner_size[0] * zoom), int(inner_size[1] * zoom))
    scaled = avatar_image.resize(scaled_size, Image.Resampling.LANCZOS)
    crop_left = max(0, (scaled.size[0] - inner_size[0]) // 2)
    crop_top = max(0, (scaled.size[1] - inner_size[1]) // 2)
    animated_avatar = scaled.crop((crop_left, crop_top, crop_left + inner_size[0], crop_top + inner_size[1]))
    base.alpha_composite(rounded_image(animated_avatar, radius=28), (x1 + inset, y1 + inset + bob))

    # Approximate mouth movement for the presenter photo. It gives a rhythmic
    # speaking cue that is synchronized to the generated voiceover duration.
    mouth_open = (np.sin(t * 18.0) + 1) / 2
    mouth_width = 74 + int(mouth_open * 14)
    mouth_height = 7 + int(mouth_open * 13)
    mouth_x = x1 + inset + inner_size[0] // 2 - mouth_width // 2
    mouth_y = y1 + inset + int(inner_size[1] * 0.50) + bob
    mouth_glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    mouth_draw = ImageDraw.Draw(mouth_glow)
    mouth_draw.rounded_rectangle(
        (mouth_x - 8, mouth_y - 8, mouth_x + mouth_width + 8, mouth_y + mouth_height + 8),
        radius=12,
        fill=(236, 196, 92, 54),
    )
    mouth_glow = mouth_glow.filter(ImageFilter.GaussianBlur(8))
    base.alpha_composite(mouth_glow)
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle((mouth_x, mouth_y, mouth_x + mouth_width, mouth_y + mouth_height), radius=7, fill=(62, 14, 50, 230))
    draw.rounded_rectangle((mouth_x + 8, mouth_y + 2, mouth_x + mouth_width - 8, mouth_y + 4), radius=2, fill=(255, 204, 122, 190))


def draw_word_caption(draw, script_words, t, duration):
    caption = current_caption_words(script_words, t, duration)
    if not caption:
        return
    draw.rounded_rectangle((170, 528, 1110, 600), radius=26, fill=(14, 6, 28, 222), outline=(236, 196, 92, 132), width=2)
    lines = wrap_text_for_width(draw, caption, FONT_CAPTION, 850, max_lines=1)
    if lines:
        draw_centered_text(draw, 640, 546, lines[0], FONT_CAPTION, (255, 255, 255, 244))


def build_frame_factory(avatar_path, product_path, product_name, script_preview, duration):
    width, height = 1280, 720
    avatar_size = (470, 470)
    product_size = (470, 470)
    avatar_image = cover_image(avatar_path, avatar_size)
    product_image = cover_image(product_path, product_size)
    background = gradient_background(width, height).convert("RGBA")
    script_words = script_preview.split()

    def make_frame(t):
        frame = background.copy()
        draw = ImageDraw.Draw(frame)

        pulse = (np.sin(t * 2.6) + 1) / 2
        gold = (236, 196, int(92 + 35 * pulse), 255)
        draw_motion_background(frame, t)

        draw.line((640, 125, 640, 565), fill=(236, 196, 92, 95), width=2)
        draw.rounded_rectangle((36, 30, 212, 76), radius=22, fill=(20, 8, 39, 180), outline=(236, 196, 92, 110), width=2)
        draw.text((58, 39), "Shoplina ✨", font=FONT_LOGO, fill=(255, 217, 119, 245))

        draw_centered_text(draw, 640, 32, "Free Avatar Studio", FONT_HERO, gold)
        draw_centered_text(draw, 640, 94, "أداة إعلانات أفاتار مجانية بالكامل", FONT_BODY, (255, 255, 255, 215))

        paste_talking_avatar(frame, avatar_image, (72, 132, 570, 630), t)
        paste_framed_image(frame, product_image, (710, 132, 1208, 630))

        draw.rounded_rectangle((91, 585, 551, 620), radius=18, fill=(32, 10, 60, 185))
        draw.rounded_rectangle((729, 585, 1189, 620), radius=18, fill=(32, 10, 60, 185))
        draw_centered_text(draw, 321, 588, "Avatar Presenter", FONT_SMALL, (255, 255, 255, 225), shadow=False)
        draw_centered_text(draw, 959, 588, "Product Offer", FONT_SMALL, (255, 255, 255, 225), shadow=False)

        draw_word_caption(draw, script_words, t, duration)

        bar_y1, bar_y2 = 612, 704
        draw.rounded_rectangle((54, bar_y1, 1226, bar_y2), radius=30, fill=(20, 8, 39, 235), outline=(236, 196, 92, 180), width=2)

        progress = min(1, max(0, t / max(duration, 0.01)))
        draw.rounded_rectangle((70, 689, 70 + int(1140 * progress), 695), radius=4, fill=gold)

        title = product_name or "Your Product"
        title_w = text_width(draw, title, FONT_PRODUCT)
        start_x = 1280
        end_x = 640 - title_w / 2
        slide_progress = min(1, t / 1.2)
        eased = 1 - (1 - slide_progress) ** 3
        title_x = start_x * (1 - eased) + end_x * eased
        draw.text((title_x + 4, 630), title, font=FONT_PRODUCT, fill=(0, 0, 0, 160))
        draw.text((title_x, 626), title, font=FONT_PRODUCT, fill=gold)

        return np.array(frame.convert("RGB"))

    return make_frame


def make_video_clip(make_frame, duration):
    try:
        return VideoClip(frame_function=make_frame, duration=duration)
    except TypeError:
        return VideoClip(make_frame=make_frame, duration=duration)


def trim_audio_clip(audio_clip, duration):
    if getattr(audio_clip, "duration", None) and audio_clip.duration > duration:
        if hasattr(audio_clip, "subclipped"):
            return audio_clip.subclipped(0, duration)
        return audio_clip.subclip(0, duration)
    return audio_clip


def attach_audio(video_clip, audio_clip):
    if hasattr(video_clip, "with_audio"):
        return video_clip.with_audio(audio_clip)
    return video_clip.set_audio(audio_clip)


def write_video(video_clip, output_path):
    kwargs = {
        "fps": 24,
        "codec": "libx264",
        "audio_codec": "aac",
        "preset": "medium",
        "threads": 2,
        "logger": None,
    }
    video_clip.write_videofile(str(output_path), **kwargs)


def generate_ad_video(product_image_path, avatar_path, product_name, script, language, duration, job_id):
    trimmed_script = trim_script_for_duration(script, language, duration)
    audio_path = GENERATED_DIR / f"{job_id}.mp3"
    output_path = GENERATED_DIR / f"{job_id}.mp4"

    language_config = LANGUAGES.get(language, LANGUAGES["en"])
    gTTS(text=trimmed_script, lang=language_config["gtts"], slow=False).save(str(audio_path))

    make_frame = build_frame_factory(avatar_path, product_image_path, product_name, trimmed_script, duration)
    video_clip = make_video_clip(make_frame, duration)
    audio_clip = AudioFileClip(str(audio_path))
    audio_clip = trim_audio_clip(audio_clip, duration)
    video_clip = attach_audio(video_clip, audio_clip)

    try:
        write_video(video_clip, output_path)
    finally:
        video_clip.close()
        audio_clip.close()

    return output_path, trimmed_script


@app.route("/")
def index():
    return render_template("index.html", avatars=AVATARS, languages=LANGUAGES)


@app.post("/generate")
def generate():
    product_name = request.form.get("product_name", "").strip()[:80]
    script = request.form.get("script", "").strip()
    avatar_id = (request.form.get("avatar") or request.form.get("avatar_id") or "").strip()
    language = request.form.get("language", "ar").strip()
    product_image_url = request.form.get("product_image_url", "").strip()

    try:
        duration = int(request.form.get("duration", "25"))
    except ValueError:
        return jsonify({"error": "Duration must be a number."}), 400

    duration = min(40, max(15, duration))

    if not script:
        return jsonify({"error": "Please enter a product script."}), 400
    if language not in LANGUAGES:
        return jsonify({"error": "Unsupported language selected."}), 400

    avatar = next((item for item in AVATARS if item["id"] == avatar_id), None)
    if avatar is None:
        return jsonify({"error": "Please select a valid avatar."}), 400

    avatar_path = AVATAR_DIR / avatar["file"]
    if not avatar_path.exists():
        return jsonify({"error": f"Avatar image is missing: {avatar['file']}. Run scripts/download_avatars.py."}), 500

    job_id = uuid.uuid4().hex
    upload = request.files.get("product_image")
    product_image_path = UPLOAD_DIR / f"{job_id}.jpg"

    try:
        if upload and upload.filename:
            if not allowed_image(upload.filename):
                return jsonify({"error": "Upload a PNG, JPG, JPEG, or WEBP product image."}), 400
            filename = secure_filename(upload.filename)
            extension = filename.rsplit(".", 1)[1].lower()
            product_image_path = UPLOAD_DIR / f"{job_id}.{extension}"
            upload.save(product_image_path)
            validate_saved_image(product_image_path)
        elif product_image_url:
            download_product_image(product_image_url, product_image_path)
        else:
            create_product_placeholder(product_image_path, product_name or "عرض خاص")
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Could not prepare product image: {exc}"}), 400

    try:
        output_path, trimmed_script = generate_ad_video(
            product_image_path=product_image_path,
            avatar_path=avatar_path,
            product_name=product_name or "عرض خاص",
            script=script,
            language=language,
            duration=duration,
            job_id=job_id,
        )
    except Exception as exc:
        return jsonify({"error": f"Video generation failed: {exc}"}), 500

    return jsonify(
        {
            "video_url": url_for("download_video", filename=output_path.name),
            "download_url": url_for("download_video", filename=output_path.name, download=1),
            "trimmed_script": trimmed_script,
            "duration": duration,
        }
    )


@app.get("/download/<path:filename>")
def download_video(filename):
    as_attachment = request.args.get("download") == "1"
    return send_from_directory(GENERATED_DIR, filename, as_attachment=as_attachment)


if __name__ == "__main__":
    debug_enabled = os.environ.get("FLASK_DEBUG", "").lower() in {"1", "true", "yes"}
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5000")), debug=debug_enabled)
