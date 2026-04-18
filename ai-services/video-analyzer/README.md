# Video Analyzer Service (FastAPI)

Production-oriented Python microservice for AI video analysis.

## Run

1. Create venv and install deps:

```bash
pip install -r requirements.txt
```

2. Start service:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8010 --reload
```

## Endpoints

- GET /health
- POST /analyze

Example request:

```json
{
  "video_path": "video.mp4",
  "ideal_pose": [0.1, 0.2, 0.3],
  "technique": "tan-co-ban"
}
```

## Train Form-Check Model

Run from `ai-services/video-analyzer/`:

```bash
python train_form_model.py --out ./models/form_check_model.json
```

Optional dataset (JSONL):

```json
{"technique":"tan-co-ban","pose":[0.5,0.2,0.9,...]}
{"technique":"dam-thang","pose":[0.48,0.19,0.93,...]}
```

When the model file exists, `/analyze` will use trained technique profiles automatically.
