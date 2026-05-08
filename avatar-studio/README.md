# Shoplina Video Studio

Standalone Flask app for creating AI avatar advertising videos with D-ID Talks.

## Features

- Product image upload with drag-and-drop preview.
- Product script editor and automatic script generator.
- Six-step RTL Arabic wizard with a purple and gold dark theme.
- Six hardcoded D-ID presenter avatar cards.
- Language choices: Arabic Gulf, Arabic Morocco, English, and French.
- Duration slider from 15 to 40 seconds.
- D-ID `/talks` integration with status polling.
- Video preview and download button when generation completes.
- Settings page that saves the D-ID API key to `config.json`.

## Run locally

```bash
cd avatar-studio
pip install -r requirements.txt
python app.py
```

Open <http://localhost:5000>, then visit `/settings` to save your D-ID API key.
