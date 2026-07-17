import * as ort from "onnxruntime-web";

// Detect base URL dynamically - works for both root and sub-path deployments
// Use CDN for ONNX Runtime WASM files (faster globally)
const WASM_CDN = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/';

const BASE = (() => {
  const path = location.pathname;
  return path.endsWith('/') ? path : path.substring(0, path.lastIndexOf('/') + 1);
})();
ort.env.wasm.numThreads = 1;
// Use jsDelivr CDN for ORT WASM (faster than GitHub Pages, especially from China)
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/";

const MODEL_URL = BASE + "models/hivision_modnet.onnx";
const INPUT_SIZE = 512;

let session: ort.InferenceSession | null = null;
let sessionLoading: Promise<ort.InferenceSession> | null = null;

// Increase timeout - first load downloads ~50MB (WASM + model) from GitHub Pages
// On some connections this may take 2-3 minutes
const LOAD_TIMEOUT = 180000; // 60 seconds timeout for model loading

async function getSession(): Promise<ort.InferenceSession> {
  if (session) return session;
  if (sessionLoading) return sessionLoading;
  sessionLoading = (async () => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('模型加载超时（3分钟），首次使用需下载约50MB文件，请确保网络通畅或在较好的网络环境下重试')), LOAD_TIMEOUT)
    );
    try {
      console.log('Loading hivision_modnet model for Local HD...');
      console.log('Model URL:', MODEL_URL);
      const s = await Promise.race([
        ort.InferenceSession.create(MODEL_URL, {
          executionProviders: ['wasm'],
        }),
        timeout
      ]) as ort.InferenceSession;
      console.log('Model loaded:', s.inputNames, '->', s.outputNames);
      session = s;
      return s;
    } catch (err: any) {
      sessionLoading = null;
      console.error('Model loading failed:', err);
      throw new Error('模型加载失败: ' + (err.message || err));
    }
  })();
  return sessionLoading;
}

function preprocess(ctx: CanvasRenderingContext2D, w: number, h: number): Float32Array {
  const resizeCanvas = document.createElement("canvas");
  resizeCanvas.width = INPUT_SIZE;
  resizeCanvas.height = INPUT_SIZE;
  const rCtx = resizeCanvas.getContext("2d")!;
  rCtx.drawImage(ctx.canvas, 0, 0, INPUT_SIZE, INPUT_SIZE);
  const resized = rCtx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
  const pixels = resized.data;
  const nchw = new Float32Array(1 * 3 * INPUT_SIZE * INPUT_SIZE);
  for (let y = 0; y < INPUT_SIZE; y++) {
    for (let x = 0; x < INPUT_SIZE; x++) {
      const srcIdx = (y * INPUT_SIZE + x) * 4;
      const r = pixels[srcIdx] / 255.0;
      const g = pixels[srcIdx + 1] / 255.0;
      const b = pixels[srcIdx + 2] / 255.0;
      nchw[0 * INPUT_SIZE * INPUT_SIZE + y * INPUT_SIZE + x] = (b - 0.5) / 0.5;
      nchw[1 * INPUT_SIZE * INPUT_SIZE + y * INPUT_SIZE + x] = (g - 0.5) / 0.5;
      nchw[2 * INPUT_SIZE * INPUT_SIZE + y * INPUT_SIZE + x] = (r - 0.5) / 0.5;
    }
  }
  return nchw;
}

function scaleMatte(matte: Float32Array, targetW: number, targetH: number): Float32Array {
  const srcSize = INPUT_SIZE;
  const src = new Float32Array(srcSize * srcSize);
  for (let y = 0; y < srcSize; y++)
    for (let x = 0; x < srcSize; x++)
      src[y * srcSize + x] = matte[y * srcSize + x];
  const dst = new Float32Array(targetW * targetH);
  const xRatio = srcSize / targetW;
  const yRatio = srcSize / targetH;
  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const srcX = x * xRatio;
      const srcY = y * yRatio;
      const x1 = Math.floor(srcX);
      const y1 = Math.floor(srcY);
      const x2 = Math.min(x1 + 1, srcSize - 1);
      const y2 = Math.min(y1 + 1, srcSize - 1);
      const fx = srcX - x1;
      const fy = srcY - y1;
      const v = src[y1 * srcSize + x1] * (1 - fx) * (1 - fy) +
                src[y1 * srcSize + x2] * fx * (1 - fy) +
                src[y2 * srcSize + x1] * (1 - fx) * fy +
                src[y2 * srcSize + x2] * fx * fy;
      dst[y * targetW + x] = v;
    }
  }
  return dst;
}

