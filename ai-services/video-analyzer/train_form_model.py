#!/usr/bin/env python3
"""
Train a lightweight form-check profile model from pose vectors.

Usage:
  python train_form_model.py
  python train_form_model.py --dataset ./data/form_check_dataset.jsonl --out ./models/form_check_model.json
"""

import argparse
import json
import random
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List


TECHNIQUE_TIPS = {
    "tan-co-ban": [
        "Uu tien giu truc dau-vai-hong thang hang trong suot bai.",
        "Mo tan vua du, tranh qua hep hoac qua rong.",
        "Giu nhip tho deu va ha tam o muc an toan cho goi.",
    ],
    "dam-thang": [
        "Giu tay guard ngang cam khi tay con lai phat don.",
        "Ra don theo truc thang va thu tay ve nhanh.",
        "Trach giong vai, uu tien truyen luc tu hong.",
    ],
    "da-tong-ngang": [
        "Gap nhe goi chan tru de giu can bang khi da.",
        "Khoa hong o diem cham roi thu chan ve guard.",
        "Tang toc do sau khi da lam chu duoc bien do.",
    ],
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train form-check profile model")
    parser.add_argument("--dataset", default="", help="Path to JSONL dataset")
    parser.add_argument(
        "--out",
        default="./models/form_check_model.json",
        help="Output model JSON path",
    )
    parser.add_argument(
        "--seed-size",
        type=int,
        default=120,
        help="Number of synthetic rows to generate when dataset is missing",
    )
    return parser.parse_args()


def _avg(vectors: List[List[float]]) -> List[float]:
    if not vectors:
        return []

    size = len(vectors[0])
    out = [0.0] * size
    for vec in vectors:
        for i in range(size):
            out[i] += float(vec[i])

    n = float(len(vectors))
    return [x / n for x in out]


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


def _jitter(base: List[float], sigma: float) -> List[float]:
    row = []
    for val in base:
        row.append(float(val) + random.gauss(0.0, sigma))
    return row


def generate_seed_rows(seed_size: int) -> List[Dict]:
    random.seed(42)

    # 36 dims = 12 landmarks x (x,y,visibility)
    base_profiles = {
        "tan-co-ban": [
            0.50, 0.18, 0.99, 0.48, 0.17, 0.98, 0.52, 0.17, 0.98, 0.46, 0.18, 0.97,
            0.54, 0.18, 0.97, 0.44, 0.20, 0.96, 0.56, 0.20, 0.96, 0.43, 0.30, 0.97,
            0.57, 0.30, 0.97, 0.42, 0.42, 0.96, 0.58, 0.42, 0.96, 0.41, 0.53, 0.95,
        ],
        "dam-thang": [
            0.50, 0.17, 0.99, 0.48, 0.16, 0.98, 0.52, 0.16, 0.98, 0.46, 0.17, 0.97,
            0.54, 0.17, 0.97, 0.43, 0.19, 0.95, 0.57, 0.19, 0.95, 0.42, 0.30, 0.97,
            0.58, 0.30, 0.97, 0.41, 0.41, 0.96, 0.59, 0.41, 0.96, 0.40, 0.52, 0.95,
        ],
        "da-tong-ngang": [
            0.50, 0.16, 0.99, 0.48, 0.15, 0.98, 0.52, 0.15, 0.98, 0.46, 0.16, 0.97,
            0.54, 0.16, 0.97, 0.44, 0.18, 0.96, 0.56, 0.18, 0.96, 0.43, 0.29, 0.97,
            0.57, 0.29, 0.97, 0.41, 0.39, 0.95, 0.60, 0.37, 0.95, 0.40, 0.50, 0.94,
        ],
    }

    rows = []
    per_tech = max(12, seed_size // max(1, len(base_profiles)))
    for technique, base in base_profiles.items():
        for _ in range(per_tech):
            rows.append(
                {
                    "technique": technique,
                    "pose": _jitter(base, sigma=0.012),
                }
            )

    return rows


def load_rows(dataset_path: str, seed_size: int) -> List[Dict]:
    path = Path(dataset_path) if dataset_path else None

    if not path or not path.exists():
        return generate_seed_rows(seed_size)

    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except Exception:
            continue

        technique = str(obj.get("technique") or "tan-co-ban").strip() or "tan-co-ban"
        pose = obj.get("pose")
        if not isinstance(pose, list) or len(pose) < 6:
            continue

        rows.append({"technique": technique, "pose": [float(x) for x in pose]})

    if rows:
        return rows

    return generate_seed_rows(seed_size)


def train(rows: List[Dict]) -> Dict:
    grouped: Dict[str, List[List[float]]] = defaultdict(list)

    for row in rows:
        grouped[row["technique"]].append(row["pose"])

    techniques = {}
    for technique, vectors in grouped.items():
        centroid = _avg(vectors)
        if not centroid:
            continue

        err_values = [_mean_abs_error(vec, centroid) for vec in vectors]
        mean_err = sum(err_values) / max(1, len(err_values))

        techniques[technique] = {
            "samples": len(vectors),
            "vector_size": len(centroid),
            "centroid": centroid,
            "mean_abs_error": round(float(mean_err), 6),
            "tips": TECHNIQUE_TIPS.get(technique, [
                "Giu dung truc co the va tap cham de on dinh ky thuat.",
                "Uu tien an toan va kiem soat nhip tho.",
            ]),
        }

    return {
        "version": "form-check-profile-v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "techniques": techniques,
    }


def main() -> int:
    args = parse_args()
    rows = load_rows(args.dataset, args.seed_size)
    model = train(rows)

    out_path = Path(args.out).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(model, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Rows used: {len(rows)}")
    print(f"Techniques trained: {len(model.get('techniques', {}))}")
    print(f"Model saved: {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
