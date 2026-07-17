import pytest
from PIL import Image
from services.background import hex_to_rgb, replace_background
from services.cropping import smart_crop, create_layout_grid


def test_hex_to_rgb():
    assert hex_to_rgb("#FFFFFF") == (255, 255, 255)
    assert hex_to_rgb("#FF0000") == (255, 0, 0)
    assert hex_to_rgb("#4A90D9") == (74, 144, 217)


def test_hex_to_rgb_without_hash():
    assert hex_to_rgb("FFFFFF") == (255, 255, 255)


def test_replace_background():
    img = Image.new("RGBA", (64, 64), (255, 0, 0, 255))
    result = replace_background(img, "#0000FF")
    assert result.mode == "RGB"
    assert result.size == (64, 64)
    assert result.getpixel((32, 32)) == (255, 0, 0)


def test_smart_crop():
    img = Image.new("RGB", (200, 300), (255, 0, 0))
    result = smart_crop(img, 100, 150)
    assert result.size == (100, 150)


def test_create_layout_grid():
    img = Image.new("RGB", (100, 150), (255, 0, 0))
    sheet = create_layout_grid(img, 100, 150, cols=4, rows=2)
    expected_w = 100 * 4 + 20 * 5
    expected_h = 150 * 2 + 20 * 3
    assert sheet.size == (expected_w, expected_h)
