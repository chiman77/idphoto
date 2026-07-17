import os
import numpy as np
import cv2
from PIL import Image
import onnxruntime


_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_MODEL_CANDIDATES = [
    os.path.join(_BASE_DIR, "models", "weights", "hivision_modnet.onnx"),
    os.path.join(_BASE_DIR, "models", "hivision_modnet.onnx"),
]
_MODEL_PATH = None
for p in _MODEL_CANDIDATES:
    if os.path.exists(p):
        _MODEL_PATH = p
        break

_REF_SIZE = 512
_SESSION = None


def _get_session():
    global _SESSION
    if _SESSION is None:
        if _MODEL_PATH is None:
            raise FileNotFoundError("hivision_modnet.onnx not found in models/ or models/weights/")
        _SESSION = onnxruntime.InferenceSession(
            _MODEL_PATH, providers=["CPUExecutionProvider"]
        )
    return _SESSION


def remove_background(image):
    session = _get_session()
    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name

    orig_w, orig_h = image.size
    rgb = np.asarray(image.convert("RGB"))
    rgb_f = rgb.astype(np.float32)

    bgr = rgb_f[:, :, ::-1]
    im = cv2.resize(bgr, (_REF_SIZE, _REF_SIZE), interpolation=cv2.INTER_AREA)
    im = (im / 255.0 - 0.5) / 0.5
    im = im.transpose(2, 0, 1)[np.newaxis, :, :, :].astype(np.float32)

    matte = session.run([output_name], {input_name: im})[0]

    raw = np.squeeze(matte)
    raw = np.clip((raw - 0.15) / 0.85, 0.0, 1.0)
    mask_512 = (raw * 255).astype(np.uint8)

    # Minimal edge smoothing: tiny blur to suppress pixel jaggies
    mask_512 = cv2.GaussianBlur(mask_512, (3, 3), 0.5)

    # LANCZOS upscale preserves edge detail best
    mask = cv2.resize(mask_512, (orig_w, orig_h), interpolation=cv2.INTER_LANCZOS4)

    # No full-res blur — keep edges crisp
    rgba = np.dstack((rgb, mask))
    return Image.fromarray(rgba, mode="RGBA")
