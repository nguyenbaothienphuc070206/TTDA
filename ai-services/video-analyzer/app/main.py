from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List

from .pose_worker import analyze_video_file
from .scoring import calculate_score, build_feedback

app = FastAPI(title="Vovinam Video Analyzer", version="0.1.0")


class AnalyzeRequest(BaseModel):
    video_path: str = Field(min_length=3)
    ideal_pose: List[float] = Field(default_factory=list)
    technique: str = Field(default="tan-co-ban")


@app.get("/health")
def health_check():
    return {"ok": True, "service": "video-analyzer"}


@app.post("/analyze")
def analyze_video(req: AnalyzeRequest):
    user_pose = analyze_video_file(req.video_path)
    score = calculate_score(user_pose, req.ideal_pose, req.technique)
    feedback = build_feedback(user_pose, req.ideal_pose, req.technique)

    return {
        "ok": True,
        "score": score,
        "feedback": feedback,
        "frames": len(user_pose),
    }
