"""Run local inference on one image and emit structured JSON detections."""

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
    parser.add_argument("image", type=Path)
    parser.add_argument("--weights", type=Path, required=True)
    parser.add_argument("--conf", "--confidence", dest="confidence", type=float, default=0.25)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--device", default="auto")
    parser.add_argument("--output", type=Path)
    parser.add_argument(
        "--save",
        action="store_true",
        help="Save an annotated copy of the input image under runs/predict/.",
    )
    return parser.parse_args()


def get_model_name(weights: Path) -> str:
    """Derive a stable output directory name from an Ultralytics run or weight file."""
    if weights.parent.name == "weights":
        return weights.parent.parent.name
    return weights.stem


def get_visualization_path(image: Path, weights: Path) -> Path:
    return ROOT / "runs" / "predict" / get_model_name(weights) / image.name


def main() -> None:
    from ultralytics import YOLO

    args = parse_args()
    device: str | int = 0 if args.device == "auto" and torch.cuda.is_available() else args.device
    if device == "auto":
        device = "cpu"

    result = YOLO(str(args.weights.resolve())).predict(
        source=str(args.image.resolve()),
        conf=args.confidence,
        imgsz=args.imgsz,
        device=device,
        verbose=False,
    )[0]

    detections = []
    if result.boxes is not None:
        for box, confidence, class_id in zip(
            result.boxes.xyxy.cpu().tolist(),
            result.boxes.conf.cpu().tolist(),
            result.boxes.cls.cpu().tolist(),
            strict=True,
        ):
            detections.append(
                {
                    "class": result.names[int(class_id)],
                    "confidence": round(float(confidence), 6),
                    "bbox": [round(float(coordinate), 2) for coordinate in box],
                }
            )

    payload = {"detections": detections}
    rendered = json.dumps(payload, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")

    if args.save:
        visualization_path = get_visualization_path(args.image, args.weights)
        visualization_path.parent.mkdir(parents=True, exist_ok=True)
        result.save(filename=str(visualization_path))

    print(rendered)


if __name__ == "__main__":
    main()
