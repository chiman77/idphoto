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
import { processLocalHD } from "./services/localHdProcessor";

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
      let resultUrl: string;

      if (processMode === "localhd") {
        resultUrl = await processLocalHD(
          originalImageUrl, selectedSpec.widthPx, selectedSpec.heightPx, backgroundColor
        );
      } else {
        const result = await processOnServer(
          originalImage, selectedSpec.widthPx, selectedSpec.heightPx, backgroundColor
        );
        resultUrl = "data:image/png;base64," + result.imageBase64;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            一键生成专业证件照
          </h2>
          <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
            上传照片 · 选择规格 · 自动处理 · 高清导出
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left panel - Controls */}
          <div className="lg:col-span-2 space-y-5">
            <UploadZone />
            <div className="card p-4 space-y-5">
              <SpecSelector />
              <div className="border-t border-gray-100" />
              <ColorPicker />
              <div className="border-t border-gray-100" />
              <ModeSelector />
            </div>
            <button
              onClick={handleGenerate}
              disabled={!originalImage || !selectedSpec}
              className="btn-primary flex items-center justify-center gap-2 text-base"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              一键生成
            </button>
          </div>

          {/* Right panel - Preview */}
          <div className="lg:col-span-3 space-y-5">
            <Preview />
            <ResultPanel />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pb-6 text-center">
          <p className="text-xs text-gray-300">
            照片仅在处理过程中使用，不会永久存储
          </p>
        </footer>
      </main>
    </div>
  );
}