function smartCropAndResize(
  ctx: CanvasRenderingContext2D,
  origW: number,
  origH: number,
  targetW: number,
  targetH: number
): void {
  const targetRatio = targetW / targetH;
  let cropW: number, cropH: number;
  if (origW / origH > targetRatio) {
    cropW = Math.round(origH * targetRatio);
    cropH = origH;
  } else {
    cropW = origW;
    cropH = Math.round(origW / targetRatio);
  }
  const left = Math.round((origW - cropW) / 2);
  const top = Math.round((origH - cropH) / 2);

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = cropW;
  tempCanvas.height = cropH;
  const tCtx = tempCanvas.getContext("2d")!;
  tCtx.drawImage(ctx.canvas, left, top, cropW, cropH, 0, 0, cropW, cropH);

  ctx.canvas.width = targetW;
  ctx.canvas.height = targetH;
  ctx.drawImage(tempCanvas, 0, 0, cropW, cropH, 0, 0, targetW, targetH);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = src;
  });
}

export async function processLocalHD(
  imageUrl: string,
  widthPx: number,
  heightPx: number,
  backgroundColor: string
): Promise<string> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);

  const origW = img.width;
  const origH = img.height;

  // 1) Run hivision_modnet inference to get alpha matte
  const inputTensor = preprocess(ctx, origW, origH);
  const ortSession = await getSession();
  const feeds: Record<string, ort.Tensor> = {};
  feeds[ortSession.inputNames[0]] = new ort.Tensor("float32", inputTensor, [1, 3, INPUT_SIZE, INPUT_SIZE]);
  const results = await ortSession.run(feeds);
  const outputTensor = results[ortSession.outputNames[0]] as ort.Tensor;
  const matte = outputTensor.data as Float32Array;

  // 2) Build RGBA with mask
  const imageData = ctx.getImageData(0, 0, origW, origH);
  const pixels = imageData.data;
  const maskData = scaleMatte(matte, origW, origH);

  // Contrast stretch like backend
  for (let i = 0; i < maskData.length; i++) {
    let v = maskData[i];
    v = v > 0.15 ? Math.min(1.0, (v - 0.15) / 0.85) : 0;
    maskData[i] = v;
  }

  const rgba = new Uint8ClampedArray(origW * origH * 4);
  for (let i = 0; i < origW * origH; i++) {
    const alpha = Math.round(maskData[i] * 255);
    rgba[i * 4] = pixels[i * 4];
    rgba[i * 4 + 1] = pixels[i * 4 + 1];
    rgba[i * 4 + 2] = pixels[i * 4 + 2];
    rgba[i * 4 + 3] = alpha;
  }

  const resultCanvas = document.createElement("canvas");
  resultCanvas.width = origW;
  resultCanvas.height = origH;
  const rCtx = resultCanvas.getContext("2d")!;
  rCtx.putImageData(new ImageData(rgba, origW, origH), 0, 0);

  // GPU feather (edge smoothing)
  rCtx.filter = "blur(1.5px)";
  rCtx.drawImage(resultCanvas, 0, 0);
  rCtx.filter = "none";

  // 3) Smart crop to target aspect ratio + resize to exact dimensions
  smartCropAndResize(rCtx, origW, origH, widthPx, heightPx);

  // 4) Composite on target background color
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = widthPx;
  finalCanvas.height = heightPx;
  const fCtx = finalCanvas.getContext("2d")!;
  fCtx.fillStyle = backgroundColor;
  fCtx.fillRect(0, 0, widthPx, heightPx);
  fCtx.filter = "brightness(1.08) contrast(1.04)";
  fCtx.drawImage(resultCanvas, 0, 0, widthPx, heightPx);
  fCtx.filter = "none";

  const dataUrl = finalCanvas.toDataURL("image/png");
  if (!dataUrl || dataUrl === "data:," || dataUrl.length < 100) {
    throw new Error("HD处理生成结果为空");
  }
  return dataUrl;
}







