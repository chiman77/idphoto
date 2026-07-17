import { useStore } from "../store/useStore";
import { backgroundColors } from "../utils/colorData";

export default function ColorPicker() {
  const { backgroundColor, setBackgroundColor } = useStore();

  return (
    <div>
      <label className="card-title">背景颜色</label>
      <div className="flex gap-3 mb-3">
        {backgroundColors.map((color) => (
          <button
            key={color.hex}
            onClick={() => setBackgroundColor(color.hex)}
            className={
              "relative w-10 h-10 rounded-xl border-2 transition-all duration-200 " +
              (backgroundColor === color.hex
                ? "border-blue-500 scale-110 shadow-md shadow-blue-500/20"
                : "border-gray-200 hover:border-gray-400 hover:scale-105")
            }
            style={{ backgroundColor: color.hex }}
            title={color.name}
          >
            {backgroundColor === color.hex && (
              <svg className="absolute inset-0 w-full h-full p-2 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke={color.hex === "#FFFFFF" ? "#4A90D9" : "white"} strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 bg-white/50 rounded-xl px-3 py-2 border border-gray-100">
        <span className="text-xs text-gray-400 font-medium">自定义</span>
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
          className="w-7 h-7 p-0 border-0 cursor-pointer rounded-lg"
        />
        <span className="text-xs text-gray-400 font-mono">{backgroundColor}</span>
      </div>
    </div>
  );
}
