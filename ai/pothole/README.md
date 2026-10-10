# SnapFix pothole detection

This directory contains an isolated Ultralytics YOLO11 pipeline for one-class
`Pothole` object detection. It is not connected to the SnapFix web app.

## Local setup

Create a virtual environment and install the dependencies:

```powershell
python -m venv .venv-pothole
.\.venv-pothole\Scripts\python.exe -m pip install -r ai\pothole\requirements.txt
```

On Windows, the requirements select the official PyTorch CUDA 13.0 wheels used
by the target RTX 3050 laptop. Verify `torch.cuda.is_available()` before
training; do not silently fall back to CPU for the normal training run.

Place a consistently annotated YOLO object-detection dataset at:

```text
ai/pothole/data/pothole-1class-v1/
```

The expected class mapping is defined by that dataset's YAML:

```text
0: Pothole
```

Dataset files, run outputs, and model weights are intentionally ignored by Git.
If an exported `data.yaml` has incorrect paths, copy
`configs/dataset.example.yaml` into the ignored dataset directory, name it
`snapfix-data.yaml`, and set `path` to the absolute dataset directory.

## Train

The shared configuration uses pretrained `yolo11n.pt`, 640 px images, batch 4,
and CUDA device 0 when available. It deliberately contains no default dataset.
Every training run must provide `--data` or a separate config with a `data`
entry, which prevents accidentally training the archived reference dataset.

Run an explicit one-epoch smoke test first:

```powershell
.\.venv-pothole\Scripts\python.exe ai\pothole\train.py `
  --data ai\pothole\data\pothole-1class-v1\data.yaml `
  --epochs 1 `
  --name smoke-pothole-1class
```

After the smoke test and dataset audit pass, start the configured 80-epoch run:

```powershell
.\.venv-pothole\Scripts\python.exe ai\pothole\train.py `
  --data ai\pothole\data\pothole-1class-v1\data.yaml
```

The selected weights are written to
`ai/pothole/runs/detect/<run-name>/weights/best.pt`.

## Evaluate

```powershell
.\.venv-pothole\Scripts\python.exe ai\pothole\evaluate.py `
  --weights ai\pothole\runs\detect\smoke-pothole-1class\weights\best.pt `
  --data ai\pothole\data\pothole-1class-v1\data.yaml
```

Evaluation writes `metrics.json`, a confusion matrix, and standard Ultralytics
plots into the ignored `runs/evaluate/` directory.

## Predict one image

```powershell
.\.venv-pothole\Scripts\python.exe ai\pothole\predict.py path\to\image.jpg `
  --weights ai\pothole\runs\detect\smoke-pothole-1class\weights\best.pt
```

The command emits JSON containing each detection's class, confidence, and
`[x1, y1, x2, y2]` bounding box. Class names always come from the trained model;
the inference code does not hardcode a class mapping.

## Archived reference dataset

The existing `pothole-detection-v6` Roboflow export with `Pothole` and
`HighRiskPothole` is retained locally for reference and audit only. Its class
semantics are inconsistent: `HighRiskPothole` uses local boxes while `Pothole`
mostly uses full-image boxes. Do not use it for the primary training run, and do
not modify, relabel, or delete its source annotations in this workstream.
