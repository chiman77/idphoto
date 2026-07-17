export interface BackgroundColor {
  name: string;
  hex: string;
  rgb: string;
  description?: string;
}

export const backgroundColors: BackgroundColor[] = [
  { name: '\u767d\u8272', hex: '#FFFFFF', rgb: '255,255,255', description: '\u901a\u7528' },
  { name: '\u84dd\u8272', hex: '#4A90D9', rgb: '74,144,217', description: '\u62a4\u7167/\u7b7e\u8bc1/\u5de5\u4f5c\u8bc1' },
  { name: '\u7ea2\u8272', hex: '#ED1C24', rgb: '237,28,36', description: '\u4e2d\u56fd\u8bc1\u4ef6/\u7ed3\u5a5a\u7167' },
  { name: '\u6de1\u84dd\u8272', hex: '#B0C4DE', rgb: '176,196,222', description: '\u90e8\u5206\u9a7e\u7167\u7528' },
  { name: '\u7070\u8272', hex: '#D9D9D9', rgb: '217,217,217', description: '\u90e8\u5206\u56fd\u5bb6\u7b7e\u8bc1' },
];
