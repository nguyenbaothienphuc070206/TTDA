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
  "ideal_pose": [0.1, 0.2, 0.3]
}
```
