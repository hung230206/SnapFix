# SnapFix pothole detection

This directory contains an isolated Ultralytics YOLO11 pipeline for detecting
`HighRiskPothole` and `Pothole`. It is not connected to the SnapFix web app.

## Local setup

Create a virtual environment and install the dependencies:

```powershell
python -m venv .venv-pothole
.\.venv-pothole\Scripts\python.exe -m pip install -r ai\pothole\requirements.txt
```

On Windows, the requirements select the official PyTorch CUDA 13.0 wheels used
by the target RTX 3050 laptop. Verify `torch.cuda.is_available()` before
training; do not silently fall back to CPU for the normal training run.

Export the Roboflow dataset in YOLO11 format and extract it to:

```text
ai/pothole/data/pothole-detection-v6/
```

Dataset files, run outputs, and model weights are intentionally ignored by Git.
Keep the Roboflow class indices unchanged:

```text
0: HighRiskPothole
1: Pothole
```

If the exported `data.yaml` contains paths such as `../train/images`, copy
`configs/dataset.example.yaml` into the ignored dataset directory, name it
`snapfix-data.yaml`, and set `path` to the absolute dataset directory.

## Train

The default configuration uses pretrained `yolo11n.pt`, 640 px images, batch 4,
and CUDA device 0 when available. Run an explicit one-epoch smoke test first:

```powershell
.\.venv-pothole\Scripts\python.exe ai\pothole\train.py --epochs 1 --name smoke-yolo11n
```

After the smoke test is verified, start the configured 80-epoch run:

```powershell
.\.venv-pothole\Scripts\python.exe ai\pothole\train.py
```

The selected weights are written to
`ai/pothole/runs/detect/<run-name>/weights/best.pt`.

## Evaluate

```powershell
.\.venv-pothole\Scripts\python.exe ai\pothole\evaluate.py `
  --weights ai\pothole\runs\detect\smoke-yolo11n\weights\best.pt `
  --data ai\pothole\data\pothole-detection-v6\snapfix-data.yaml
```

Evaluation writes `metrics.json`, a confusion matrix, and standard Ultralytics
plots into the ignored `runs/evaluate/` directory.

## Predict one image

```powershell
.\.venv-pothole\Scripts\python.exe ai\pothole\predict.py path\to\image.jpg `
  --weights ai\pothole\runs\detect\smoke-yolo11n\weights\best.pt
```

The command emits JSON containing each detection's class, confidence, and
`[x1, y1, x2, y2]` bounding box.

## Dataset note

The Roboflow v6 export currently contains one training annotation that mixes a
five-value detection row with a polygon row. Ultralytics ignores that image as
corrupt. The test split also contains one polygon annotation among detection
labels; evaluation keeps boxes and drops segment data. Keep the downloaded
source unchanged until the team decides whether to correct and version a
sanitized dataset separately.
