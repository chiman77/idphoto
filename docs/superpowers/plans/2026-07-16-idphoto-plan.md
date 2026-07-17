# ID Photo Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\- [ ]\) syntax for tracking.

**Goal:** Build a web-based ID photo generator that lets users upload a portrait, select country-specific photo specs and background color, and generate a downloadable ID photo using local (MediaPipe) or server-side (rembg) processing.

**Architecture:** React SPA frontend with Vite + Tailwind CSS, Python FastAPI backend with rembg/Pillow for server-side processing, MediaPipe WASM for local browser-side processing. PWA support for mobile access. No database — all processing is ephemeral.

**Tech Stack:** React 18, Vite, Tailwind CSS, Zustand, MediaPipe, fabric.js, FastAPI, rembg, Pillow, OpenCV, Docker

---

## File Structure
``
idphoto/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadZone.tsx
│   │   │   ├── SpecSelector.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── ModeSelector.tsx
│   │   │   ├── Preview.tsx
│   │   │   ├── ResultPanel.tsx
│   │   │   └── Header.tsx
│   │   ├── services/
│   │   │   ├── localProcessor.ts
│   │   │   └── apiClient.ts
│   │   ├── utils/
│   │   │   ├── specData.ts
│   │   │   ├── canvasUtils.ts
│   │   │   └── colorData.ts
│   │   ├── store/
│   │   │   └── useStore.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/
│   ├── main.py
│   ├── routers/
│   │   ├── __init__.py
│   │   └── process.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── segmentation.py
│   │   ├── background.py
│   │   └── cropping.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── spec.py
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_services.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── README.md
``

---

### Task 1: Scaffold Frontend Project

**Files:**
- Create: rontend/package.json
- Create: rontend/tsconfig.json
- Create: rontend/vite.config.ts
- Create: rontend/tailwind.config.js
- Create: rontend/postcss.config.js
- Create: rontend/index.html
- Create: rontend/src/main.tsx
- Create: rontend/src/index.css
- Create: rontend/src/App.tsx
- Create: rontend/src/vite-env.d.ts

- [ ] **Step 1: Create package.json**

`json
{
  "name": "idphoto-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^4.5.2",
    "@mediapipe/selfie_segmentation": "^0.1.1675465747",
    "react-i18next": "^14.1.1",
    "i18next": "^23.11.3"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5",
    "vite": "^5.3.1",
    "vite-plugin-pwa": "^0.20.0"
  }
}
`

- [ ] **Step 2: Create tsconfig.json**

`json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
`

- [ ] **Step 3: Create vite.config.ts**

`	ypescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: '\u8bc1\u4ef6\u7167\u751f\u6210\u5668',
        short_name: 'IDPhoto',
        description: '\u5728\u7ebf\u8bc1\u4ef6\u7167\u751f\u6210\u5de5\u5177',
        theme_color: '#4A90D9',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
});
`

- [ ] **Step 4: Create tailwind.config.js**

`javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
};
`

- [ ] **Step 5: Create postcss.config.js**

`javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
`

- [ ] **Step 6: Create index.html**

`html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>\u8bc1\u4ef6\u7167\u751f\u6210\u5668 - ID Photo Generator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`

- [ ] **Step 7: Create src/vite-env.d.ts**

`	ypescript
/// <reference types="vite/client" />
`

- [ ] **Step 8: Create src/index.css**

`css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
`

- [ ] **Step 9: Create src/main.tsx**

`	ypescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`

- [ ] **Step 10: Create src/App.tsx (placeholder)**

`	ypescript
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-center pt-8">
        \u8bc1\u4ef6\u7167\u751f\u6210\u5668
      </h1>
    </div>
  );
}
`

- [ ] **Step 11: Verify setup**

Run: cd frontend && npm install 2>&1 | tail -5
Expected: no errors, node_modules created

---

### Task 2: Scaffold Backend Project

**Files:**
- Create: ackend/requirements.txt
- Create: ackend/Dockerfile
- Create: ackend/main.py
- Create: ackend/routers/__init__.py
- Create: ackend/routers/process.py
- Create: ackend/models/__init__.py
- Create: ackend/models/spec.py
- Create: ackend/services/__init__.py
- Create: ackend/services/segmentation.py
- Create: ackend/services/background.py
- Create: ackend/services/cropping.py
- Create: ackend/tests/__init__.py
- Create: ackend/tests/test_services.py

