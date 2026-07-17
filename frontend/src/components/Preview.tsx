import { useStore } from "../store/useStore";

export default function Preview() {
  const { originalImageUrl, resultImageUrl } = useStore();
  if (!originalImageUrl) return null;

  return (
    <div className="space-y-4">
      <div className="preview-card">
        <div className="px-4 py-2.5 border-b border-gray-50 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">原始照片</span>
        </div>
        <div className="p-3 bg-gradient-to-b from-gray-50/50 to-white flex items-center justify-center min-h-[180px]">
          <img src={originalImageUrl} alt="Original" className="max-w-full max-h-52 object-contain rounded-lg shadow-sm" />
        </div>
      </div>
      {resultImageUrl && (
        <div className="preview-card ring-2 ring-green-500/10">
          <div className="px-4 py-2.5 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50/50">
            <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">生成结果</span>
            <span className="text-[10px] text-green-400 font-medium bg-green-100/50 px-2 py-0.5 rounded-full">完成</span>
          </div>
          <div className="p-3 bg-gradient-to-b from-green-50/30 to-white flex items-center justify-center min-h-[180px]">
            <img src={resultImageUrl} alt="Result" className="max-w-full max-h-52 object-contain rounded-lg shadow-md" />
          </div>
        </div>
      )}
    </div>
  );
}
