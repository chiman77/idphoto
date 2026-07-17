import { useStore } from "../store/useStore";

export default function ModeSelector() {
  const { processMode, setProcessMode } = useStore();

  return (
    <div>
      <label className="card-title">处理方式</label>
      <div className="flex gap-3">
        <button
          onClick={() => setProcessMode("server")}
          className={"mode-btn " + (processMode === "server" ? "mode-btn-active" : "mode-btn-inactive")}
        >
          <div className="text-lg mb-1">
            <svg className="w-5 h-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
          </div>
          <div className="font-semibold">在线精修</div>
          <div className="text-[10px] opacity-75 mt-0.5">画质更锐利 · 需后端服务</div>
        </button>
        <button
          onClick={() => setProcessMode("localhd")}
          className={"mode-btn " + (processMode === "localhd" ? "mode-btn-active" : "mode-btn-inactive")}
        >
          <div className="text-lg mb-1">
            <svg className="w-5 h-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
          </div>
          <div className="font-semibold">本地精修</div>
          <div className="text-[10px] opacity-75 mt-0.5">纯本地处理 · 不上传更安全</div>
        </button>
      </div>
    </div>
  );
}
