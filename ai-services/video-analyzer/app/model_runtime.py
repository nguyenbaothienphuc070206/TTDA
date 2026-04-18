import json
import os
from pathlib import Path
from typing import Dict, List, Optional

_CACHE: Optional[Dict] = None


def _mean_abs_error(vec_a: List[float], vec_b: List[float]) -> float:
    if not vec_a or not vec_b:
        return 1.0

    limit = min(len(vec_a), len(vec_b))
    if limit <= 0:
        return 1.0

    err = 0.0
    for i in range(limit):
        err += abs(float(vec_a[i]) - float(vec_b[i]))

    return err / float(limit)


def _default_model_path() -> Path:
    here = Path(__file__).resolve()
    return here.parent.parent / "models" / "form_check_model.json"


def load_form_check_model() -> Optional[Dict]:
    global _CACHE
    if _CACHE is not None:
        return _CACHE

    raw = str(os.getenv("FORM_CHECK_MODEL_PATH", "")).strip()
    path = Path(raw) if raw else _default_model_path()

    if not path.exists():
        _CACHE = None
        return None

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            _CACHE = None
            return None

        techniques = data.get("techniques")
        if not isinstance(techniques, dict) or not techniques:
            _CACHE = None
            return None

        _CACHE = data
        return _CACHE
    except Exception:
        _CACHE = None
        return None


def predict_with_trained_model(user_pose: List[float], technique: str) -> Optional[Dict]:
    if not user_pose:
        return None

    model = load_form_check_model()
    if not model:
        return None

    techniques = model.get("techniques", {})
    key = str(technique or "tan-co-ban").strip() or "tan-co-ban"

    profile = techniques.get(key) or techniques.get("tan-co-ban")
    if not isinstance(profile, dict):
        return None

    centroid = profile.get("centroid")
    if not isinstance(centroid, list) or not centroid:
        return None

    err = _mean_abs_error(user_pose, centroid)

    # Convert error into score. Trained threshold keeps scoring stable.
    threshold = float(profile.get("mean_abs_error") or 0.12)
    safe_threshold = max(0.04, threshold)
    score = round(100 - (err / safe_threshold) * 35)
    score = int(max(0, min(100, score)))

    feedback = []
    tips = profile.get("tips")
    if isinstance(tips, list):
        for tip in tips[:4]:
            text = str(tip or "").strip()
            if text:
                feedback.append(text)

    if err > safe_threshold * 1.3:
        feedback.insert(0, "Sai so pose cao hon profile mau; nen tap cham de chuan hoa bien do.")
    elif err < safe_threshold * 0.8:
        feedback.insert(0, "Pose gan profile mau. Hay giu nhip tho va thu tang toc do nhe.")

    return {
        "score": score,
        "error": round(err, 6),
        "feedback": feedback,
    }
