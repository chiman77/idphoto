"""
BiRefNet-based portrait matting service.
BiRefNet-portrait-epoch_150: fixed input 1024x1024, output 1-channel alpha.
Falls back to hivision_modnet if BiRefNet not available.
"""

import os
import numpy as np
import cv2
from PIL import Image
import onnxruntime


_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

_MODEL_CANDIDATES = [
    os.path.join(_BASE_DIR, "models", "weights", "BiRefNet-portrait-epoch_150.onnx"),
    os.path.join(_BASE_DIR, "models", "weights", "birefnet-portrait.onnx"),
    os.path.join(_BASE_DIR, "models", "weights", "birefnet-matting.onnx"),
    os.path.join(_BASE_DIR, "models", "weights", "hivision_modnet.onnx"),
]

_MODEL_PATH = None
for p in _MODEL_CANDIDATES:
    if os.path.exists(p):
        _MODEL_PATH = p
        break

_SESSION = None
_INPUT_NAME = None
_OUTPUT_NAME = None
_IS_BIREFNET = False
_BIREFNET_INPUT_SIZE = 1024  # BiRefNet portrait uses fixed 1024x1024


def _get_session():
    global _SESSION, _INPUT_NAME, _OUTPUT_NAME, _IS_BIREFNET
    if _SESSION is not None:
        return _SESSION

    if _MODEL_PATH is None:
        raise FileNotFoundError("No matting model found in backend/models/weights/")

    _SESSION = onnxruntime.InferenceSession(
        _MODEL_PATH, providers=["CPUExecutionProvider"]
    )
    _INPUT_NAME = _SESSION.get_inputs()[0].name
    _OUTPUT_NAME = _SESSION.get_outputs()[0].name

    basename = os.path.basename(_MODEL_PATH).lower()
    _IS_BIREFNET = "birefnet" in basename

    if _IS_BIREFNET:
        print(f"[BiRefNet] Loaded: {os.path.basename(_MODEL_PATH)}")
        print(f"[BiRefNet] Input: '{_INPUT_NAME}' {_SESSION.get_inputs()[0].shape}")
        print(f"[BiRefNet] Output: '{_OUTPUT_NAME}' {_SESSION.get_outputs()[0].shape}")
    else:
        print(f"[MODNet] Loaded: {os.path.basename(_MODEL_PATH)} (fallback)")

    return _SESSION


# ---------------------------------------------------------------------------
# BiRefNet processing
# ---------------------------------------------------------------------------

def _resize_with_pad(image_np, target_size):
    """Resize image to target_size keeping aspect ratio, pad to square."""
    h, w = image_np.shape[:2]
    scale = target_size / max(h, w)
    new_w = int(w * scale)
    new_h = int(h * scale)
    resized = cv2.resize(image_np, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

    pad_w = target_size - new_w
    pad_h = target_size - new_h
    padded = cv2.copyMakeBorder(
        resized, 0, pad_h, 0, pad_w, cv2.BORDER_CONSTANT, value=(0, 0, 0)
    )
    return padded, (new_w, new_h, pad_w, pad_h)


def _remove_background_birefnet(image):
    session = _get_session()
    orig_w, orig_h = image.size
    rgb = np.asarray(image.convert("RGB"), dtype=np.uint8)

    # 1. Resize to 1024x1024 with padding (preserve aspect ratio)
    inp_size = _BIREFNET_INPUT_SIZE
    padded, (nw, nh, pw, ph) = _resize_with_pad(rgb, inp_size)

    # 2. Normalize to [0, 1] -> NCHW
    inp = padded.astype(np.float32) / 255.0
    inp = inp.transpose(2, 0, 1)[np.newaxis, :, :, :]

    # 3. Run inference
    outputs = session.run([_OUTPUT_NAME], {_INPUT_NAME: inp})
    raw = outputs[0]  # [1, 1, 1024, 1024]

    # 4. Extract alpha (single channel, raw logits -> sigmoid)
    if raw.ndim == 4:
        alpha = raw[0, 0, :, :]
    else:
        alpha = raw
    alpha = 1.0 / (1.0 + np.exp(-alpha))  # sigmoid

    # 5. Remove padding (crop back to resized content)
    if pw > 0 or ph > 0:
        alpha = alpha[:nh, :nw]

    # 6. Resize back to original dimensions
    alpha = cv2.resize(alpha, (orig_w, orig_h), interpolation=cv2.INTER_LINEAR)

    # 7. Post-process: slight contrast stretch + edge smoothing
    alpha = np.clip(alpha, 0, 1)
    alpha = (alpha * 255).astype(np.uint8)
    alpha = cv2.GaussianBlur(alpha, (3, 3), 0.5)

    # 8. Build RGBA
    rgba = np.dstack((rgb, alpha))
    return Image.fromarray(rgba, mode="RGBA")


# ---------------------------------------------------------------------------
# MODNet (hivision_modnet) fallback
# ---------------------------------------------------------------------------

def _remove_background_modnet(image):
    session = _get_session()
    orig_w, orig_h = image.size
    rgb = np.asarray(image.convert("RGB"))
    rgb_f = rgb.astype(np.float32)

    ref_size = 512
    bgr = rgb_f[:, :, ::-1]
    im = cv2.resize(bgr, (ref_size, ref_size), interpolation=cv2.INTER_AREA)
    im = (im / 255.0 - 0.5) / 0.5
    im = im.transpose(2, 0, 1)[np.newaxis, :, :, :].astype(np.float32)

    matte = session.run([_OUTPUT_NAME], {_INPUT_NAME: im})[0]
    raw = np.squeeze(matte)
    raw = np.clip((raw - 0.15) / 0.85, 0.0, 1.0)
    mask_512 = (raw * 255).astype(np.uint8)
    mask_512 = cv2.GaussianBlur(mask_512, (3, 3), 0.5)
    mask = cv2.resize(mask_512, (orig_w, orig_h), interpolation=cv2.INTER_LANCZOS4)

    rgba = np.dstack((rgb, mask))
    return Image.fromarray(rgba, mode="RGBA")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def remove_background(image):
    _get_session()
    if _IS_BIREFNET:
        return _remove_background_birefnet(image)
    else:
        return _remove_background_modnet(image)
