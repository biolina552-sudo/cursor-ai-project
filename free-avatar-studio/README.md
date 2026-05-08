# Free Avatar Studio

A fully free Flask tool for creating avatar-style advertising videos with no paid APIs.

## What it does

- Upload a product image.
- Write an Arabic, English, or French product script.
- Select one of 8 bundled avatar presenter photos.
- Choose a 15-40 second duration.
- Generate an MP4 video with:
  - Avatar photo on the left.
  - Product image on the right.
  - Animated product name bar.
  - Dark purple/gold visual style.
  - gTTS voiceover reading the script.

## Setup

```bash
cd free-avatar-studio
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python scripts/download_avatars.py
python app.py
```

Then open `http://127.0.0.1:5000`.

## Cloudflare tunnel

If `cloudflared` is available:

```bash
cloudflared tunnel --url http://127.0.0.1:5000
```

Use the printed `trycloudflare.com` URL to test from a browser.

## Notes

- This project uses gTTS, MoviePy, Flask, and Pillow only.
- gTTS is a free text-to-speech package and does not require an API key.
- Generated videos are saved under `static/generated/`.
- Uploaded product images are saved under `static/uploads/`.
