from PIL import Image, ImageFilter, ImageEnhance
import numpy as np


def smart_crop(image, target_width, target_height):
    """Smart center crop to target dimensions maintaining aspect ratio."""
    img_w, img_h = image.size
    target_ratio = target_width / target_height
    if img_w / img_h > target_ratio:
        new_w = int(img_h * target_ratio)
        new_h = img_h
    else:
        new_w = img_w
        new_h = int(img_w / target_ratio)
    left = (img_w - new_w) // 2
    top = (img_h - new_h) // 2
    cropped = image.crop((left, top, left + new_w, top + new_h))
    resized = cropped.resize((target_width, target_height), Image.LANCZOS)
    return resized


def create_layout_grid(image, spec_width_px, spec_height_px, cols=4, rows=2):
    """Create a layout grid for printing (e.g., 4x2 = 8 photos per sheet)."""
    margin = 20
    sheet_w = spec_width_px * cols + margin * (cols + 1)
    sheet_h = spec_height_px * rows + margin * (rows + 1)
    sheet = Image.new("RGB", (sheet_w, sheet_h), (255, 255, 255))
    for row in range(rows):
        for col in range(cols):
            x = margin + col * (spec_width_px + margin)
            y = margin + row * (spec_height_px + margin)
            sheet.paste(image, (x, y))
    return sheet


def unsharp_mask(image, radius=1.0, percent=80, threshold=3):
    """Apply unsharp mask to sharpen the final ID photo."""
    arr = np.asarray(image, dtype=np.float32)
    blurred = np.asarray(
        image.filter(ImageFilter.GaussianBlur(radius=radius)), dtype=np.float32
    )
    diff = arr - blurred
    mask = np.abs(diff) > threshold
    sharpened = arr + diff * (percent / 100.0)
    result = np.where(mask, sharpened, arr)
    result = np.clip(result, 0, 255).astype(np.uint8)
    return Image.fromarray(result, mode=image.mode)


def adjust_brightness(image, brightness=1.08, contrast=1.04):
    """Gently brighten and boost contrast for flattering ID photos."""
    img = ImageEnhance.Brightness(image).enhance(brightness)
    img = ImageEnhance.Contrast(img).enhance(contrast)
    return img