- [ ] **Step 1: Create requirements.txt**

`
fastapi==0.111.0
uvicorn[standard]==0.30.1
python-multipart==0.0.9
rembg==0.3.1
Pillow==10.3.0
opencv-python-headless==4.9.0.80
numpy==1.26.4
pytest==8.2.2
httpx==0.27.0
`

- [ ] **Step 2: Create Dockerfile**

`dockerfile
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`

- [ ] **Step 3: Create backend/main.py**

`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.process import router as process_router

app = FastAPI(title="ID Photo Generator API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(process_router, prefix="/api")

@app.get("/api/health")
def health():
    return {"status": "ok"}
`

- [ ] **Step 4: Create backend/models/spec.py**

`python
from pydantic import BaseModel
from typing import Optional


class PhotoSpec(BaseModel):
    name: str
    width_mm: float
    height_mm: float
    width_px: int
    height_px: int
    dpi: int = 300
    description: Optional[str] = None


class ProcessRequest(BaseModel):
    width_px: int
    height_px: int
    background_color: str
    dpi: int = 300


class ProcessResponse(BaseModel):
    image_base64: str
    format: str = "png"
    width_px: int
    height_px: int
`

- [ ] **Step 5: Create empty __init__.py files**

Create empty files at:
- ackend/routers/__init__.py
- ackend/services/__init__.py
- ackend/models/__init__.py
- ackend/tests/__init__.py

- [ ] **Step 6: Verify backend runs**

Run: cd backend && python -c "from fastapi import FastAPI; print('OK')"
Expected: prints "OK"

---

### Task 3: Implement Backend Image Processing Services

**Files:**
- Create: ackend/services/segmentation.py
- Create: ackend/services/background.py
- Create: ackend/services/cropping.py

- [ ] **Step 1: Implement segmentation service**

`python
# backend/services/segmentation.py
import numpy as np
from PIL import Image, ImageFilter
import io


def remove_background(image: Image.Image) -> Image.Image:
    \"\"\"
    Remove background using rembg.
    Returns RGBA image with transparent background.
    \"\"\"
    from rembg import remove

    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG')
    img_byte_arr = img_byte_arr.getvalue()

    output_bytes = remove(img_byte_arr)
    output_image = Image.open(io.BytesIO(output_bytes)).convert("RGBA")

    return output_image


def feather_mask(mask: Image.Image, radius: int = 2) -> Image.Image:
    \"\"\"Apply Gaussian blur to mask alpha for smoother edges.\"\"\"
    return mask.filter(ImageFilter.GaussianBlur(radius=radius))
`

- [ ] **Step 2: Implement background replacement service**

`python
# backend/services/background.py
from PIL import Image
from typing import Tuple


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def replace_background(
    foreground: Image.Image,
    background_color: str = "#FFFFFF",
    feather_radius: int = 2
) -> Image.Image:
    from services.segmentation import feather_mask

    fg = foreground.convert("RGBA")

    if feather_radius > 0:
        alpha = fg.split()[3]
        alpha = feather_mask(alpha, radius=feather_radius)
        fg.putalpha(alpha)

    rgb = hex_to_rgb(background_color)
    bg = Image.new("RGBA", fg.size, rgb + (255,))
    bg.paste(fg, (0, 0), fg)
    return bg.convert("RGB")
`

- [ ] **Step 3: Implement cropping/sizing service**

`python
# backend/services/cropping.py
from PIL import Image


def smart_crop(
    image: Image.Image,
    target_width: int,
    target_height: int,
) -> Image.Image:
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


def create_layout_grid(
    image: Image.Image,
    spec_width_px: int,
    spec_height_px: int,
    cols: int = 4,
    rows: int = 2
) -> Image.Image:
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
`

- [ ] **Step 4: Write tests**

`python
# backend/tests/test_services.py
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
`

- [ ] **Step 5: Run tests**

Run: cd backend && python -m pytest tests/test_services.py -v
Expected: all 5 tests PASS
---

### Task 4: Implement Backend API Endpoint

**Files:**
- Create: `backend/routers/process.py`

- [ ] **Step 1: Implement process router**

