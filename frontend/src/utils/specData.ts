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
    country: '\u4e2d\u56fd',
    countryCode: 'CN',
    specs: [
      { name: '1\u5bf8', label: '1\u5bf8', widthMm: 25, heightMm: 35, widthPx: 295, heightPx: 413, dpi: 300 },
      { name: '\u5927\u4e00\u5bf8', label: '\u5927\u4e00\u5bf8', widthMm: 33, heightMm: 48, widthPx: 390, heightPx: 567, dpi: 300 },
      { name: '\u5c0f\u4e00\u5bf8', label: '\u5c0f\u4e00\u5bf8', widthMm: 22, heightMm: 32, widthPx: 260, heightPx: 378, dpi: 300 },
      { name: '2\u5bf8', label: '2\u5bf8', widthMm: 35, heightMm: 53, widthPx: 413, heightPx: 626, dpi: 300 },
      { name: '\u5927\u4e8c\u5bf8', label: '\u5927\u4e8c\u5bf8', widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300 },
    ],
  },
  {
    country: '\u7f8e\u56fd',
    countryCode: 'US',
    specs: [
      { name: '2x2in', label: '2x2 \u82f1\u5bf8 (\u62a4\u7167/\u7b7e\u8bc1)', widthMm: 51, heightMm: 51, widthPx: 600, heightPx: 600, dpi: 300 },
      { name: '1x1.5in', label: '1x1.5 \u82f1\u5bf8 (\u9a7e\u7167)', widthMm: 25, heightMm: 38, widthPx: 300, heightPx: 450, dpi: 300 },
    ],
  },
  {
    country: '\u6b27\u76df/\u7533\u6839',
    countryCode: 'EU',
    specs: [
      { name: '35x45mm', label: '35x45mm (\u62a4\u7167/\u7b7e\u8bc1)', widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300 },
      { name: '30x40mm', label: '30x40mm', widthMm: 30, heightMm: 40, widthPx: 354, heightPx: 472, dpi: 300 },
    ],
  },
  {
    country: '\u82f1\u56fd',
    countryCode: 'GB',
    specs: [
      { name: '35x45mm', label: '35x45mm (\u62a4\u7167)', widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300 },
      { name: '45x35mm', label: '45x35mm (\u7b7e\u8bc1)', widthMm: 45, heightMm: 35, widthPx: 531, heightPx: 413, dpi: 300 },
    ],
  },
  {
    country: '\u65e5\u672c',
    countryCode: 'JP',
    specs: [
      { name: '3x4cm', label: '3x4cm', widthMm: 30, heightMm: 40, widthPx: 354, heightPx: 472, dpi: 300 },
      { name: '4.5x4.5cm', label: '4.5x4.5cm', widthMm: 45, heightMm: 45, widthPx: 531, heightPx: 531, dpi: 300 },
    ],
  },
  {
    country: '\u97e9\u56fd',
    countryCode: 'KR',
    specs: [
      { name: '35x45mm', label: '3.5x4.5cm', widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, dpi: 300 },
      { name: '35x35mm', label: '3.5x3.5cm', widthMm: 35, heightMm: 35, widthPx: 413, heightPx: 413, dpi: 300 },
    ],
  },
  {
    country: '\u901a\u7528',
    countryCode: '\u901a\u7528',
    specs: [
      { name: 'custom', label: '\u81ea\u5b9a\u4e49\u5c3a\u5bf8', widthMm: 0, heightMm: 0, widthPx: 0, heightPx: 0, dpi: 300 },
    ],
  },
];
