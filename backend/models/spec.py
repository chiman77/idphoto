from pydantic import BaseModel
from typing import Optional


class ProcessResponse(BaseModel):
    image_base64: str
    format: str = "png"
    width_px: int
    height_px: int

    model_config = {
        "populate_by_name": True,
        "alias_generator": lambda s: (
            "imageBase64" if s == "image_base64"
            else "widthPx" if s == "width_px"
            else "heightPx" if s == "height_px"
            else s
        ),
    }
