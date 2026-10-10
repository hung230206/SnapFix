"""Fine-tune a pretrained Ultralytics YOLO detector for potholes."""

from __future__ import annotations

import argparse
from contextlib import chdir
import json
import os
from pathlib import Path
from typing import Any

import torch
import yaml


ROOT = Path(__file__).resolve().parent
DEFAULT_CONFIG = ROOT / "configs" / "train.yaml"
ULTRALYTICS_CONFIG = ROOT / ".ultralytics"
ULTRALYTICS_CONFIG.mkdir(parents=True, exist_ok=True)
os.environ.setdefault("YOLO_CONFIG_DIR", str(ULTRALYTICS_CONFIG))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--data", type=Path)
    parser.add_argument("--model")
    parser.add_argument("--epochs", type=int)
    parser.add_argument("--batch", type=int)
    parser.add_argument("--imgsz", type=int)
    parser.add_argument("--device")
    parser.add_argument("--workers", type=int)
    parser.add_argument("--amp", action=argparse.BooleanOptionalAction, default=None)
    parser.add_argument("--name")
    return parser.parse_args()


def load_config(path: Path) -> dict[str, Any]:
    config_path = path.resolve()
    with config_path.open(encoding="utf-8") as config_file:
        config = yaml.safe_load(config_file) or {}

    for key in ("data", "project"):
        value = config.get(key)
        if value and not Path(value).is_absolute():
            config[key] = str((config_path.parent / value).resolve())
    return config


def resolve_device(requested: str | int) -> str | int:
    if str(requested).lower() != "auto":
        return requested
    if torch.cuda.is_available():
        return 0
    print("WARNING: CUDA is unavailable; training will run on CPU and may be slow.")
    return "cpu"


def print_runtime(device: str | int) -> None:
    print(f"PyTorch: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available() and str(device) != "cpu":
        properties = torch.cuda.get_device_properties(int(device))
        total_gib = properties.total_memory / 1024**3
        free_bytes, _ = torch.cuda.mem_get_info(int(device))
        print(f"GPU: {properties.name}")
        print(f"VRAM: {free_bytes / 1024**3:.2f} GiB free / {total_gib:.2f} GiB total")


def serializable_metrics(results: Any) -> dict[str, float]:
    metrics = getattr(results, "results_dict", {}) or {}
    return {
        str(key): float(value)
        for key, value in metrics.items()
        if isinstance(value, (int, float)) or hasattr(value, "item")
    }


def main() -> None:
    from ultralytics import YOLO, settings

    args = parse_args()
    config = load_config(args.config)

    for key in ("data", "model", "epochs", "batch", "imgsz", "device", "workers", "amp", "name"):
        value = getattr(args, key)
        if value is not None:
            config[key] = str(value.resolve()) if key == "data" else value

    config["device"] = resolve_device(config.get("device", "auto"))
    print_runtime(config["device"])
    print(f"Dataset config: {config['data']}")
    print(f"Pretrained model: {config['model']}")

    model_name = config.pop("model")
    models_dir = ROOT / "models"
    models_dir.mkdir(parents=True, exist_ok=True)
    settings.update({"weights_dir": str(models_dir)})

    model_path = Path(model_name)
    if model_path.suffix == ".pt" and model_path.parent == Path("."):
        local_model_path = models_dir / model_path.name
        if local_model_path.exists():
            model = YOLO(str(local_model_path))
        else:
            with chdir(models_dir):
                model = YOLO(model_path.name)
    else:
        model = YOLO(model_name)
    results = model.train(
        **config,
        pretrained=True,
        plots=True,
        save=True,
        deterministic=True,
    )

    save_dir = Path(results.save_dir)
    best_path = save_dir / "weights" / "best.pt"
    summary = {
        "save_dir": str(save_dir.resolve()),
        "best_weights": str(best_path.resolve()),
        "class_names": model.names,
        "metrics": serializable_metrics(results),
    }
    summary_path = save_dir / "training-summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
