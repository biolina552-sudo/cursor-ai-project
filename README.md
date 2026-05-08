# AI Video Tool

A small command-line tool for generating videos with artificial intelligence.
The tool submits a text prompt to an AI video model, waits for the prediction to
finish, and downloads the generated video file.

The default provider is [Replicate](https://replicate.com), because it exposes
many text-to-video models behind one HTTP API. You can change the model and pass
model-specific inputs from the command line.

## Requirements

- Python 3.11 or newer
- A Replicate API token in `REPLICATE_API_TOKEN`

## Installation

```bash
python3 -m pip install -e .
```

## Usage

```bash
export REPLICATE_API_TOKEN="r8_..."

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