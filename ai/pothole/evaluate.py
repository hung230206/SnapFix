"""Evaluate trained pothole detector weights and save metric artifacts."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import torch


ROOT = Path(__file__).resolve().parent
ULTRALYTICS_CONFIG = ROOT / ".ultralytics"
ULTRALYTICS_CONFIG.mkdir(parents=True, exist_ok=True)
os.environ.setdefault("YOLO_CONFIG_DIR", str(ULTRALYTICS_CONFIG))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--weights", type=Path, required=True)
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--split", choices=("val", "test"), default="val")
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=4)
    parser.add_argument("--device", default="auto")
    parser.add_argument("--workers", type=int, default=2)
    parser.add_argument("--project", type=Path, default=ROOT / "runs" / "evaluate")
    parser.add_argument("--name", default="validation")
    return parser.parse_args()


def main() -> None:
    from ultralytics import YOLO

    args = parse_args()
    device: str | int = 0 if args.device == "auto" and torch.cuda.is_available() else args.device
    if device == "auto":
        device = "cpu"
        print("WARNING: CUDA is unavailable; evaluation will run on CPU.")

    metrics = YOLO(str(args.weights.resolve())).val(
        data=str(args.data.resolve()),
        split=args.split,
        imgsz=args.imgsz,
        batch=args.batch,
        device=device,
        workers=args.workers,
        project=str(args.project.resolve()),
        name=args.name,
        plots=True,
    )
    values = {key: float(value) for key, value in metrics.results_dict.items()}
    payload = {
        "precision": values.get("metrics/precision(B)"),
        "recall": values.get("metrics/recall(B)"),
        "map50": values.get("metrics/mAP50(B)"),
        "map50_95": values.get("metrics/mAP50-95(B)"),
        "all_metrics": values,
        "save_dir": str(Path(metrics.save_dir).resolve()),
    }
    output = Path(metrics.save_dir) / "metrics.json"
    output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
