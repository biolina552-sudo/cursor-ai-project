# AI Video Studio

A small web and command-line tool for generating videos with artificial
intelligence. The tool submits a text prompt to an AI video model, waits for the
prediction to finish, downloads the generated video file, and can preview it in a
modern web interface.

The default provider is [Replicate](https://replicate.com), because it exposes
many text-to-video models behind one HTTP API. You can change the model and pass
model-specific inputs from the command line or web server options.

## Requirements

- Python 3.11 or newer
- A Replicate API token in `REPLICATE_API_TOKEN`

## Installation

```bash
python3 -m pip install -e .
```

## Configure your Replicate token

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit `.env` and replace the placeholder with your real token:

```bash
REPLICATE_API_TOKEN=r8_your_real_token_here
```

The application loads `.env` automatically. The real `.env` file is ignored by
Git so the token is not committed.

## Web interface

Start the web studio:

```bash
ai-video-web
```

Open the browser at:

```text
http://127.0.0.1:8000
```

The interface includes:

- A prompt field for describing the video
- Language selection for Moroccan Darija, Gulf Arabic, English, and French
- A generate button
- A video preview panel
- A download link for the finished video

You can customize the server:

```bash
ai-video-web --host 0.0.0.0 --port 8080 --model minimax/video-01
```

Generated files are stored in `generated-videos/`.

## Command-line usage

```bash
ai-video generate "A cinematic drone shot over a neon city at night" \
  --model minimax/video-01 \
  --output city.mp4
```

Pass model-specific inputs with `--param`:

```bash
ai-video generate "A red panda surfing a wave" \
  --model minimax/video-01 \
  --param duration=5 \
  --param fps=24 \
  --output red-panda.mp4
```

For models that require a pinned version, provide `--version`:

```bash
ai-video generate "A watercolor animation of clouds forming a castle" \
  --version owner/model:version_hash \
  --output castle.mp4
```

You can also pass a JSON object of model inputs. Command-line `--param` values
override keys from `--input-json`.

```bash
ai-video generate "A robot gardener watering flowers" \
  --input-json '{"duration": 6, "aspect_ratio": "16:9"}' \
  --output robot-gardener.mp4
```

## Development

Run the test suite:

```bash
PYTHONPATH=src python3 -m unittest discover -s tests
```