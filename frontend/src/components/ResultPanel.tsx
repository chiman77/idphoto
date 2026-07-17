import { useStore } from "../store/useStore";

export default function ResultPanel() {
  const { resultImageUrl, isProcessing, error, selectedSpec } = useStore();

  if (error) {
    return (
      <div className="card p-4 border-red-200/50 bg-red-50/80">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-700">处理出错</p>
            <p className="text-xs text-red-500 mt-0.5 break-words">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="card p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 animate-pulse opacity-20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-7 h-7 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        </div>
        <p className="text-sm font-medium text-gray-600">正在生成证件照...</p>
        <p className="text-xs text-gray-400 mt-1">请稍等，这需要几秒钟</p>
      </div>
    );
  }

  if (!resultImageUrl) {
    return (
      <div className="card p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center">
          <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <p className="text-sm text-gray-400">上传照片并点击"一键生成"</p>
      </div>
    );
  }

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = resultImageUrl;
    a.download = "idphoto_" + Date.now() + ".png";
    a.click();
  };

  const handleDownloadLayout = () => {
    if (!selectedSpec || selectedSpec.widthPx === 0) return;

    const specW = selectedSpec.widthPx;
    const specH = selectedSpec.heightPx;
    const cols = 4;
    const rows = 2;
    const margin = 20;
    const sheetW = specW * cols + margin * (cols + 1);
    const sheetH = specH * rows + margin * (rows + 1);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = sheetW;
      canvas.height = sheetH;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, sheetW, sheetH);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = margin + col * (specW + margin);
          const y = margin + row * (specH + margin);
          ctx.drawImage(img, x, y, specW, specH);
        }
      }
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "idphoto_layout_" + Date.now() + ".png";
      a.click();
    };
    img.src = resultImageUrl;
  };

  return (
    <div className="space-y-3">
      <button onClick={handleDownload} className="btn-primary flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        下载证件照
      </button>
      <button
        onClick={handleDownloadLayout}
        className="btn-secondary flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
        下载排版版（8张版）
      </button>
    </div>
  );
}

