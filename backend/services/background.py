from PIL import Image, ImageFilter
from typing import Tuple


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def feather_mask(mask: Image.Image, radius: int = 3) -> Image.Image:
    """Apply Gaussian blur for smoother edge transitions."""
    if radius <= 0:
        return mask
    return mask.filter(ImageFilter.GaussianBlur(radius=radius))


def replace_background(
    foreground: Image.Image,
    background_color: str = "#FFFFFF",
    feather_radius: int = 3,
) -> Image.Image:
    fg = foreground.convert("RGBA")

    if feather_radius > 0:
        alpha = fg.split()[3]
        alpha = feather_mask(alpha, radius=feather_radius)
        fg.putalpha(alpha)

    rgb = hex_to_rgb(background_color)
    bg = Image.new("RGBA", fg.size, rgb + (255,))
    bg.paste(fg, (0, 0), fg)
    return bg.convert("RGB")
