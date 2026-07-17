import { useCallback, useRef } from "react";
import { useStore } from "../store/useStore";

export default function UploadZone() {
  const { originalImage, originalImageUrl, setOriginalImage } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("请上传图片文件");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert("图片大小不能超过 20MB");
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

  const handleRemove = useCallback(() => {
    setOriginalImage(null);
  }, [setOriginalImage]);

  if (originalImageUrl) {
    return (
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 shadow-sm border border-gray-100">
            <img src={originalImageUrl} alt="preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{originalImage?.name || "照片"}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {originalImage ? `${(originalImage.size / 1024 / 1024).toFixed(1)} MB` : ""}
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
            title="移除照片"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className="card p-8 text-center cursor-pointer group hover:border-blue-300 transition-all"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>
      <p className="text-gray-600 font-medium">点击或拖拽上传照片</p>
      <p className="text-sm text-gray-400 mt-1">支持 JPG / PNG，建议纯色背景大头照</p>
    </div>
  );
}
