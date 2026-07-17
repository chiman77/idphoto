import { useStore } from "../store/useStore";
import { countrySpecs } from "../utils/specData";

export default function SpecSelector() {
  const { selectedCountry, setSelectedCountry, selectedSpec, setSelectedSpec } = useStore();
  const currentCountry = countrySpecs.find((c) => c.countryCode === selectedCountry) ?? countrySpecs[0];

  return (
    <div className="space-y-3">
      <div>
        <label className="card-title">国家 / 地区</label>
        <div className="relative">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          >
            {countrySpecs.map((c) => (
              <option key={c.countryCode} value={c.countryCode}>{c.country}</option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <div>
        <label className="card-title">证件照规格</label>
        <div className="grid grid-cols-2 gap-2">
          {currentCountry.specs.map((spec) => (
            <button
              key={spec.name}
              onClick={() => setSelectedSpec(spec)}
              className={
                "text-left px-3 py-2.5 rounded-xl border text-sm transition-all " +
                (selectedSpec?.name === spec.name
                  ? "border-blue-500 bg-blue-50/80 text-blue-700 shadow-sm"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm text-gray-600")
              }
            >
              <div className="font-medium">{spec.label}</div>
              {spec.widthPx > 0 && (
                <div className="text-xs text-gray-400 mt-0.5">
                  {spec.widthMm}x{spec.heightMm}mm · {spec.widthPx}x{spec.heightPx}px
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