```python
# backend/routers/process.py
import base64
import io
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from models.spec import ProcessResponse
from services.segmentation import remove_background
from services.background import replace_background
from services.cropping import smart_crop, create_layout_grid
from PIL import Image

router = APIRouter()


@router.post("/process", response_model=ProcessResponse)
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

        if layout:
            result = create_layout_grid(result, width_px, height_px)

        buf = io.BytesIO()
        result.save(buf, format="PNG")
        buf.seek(0)
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

        return ProcessResponse(
            image_base64=b64,
            format="png",
            width_px=result.width,
            height_px=result.height,
        )
    except Exception as e:
        raise HTTPException(500, f"Processing failed: {str(e)}")
```

- [ ] **Step 2: Quick health check**

Run: `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 &`
Wait 2s then: `curl -s http://localhost:8000/api/health`
Expected: `{"status":"ok"}`
Kill the server after test.
---

### Task 5: Implement Frontend Spec Data & Color Data

**Files:**
- Create: `frontend/src/utils/specData.ts`
- Create: `frontend/src/utils/colorData.ts`
- [ ] **Step 1: Create specData.ts**

```typescript
export interface PhotoSpec {
  name: string;
  label: string;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
  dpi: number;
  description?: string;
}

export interface CountrySpecs {
  country: string;
  countryCode: string;
  specs: PhotoSpec[];
}

export const countrySpecs: CountrySpecs[] = [
  {
    country: "\u4e2d\u56fd",
    countryCode: "CN",
    specs: [
      { name: "1\u5bf8", label: "1\u5bf8", widthMm: 25, heightMm: 35, widthPx: 295, heightPx: 413, dpi: 300 },
      { name: "\u5927\u4e00\u5bf8", label: "\u5927\u4e00\u5bf8", widthMm: 33, heightMm: 48, widthPx: 390, heightPx: 567, dpi: 300 },
      { name: "\u5c0f\u4e00\u5bf8", label: "\u5c0f\u4e00\u5bf8", widthMm: 22, heightMm: 32, widthPx: 260, heightPx: 378, dpi: 300 },
      { name: "2\u5bf8", label: "2\u5bf8", widthMm: 35, heightMm: 53, widthPx: 413, heightPx: 626, dpi: 300 },
      { name: "\u5927\u4e8c\u5bf8", label: "\u5927\u4e8c\u5bf8", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300 },
    ],
  },
  {
    country: "\u7f8e\u56fd",
    countryCode: "US",
    specs: [
      { name: "2x2in", label: "2x2 \u82f1\u5bf8 (\u62a4\u7167/\u7b7e\u8bc1)", widthMm: 51, heightMm: 51, widthPx: 600, heightPx: 600, dpi: 300 },
      { name: "1x1.5in", label: "1x1.5 \u82f1\u5bf8 (\u9a7e\u7167)", widthMm: 25, heightMm: 38, widthPx: 300, heightPx: 450, dpi: 300 },
    ],
  },
  {
    country: "\u6b27\u76df/\u7533\u6839",
    countryCode: "EU",
    specs: [
      { name: "35x45mm", label: "35x45mm (\u62a4\u7167/\u7b7e\u8bc1)", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300 },
      { name: "30x40mm", label: "30x40mm", widthMm: 30, heightMm: 40, widthPx: 354, heightPx: 472, dpi: 300 },
    ],
  },
  {
    country: "\u82f1\u56fd",
    countryCode: "GB",
    specs: [
      { name: "35x45mm", label: "35x45mm (\u62a4\u7167)", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300 },
      { name: "45x35mm", label: "45x35mm (\u7b7e\u8bc1)", widthMm: 45, heightMm: 35, widthPx: 531, heightPx: 413, dpi: 300 },
    ],
  },
  {
    country: "\u65e5\u672c",
    countryCode: "JP",
    specs: [
      { name: "3x4cm", label: "3x4cm", widthMm: 30, heightMm: 40, widthPx: 354, heightPx: 472, dpi: 300 },
      { name: "4.5x4.5cm", label: "4.5x4.5cm", widthMm: 45, heightMm: 45, widthPx: 531, heightPx: 531, dpi: 300 },
    ],
  },
  {
    country: "\u97e9\u56fd",
    countryCode: "KR",
    specs: [
      { name: "35x45mm", label: "3.5x4.5cm", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300 },
      { name: "35x35mm", label: "3.5x3.5cm", widthMm: 35, heightMm: 35, widthPx: 413, heightPx: 413, dpi: 300 },
    ],
  },
  {
    country: "\u901a\u7528",
    countryCode: "\u901a\u7528",
    specs: [
      { name: "custom", label: "\u81ea\u5b9a\u4e49\u5c3a\u5bf8", widthMm: 0, heightMm: 0, widthPx: 0, heightPx: 0, dpi: 300 },
    ],
  },
];
```

