import base64
import io
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.segmentation import remove_background
from services.background import replace_background
from services.cropping import smart_crop, create_layout_grid, unsharp_mask, adjust_brightness
from PIL import Image

router = APIRouter()

def _make_response(result_img, fmt="png"):
    buf = io.BytesIO()
    result_img.save(buf, format=fmt.upper())
    buf.seek(0)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return {"imageBase64": b64, "format": fmt, "widthPx": result_img.width, "heightPx": result_img.height}

@router.post("/process")
async def process_photo(
    file: UploadFile = File(...),
    width_px: int = Form(...),
    height_px: int = Form(...),
    background_color: str = Form("#FFFFFF"),
    dpi: int = Form(300),
    layout: bool = Form(False),
    feather_radius: int = Form(2),
):
    contents = await file.read()
    if not contents:
        raise HTTPException(400, "Empty file")
    try:
        input_image = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(400, "Invalid image file")
    max_dimension = 2000
    if max(input_image.size) > max_dimension:
        ratio = max_dimension / max(input_image.size)
        new_size = (int(input_image.width * ratio), int(input_image.height * ratio))
        input_image = input_image.resize(new_size, Image.LANCZOS)
    try:
        fg = remove_background(input_image)
        rgb_image = replace_background(fg, background_color, feather_radius)
        result = smart_crop(rgb_image, width_px, height_px)
        result = unsharp_mask(result, radius=0.8, percent=60, threshold=2)
        result = adjust_brightness(result, brightness=1.08, contrast=1.04)
        if layout:
            result = create_layout_grid(result, width_px, height_px)
        return _make_response(result)
    except Exception as e:
        raise HTTPException(500, f"Processing failed: {str(e)}")
