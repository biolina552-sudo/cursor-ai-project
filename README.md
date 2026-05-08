# AI Video Studio

A self-contained demo video generator that runs locally without external AI APIs.

## Run locally

```bash
python3 -m pip install -r requirements.txt
python3 app.py
```

Open `http://localhost:5000`, enter a product description, and generate an MP4.

## API

`POST /api/generate`

```json
{ "description": "A lightweight travel mug that keeps coffee hot for 12 hours." }
```

The server responds with JSON containing `videoUrl` and `downloadUrl`. Generated
videos are written to `generated_videos/`.