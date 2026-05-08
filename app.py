from __future__ import annotations

import hashlib
import math
import os
import re
import textwrap
import time
from pathlib import Path

import imageio.v3 as iio
import numpy as np
from flask import Flask, jsonify, render_template, request, send_from_directory, url_for
from PIL import Image, ImageDraw, ImageFont


BASE_DIR = Path(__file__).resolve().parent
VIDEO_DIR = BASE_DIR / "generated_videos"
VIDEO_DIR.mkdir(exist_ok=True)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 32 * 1024


def _font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    """Load a widely available font with a safe fallback."""
    candidates = (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    )
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def _safe_slug(text: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return (slug[:42] or "demo-video").strip("-")


def _wrap_lines(text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current: list[str] = []
    canvas = Image.new("RGB", (10, 10))
    draw = ImageDraw.Draw(canvas)

    for word in words:
        candidate = " ".join([*current, word])
        left, _, right, _ = draw.textbbox((0, 0), candidate, font=font)
        if current and right - left > max_width:
            lines.append(" ".join(current))
            current = [word]
        else:
            current.append(word)

    if current:
        lines.append(" ".join(current))

    if not lines:
        return ["Your product"]

    # Keep the hero text readable; add an ellipsis if the input is very long.
    if len(lines) > 6:
        lines = lines[:6]
        lines[-1] = textwrap.shorten(lines[-1], width=52, placeholder="...")
    return lines


def _ease_out_cubic(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return 1 - pow(1 - value, 3)


def _gradient_background(width: int, height: int, frame: int, total_frames: int) -> Image.Image:
    progress = frame / max(total_frames - 1, 1)
    x = np.linspace(0, 1, width, dtype=np.float32)
    y = np.linspace(0, 1, height, dtype=np.float32)
    xx, yy = np.meshgrid(x, y)

    pulse = 0.5 + 0.5 * math.sin(progress * math.tau)
    color_a = np.array([34 + 30 * pulse, 44, 110 + 35 * pulse], dtype=np.float32)
    color_b = np.array([104, 42 + 45 * pulse, 172], dtype=np.float32)
    color_c = np.array([13, 177 - 35 * pulse, 193], dtype=np.float32)

    blend = (xx * 0.65 + yy * 0.35)[..., None]
    image = color_a * (1 - blend) + color_b * blend
    radial = np.clip(1 - np.sqrt((xx - 0.74) ** 2 + (yy - 0.28) ** 2) * 1.8, 0, 1)[..., None]
    image = image * (1 - radial * 0.55) + color_c * (radial * 0.55)
    return Image.fromarray(np.uint8(np.clip(image, 0, 255)), mode="RGB")


def _draw_centered_text(
    draw: ImageDraw.ImageDraw,
    lines: list[str],
    font: ImageFont.ImageFont,
    center_x: int,
    start_y: int,
    fill: tuple[int, int, int, int],
    line_gap: int,
) -> None:
    y = start_y
    for line in lines:
        left, top, right, bottom = draw.textbbox((0, 0), line, font=font)
        draw.text((center_x - (right - left) / 2, y), line, font=font, fill=fill)
        y += (bottom - top) + line_gap


def generate_demo_video(description: str) -> Path:
    width, height = 1280, 720
    fps = 24
    duration_seconds = 7
    total_frames = fps * duration_seconds

    cleaned = re.sub(r"\s+", " ", description).strip()
    digest = hashlib.sha256(f"{cleaned}-{time.time_ns()}".encode("utf-8")).hexdigest()[:10]
    filename = f"{_safe_slug(cleaned)}-{digest}.mp4"
    output_path = VIDEO_DIR / filename

    title_font = _font(64)
    body_font = _font(42)
    small_font = _font(28)
    lines = _wrap_lines(cleaned, body_font, max_width=980)

    frames: list[np.ndarray] = []
    for index in range(total_frames):
        t = index / fps
        progress = index / max(total_frames - 1, 1)
        frame = _gradient_background(width, height, index, total_frames).convert("RGBA")
        overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        # Animated decorative shapes give the clip motion even for short text.
        for i, color in enumerate(((255, 255, 255, 38), (0, 229, 255, 58), (255, 181, 71, 48))):
            angle = progress * math.tau + i * 2.1
            radius = 34 + i * 22
            cx = int(width * (0.18 + 0.65 * ((math.sin(angle) + 1) / 2)))
            cy = int(height * (0.20 + 0.58 * ((math.cos(angle * 0.8) + 1) / 2)))
            draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=color)

        card_alpha = int(185 + 35 * math.sin(progress * math.tau))
        draw.rounded_rectangle((110, 105, 1170, 615), radius=42, fill=(8, 14, 38, card_alpha))

        title_alpha = int(255 * _ease_out_cubic(t / 1.0))
        title_y = int(142 - 24 * (1 - _ease_out_cubic(t / 1.0)))
        _draw_centered_text(
            draw,
            ["AI Video Studio Demo"],
            title_font,
            width // 2,
            title_y,
            (255, 255, 255, title_alpha),
            8,
        )

        text_alpha = int(255 * _ease_out_cubic((t - 0.7) / 1.2))
        text_y = int(260 + 34 * (1 - _ease_out_cubic((t - 0.7) / 1.2)))
        _draw_centered_text(
            draw,
            lines,
            body_font,
            width // 2,
            text_y,
            (244, 248, 255, text_alpha),
            14,
        )

        progress_width = int(860 * _ease_out_cubic(progress))
        draw.rounded_rectangle((210, 558, 1070, 572), radius=7, fill=(255, 255, 255, 55))
        draw.rounded_rectangle((210, 558, 210 + progress_width, 572), radius=7, fill=(47, 231, 255, 220))

        cta_alpha = int(235 * _ease_out_cubic((t - 3.6) / 1.0))
        _draw_centered_text(
            draw,
            ["Generated locally - no external AI API required"],
            small_font,
            width // 2,
            596,
            (214, 244, 255, cta_alpha),
            4,
        )

        combined = Image.alpha_composite(frame, overlay).convert("RGB")
        frames.append(np.asarray(combined))

    iio.imwrite(
        output_path,
        frames,
        fps=fps,
        codec="libx264",
        pixelformat="yuv420p",
        macro_block_size=1,
    )
    return output_path


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/generate")
def generate():
    payload = request.get_json(silent=True) or request.form.to_dict() or {}
    description = str(
        payload.get("description")
        or payload.get("productDescription")
        or payload.get("prompt")
        or ""
    ).strip()

    if not description:
        return jsonify({"success": False, "error": "Product description is required."}), 400

    if len(description) > 1200:
        return jsonify({"success": False, "error": "Description must be 1200 characters or fewer."}), 400

    try:
        video_path = generate_demo_video(description)
    except Exception as exc:  # pragma: no cover - returned as JSON for browser callers
        app.logger.exception("Local video generation failed")
        return jsonify({"success": False, "error": f"Video generation failed: {exc}"}), 500

    return jsonify(
        {
            "success": True,
            "message": "Video generated locally.",
            "filename": video_path.name,
            "videoUrl": url_for("video_file", filename=video_path.name),
            "downloadUrl": url_for("download_file", filename=video_path.name),
        }
    )


@app.get("/videos/<path:filename>")
def video_file(filename: str):
    return send_from_directory(VIDEO_DIR, filename, mimetype="video/mp4", as_attachment=False)


@app.get("/download/<path:filename>")
def download_file(filename: str):
    return send_from_directory(VIDEO_DIR, filename, mimetype="video/mp4", as_attachment=True)


@app.errorhandler(404)
def not_found(error):
    if request.path.startswith("/api/"):
        return jsonify({"success": False, "error": "API route not found."}), 404
    return error


@app.errorhandler(405)
def method_not_allowed(error):
    if request.path.startswith("/api/"):
        return jsonify({"success": False, "error": "Method not allowed."}), 405
    return error


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)