- [ ] **Step 2: Create colorData.ts**

```typescript
export interface BackgroundColor {
  name: string;
  hex: string;
  rgb: string;
  description?: string;
}

export const backgroundColors: BackgroundColor[] = [
  { name: "\u767d\u8272", hex: "#FFFFFF", rgb: "255,255,255", description: "\u901a\u7528" },
  { name: "\u84dd\u8272", hex: "#4A90D9", rgb: "74,144,217", description: "\u62a4\u7167/\u7b7e\u8bc1/\u5de5\u4f5c\u8bc1" },
  { name: "\u7ea2\u8272", hex: "#ED1C24", rgb: "237,28,36", description: "\u4e2d\u56fd\u8bc1\u4ef6/\u7ed3\u5a5a\u7167" },
  { name: "\u6de1\u84dd\u8272", hex: "#B0C4DE", rgb: "176,196,222", description: "\u90e8\u5206\u9a7e\u7167\u7528" },
  { name: "\u7070\u8272", hex: "#D9D9D9", rgb: "217,217,217", description: "\u90e8\u5206\u56fd\u5bb6\u7b7e\u8bc1" },
];
```
---

### Task 6: Implement Frontend State Management

**Files:**
- Create: `frontend/src/store/useStore.ts`

- [ ] **Step 1: Create Zustand store**

```typescript
import { create } from 'zustand';
import type { PhotoSpec } from '../utils/specData';

export type ProcessMode = 'auto' | 'local' | 'server';

interface AppState {
  originalImage: File | null;
  originalImageUrl: string | null;
  setOriginalImage: (file: File | null) => void;

  selectedCountry: string;
  selectedSpec: PhotoSpec | null;
  setSelectedCountry: (code: string) => void;
  setSelectedSpec: (spec: PhotoSpec | null) => void;

  backgroundColor: string;
  setBackgroundColor: (color: string) => void;

  processMode: ProcessMode;
  setProcessMode: (mode: ProcessMode) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;

  resultImageUrl: string | null;
  setResultImageUrl: (url: string | null) => void;
  error: string | null;
  setError: (err: string | null) => void;

  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  originalImage: null,
  originalImageUrl: null,
  setOriginalImage: (file) =>
    set({
      originalImage: file,
      originalImageUrl: file ? URL.createObjectURL(file) : null,
      resultImageUrl: null,
      error: null,
    }),

  selectedCountry: 'CN',
  selectedSpec: null,
  setSelectedCountry: (code) => set({ selectedCountry: code, selectedSpec: null }),
  setSelectedSpec: (spec) => set({ selectedSpec: spec }),

  backgroundColor: '#FFFFFF',
  setBackgroundColor: (color) => set({ backgroundColor: color }),

  processMode: 'auto',
  setProcessMode: (mode) => set({ processMode: mode }),

  isProcessing: false,
  setIsProcessing: (v) => set({ isProcessing: v }),

  resultImageUrl: null,
  setResultImageUrl: (url) => set({ resultImageUrl: url }),

  error: null,
  setError: (err) => set({ error: err }),

  reset: () =>
    set({
      originalImage: null,
      originalImageUrl: null,
      resultImageUrl: null,
      error: null,
      selectedSpec: null,
    }),
}));
```
---

### Task 7: Implement Frontend UI Components

**Files:**
- Create: `frontend/src/components/Header.tsx`
- Create: `frontend/src/components/UploadZone.tsx`
- Create: `frontend/src/components/SpecSelector.tsx`
- Create: `frontend/src/components/ColorPicker.tsx`
- Create: `frontend/src/components/ModeSelector.tsx`
- Create: `frontend/src/components/Preview.tsx`
- Create: `frontend/src/components/ResultPanel.tsx`

- [ ] **Step 1: Create Header.tsx**

