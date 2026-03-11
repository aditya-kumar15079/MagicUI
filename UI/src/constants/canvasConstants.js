export const CANVAS_W = 1920;
export const CANVAS_H = 1080;

export const PALETTE = [
  '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71',
  '#1abc9c', '#3498db', '#9b59b6', '#e91e63',
  '#ffffff', '#bdc3c7', '#7f8c8d', '#2c3e50', '#000000',
];

export const FILTERS = [
  { id: 'none',      label: 'Original',  css: 'none' },
  { id: 'grayscale', label: 'Grayscale', css: 'grayscale(100%)' },
  { id: 'sepia',     label: 'Sepia',     css: 'sepia(100%)' },
  { id: 'invert',    label: 'Invert',    css: 'invert(100%)' },
  { id: 'saturate',  label: 'Vivid',     css: 'saturate(300%)' },
  { id: 'blur',      label: 'Dream',     css: 'blur(2px) brightness(1.1)' },
];

export const TOOLS = [
  { id: 'pen',    label: 'Pen' },
  { id: 'eraser', label: 'Eraser' },
];
