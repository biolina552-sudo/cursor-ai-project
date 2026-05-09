# Free Avatar Studio

A Flask tool for creating real talking-avatar advertising videos with the HeyGen API.

## What it does

- Save a HeyGen API key from the Settings dialog.
- Fetch HeyGen avatars from `GET /v2/avatars`.
- Fetch HeyGen voices from `GET /v2/voices`, with Arabic voices prioritized in the UI.
- Write an Arabic, English, or French product script.
- Generate a real talking-avatar video through `POST /v2/video/generate`.
- Poll `GET /v1/video_status.get?video_id=...` until HeyGen returns the final video URL.

## Setup

```bash
cd free-avatar-studio
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
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

- This project now uses Flask + Requests to proxy HeyGen API calls.
- The API key is stored locally in `config.json`, which is ignored by git.
- The `/generate` API accepts either `avatar` or `avatar_id` for the selected HeyGen avatar.
- Generated video files are hosted by HeyGen; the app returns HeyGen's final video URL.