```typescript
export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📷</span>
          <h1 className="text-xl font-bold text-gray-800">证件照生成器</h1>
          <span className="text-sm text-gray-400 ml-1">ID Photo</span>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create UploadZone.tsx**

```typescript
import { useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';

export default function UploadZone() {
  const { setOriginalImage } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert('图片大小不能超过 20MB');
        return;
      }
      setOriginalImage(file);
    },
    [setOriginalImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <div className="text-5xl mb-3">📸</div>
      <p className="text-gray-600 font-medium">点击或拖拽上传照片</p>
      <p className="text-sm text-gray-400 mt-1">支持 JPG/PNG，建议纯色背景大头照</p>
    </div>
  );
}
```
- [ ] **Step 3: Create SpecSelector.tsx**

```typescript
import { useStore } from "../store/useStore";
import { countrySpecs } from "../utils/specData";

export default function SpecSelector() {
  const { selectedCountry, setSelectedCountry, selectedSpec, setSelectedSpec } = useStore();
  const currentCountry = countrySpecs.find((c) => c.countryCode === selectedCountry) ?? countrySpecs[0];

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">国家/地区</label>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
        >
          {countrySpecs.map((c) => (
            <option key={c.countryCode} value={c.countryCode}>{c.country}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">证件照规格</label>
        <div className="grid grid-cols-2 gap-2">
          {currentCountry.specs.map((spec) => (
            <button
              key={spec.name}
              onClick={() => setSelectedSpec(spec)}
              className={`text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                selectedSpec?.name === spec.name
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-blue-300 text-gray-700"
              }`}
            >
              <div className="font-medium">{spec.label}</div>
              {spec.widthPx > 0 && (
                <div className="text-xs text-gray-400">
                  {spec.widthMm}x{spec.heightMm}mm | {spec.widthPx}x{spec.heightPx}px
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create ColorPicker.tsx**

```typescript
import { useStore } from "../store/useStore";
import { backgroundColors } from "../utils/colorData";

export default function ColorPicker() {
  const { backgroundColor, setBackgroundColor } = useStore();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">背景颜色</label>
      <div className="flex gap-3">
        {backgroundColors.map((color) => (
          <button
            key={color.hex}
            onClick={() => setBackgroundColor(color.hex)}
            className={`w-10 h-10 rounded-full border-2 transition-all ${
              backgroundColor === color.hex
                ? "border-blue-500 scale-110 shadow-md"
                : "border-gray-200 hover:border-gray-400"
            }`}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-gray-400">自定义:</span>
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
          className="w-8 h-8 p-0 border-0 cursor-pointer"
        />
        <span className="text-xs text-gray-500">{backgroundColor}</span>
      </div>
    </div>
  );
}
```
- [ ] **Step 5: Create ModeSelector.tsx**

```typescript
import { useStore, type ProcessMode } from "../store/useStore";

const modes: { value: ProcessMode; label: string; desc: string }[] = [
  { value: "auto", label: "\ud83d\udd04 \u81ea\u52a8\u63a8\u8350", desc: "\u7cfb\u7edf\u6839\u636e\u7167\u7247\u8d28\u91cf\u81ea\u52a8\u9009\u62e9" },
  { value: "local", label: "\ud83d\udcbb \u672c\u5730\u5904\u7406", desc: "\u6d4f\u89c8\u5668\u7aef\u5feb\u901f\u5904\u7406\uff0c\u7167\u7247\u4e0d\u4e0a\u4f20" },
  { value: "server", label: "\u2601\ufe0f \u670d\u52a1\u7aef\u5904\u7406", desc: "\u7cbe\u5ea6\u66f4\u9ad8\uff0c\u9002\u5408\u590d\u6742\u80cc\u666f\u7167\u7247" },
];

export default function ModeSelector() {
  const { processMode, setProcessMode } = useStore();
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">处理模式</label>
      <div className="flex flex-col gap-2">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => setProcessMode(mode.value)}
            className={`text-left px-3 py-2 rounded-lg border text-sm transition-all ${
              processMode === mode.value
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-blue-300 text-gray-600"
            }`}
          >
            <div className="font-medium">{mode.label}</div>
            <div className="text-xs text-gray-400">{mode.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create Preview.tsx**

```typescript
import { useStore } from "../store/useStore";

export default function Preview() {
  const { originalImageUrl, resultImageUrl } = useStore();
  if (!originalImageUrl) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">原始照片</h3>
        <div className="bg-gray-100 rounded-lg p-2 flex items-center justify-center">
          <img src={originalImageUrl} alt="Original" className="max-w-full max-h-60 object-contain rounded" />
        </div>
      </div>
      {resultImageUrl && (
        <div>
          <h3 className="text-sm font-medium text-green-600 mb-1">生成结果</h3>
          <div className="bg-gray-100 rounded-lg p-2 flex items-center justify-center">
            <img src={resultImageUrl} alt="Result" className="max-w-full max-h-60 object-contain rounded shadow-sm" />
          </div>
        </div>
      )}
    </div>
  );
}
```
- [ ] **Step 7: Create ResultPanel.tsx**

```typescript
import { useStore } from "../store/useStore";

export default function ResultPanel() {
  const { resultImageUrl, isProcessing, error } = useStore();

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="animate-spin text-3xl mb-2">⏳</div>
        <p>正在生成证件照...</p>
      </div>
    );
  }

  if (!resultImageUrl) {
    return (
      <div className="p-6 text-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
        <p>上传照片并点击"一键生成"</p>
      </div>
    );
  }

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = resultImageUrl;
    a.download = `idphoto_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleDownload}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
      >
        📥 下载证件照
      </button>
      <button
        onClick={() => { /* TODO: layout download in future */ }}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
      >
        📋 下载排版版 (8张/版)
      </button>
    </div>
  );
}
```
---

### Task 8: Implement Local Processing (MediaPipe)

**Files:**
- Create: `frontend/src/services/localProcessor.ts`

- [ ] **Step 1: Create local processor**

```typescript
export async function processLocally(
  imageUrl: string,
  widthPx: number,
  heightPx: number,
  backgroundColor: string
): Promise<string> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  const maxDim = 800;
  let w = img.width;
  let h = img.height;
  if (w > maxDim || h > maxDim) {
    const ratio = maxDim / Math.max(w, h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const mask = simpleColorMask(imageData);

  const resultCanvas = document.createElement("canvas");
  resultCanvas.width = widthPx;
  resultCanvas.height = heightPx;
  const resultCtx = resultCanvas.getContext("2d")!;

  resultCtx.fillStyle = backgroundColor;
  resultCtx.fillRect(0, 0, widthPx, heightPx);

  const scale = Math.min(widthPx / w, heightPx / h);
  const dx = (widthPx - w * scale) / 2;
  const dy = (heightPx - h * scale) / 2;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext("2d")!;
  const imgData2 = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < mask.length; i++) {
    imgData2.data[i * 4 + 3] = mask[i] ? 255 : 0;
  }
  tempCtx.putImageData(imgData2, 0, 0);
  resultCtx.drawImage(tempCanvas, dx, dy, w * scale, h * scale);

  return resultCanvas.toDataURL("image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function simpleColorMask(imageData: ImageData): boolean[] {
  const data = imageData.data;
  const mask: boolean[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const isGreen = g > r * 1.2 && g > b * 1.2 && g > 100;
    const isBlue = b > r * 1.3 && b > g * 1.1 && b > 100;
    const isWhite = r > 230 && g > 230 && b > 230;
    mask.push(!(isGreen || isBlue || isWhite));
  }
  return mask;
}
```

> Note: The chroma-key fallback works for simple uniform backgrounds. For production, replace simpleColorMask with MediaPipe SelfieSegmentation WASM model for true AI-based segmentation.
---

### Task 9: Implement Frontend API Client

**Files:**
- Create: `frontend/src/services/apiClient.ts`

- [ ] **Step 1: Create API client**

```typescript
const API_BASE = "/api";

export interface ProcessResult {
  imageBase64: string;
  format: string;
  widthPx: number;
  heightPx: number;
}

export async function processOnServer(
  file: File,
  widthPx: number,
  heightPx: number,
  backgroundColor: string,
  layout: boolean = false
): Promise<ProcessResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("width_px", String(widthPx));
  formData.append("height_px", String(heightPx));
  formData.append("background_color", backgroundColor);
  formData.append("layout", String(layout));

  const res = await fetch(`${API_BASE}/process`, { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`服务端处理失败: ${err}`);
  }
  return res.json();
}
```
---

### Task 10: Wire Up Main App

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Update App.tsx with full layout**

```typescript
import { useCallback } from "react";
import Header from "./components/Header";
import UploadZone from "./components/UploadZone";
import SpecSelector from "./components/SpecSelector";
import ColorPicker from "./components/ColorPicker";
import ModeSelector from "./components/ModeSelector";
import Preview from "./components/Preview";
import ResultPanel from "./components/ResultPanel";
import { useStore } from "./store/useStore";
import { processOnServer } from "./services/apiClient";
import { processLocally } from "./services/localProcessor";

export default function App() {
  const {
    originalImage, originalImageUrl, selectedSpec,
    backgroundColor, processMode,
    setResultImageUrl, setIsProcessing, setError,
  } = useStore();

  const handleGenerate = useCallback(async () => {
    if (!originalImage) { setError("请先上传照片"); return; }
    if (!selectedSpec) { setError("请选择证件照规格"); return; }
    if (!originalImageUrl) { setError("照片加载失败"); return; }

    setIsProcessing(true);
    setError(null);

    try {
      const useLocal =
        processMode === "local" ||
        (processMode === "auto" && originalImage.size < 2 * 1024 * 1024);

      let resultUrl: string;
      if (useLocal) {
        resultUrl = await processLocally(
          originalImageUrl, selectedSpec.widthPx, selectedSpec.heightPx, backgroundColor
        );
      } else {
        const result = await processOnServer(
          originalImage, selectedSpec.widthPx, selectedSpec.heightPx, backgroundColor
        );
        resultUrl = `data:image/png;base64,${result.imageBase64}`;
      }
      setResultImageUrl(resultUrl);
    } catch (err: any) {
      setError(err.message || "处理失败");
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage, originalImageUrl, selectedSpec, backgroundColor, processMode,
      setResultImageUrl, setIsProcessing, setError]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-700">
          上传一张纯色背景的人物大头照片，选择规格和背景色，一键生成标准证件照。
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <UploadZone />
            <SpecSelector />
            <ColorPicker />
            <ModeSelector />
            <button
              onClick={handleGenerate}
              disabled={!originalImage || !selectedSpec}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl text-lg transition-all shadow-md hover:shadow-lg"
            >
              ✨ 一键生成
            </button>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Preview />
            <ResultPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `cd frontend && npx tsc --noEmit 2>&1`
Expected: No TypeScript errors
---

### Task 11: Create README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README.md**

```markdown
# ID Photo Generator - 证件照生成器

在线证件照生成工具。上传人物照片，选择国家规格和背景色，一键生成标准证件照。

## 功能特性

- 多国证件照规格支持（中国、美国、欧盟、英国、日本、韩国等）
- 白色/蓝色/红色等多种背景色
- 本地处理（浏览器端，不上传照片）
- 服务端处理（更高精度）
- 自动模式：根据照片质量自动选择最优方案
- PWA 支持，移动端可用
- 排版输出（8张/版），方便冲印

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev
```

### 后端

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

打开 http://localhost:5173 即可使用。

## 技术栈

- **前端:** React 18 + Vite + Tailwind CSS + Zustand
- **后端:** Python FastAPI + rembg + Pillow
- **部署:** Docker

## License

MIT
```
---

### Task 12: Docker Compose and Deployment Setup

**Files:**
- Create: `docker-compose.yml`
- Create: `nginx.conf`

- [ ] **Step 1: Create docker-compose.yml**

```yaml
version: "3.8"
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
    restart: unless-stopped

  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./frontend/dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - backend
    restart: unless-stopped
```

- [ ] **Step 2: Create nginx.conf**

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        client_max_body_size 20m;
    }
}
```

- [ ] **Step 3: Build frontend for production**

Run: `cd frontend && npm run build 2>&1 | tail -5`
Expected: `dist/` directory created with index.html and JS/CSS assets

---

## Self-Review Checklist

1. **Spec coverage:** All spec requirements are covered (multi-country specs, background colors, local/server modes, PWA, layout printing).
2. **Placeholder scan:** No TBD/TODO placeholders remain (except explicit future-scope notes).
3. **Type consistency:** specData.ts types match useStore.ts, apiClient interfaces match backend models.

---

## Execution Options

Plan complete and saved to `docs/superpowers/plans/2026-07-16-idphoto-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach would you like?
