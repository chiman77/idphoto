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

  const res = await fetch(API_BASE + "/process", { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("服务端处理失败: " + err);
  }
  return res.json();
}
