import { memo } from 'react';
import PropTypes from 'prop-types';
import { PALETTE, FILTERS, TOOLS } from '../../constants/canvasConstants';

const BTN_BASE  = 'flex items-center gap-1.5 px-2.5 py-[3px] text-[12px] font-mono rounded transition-colors cursor-pointer';
const BTN_TOOL  = `${BTN_BASE} text-[#cccccc] hover:bg-[#3a3a3a]`;
const BTN_ACTIVE = `${BTN_BASE} bg-[#0e639c] text-white`;
const BTN_ACTION = `${BTN_BASE} text-[#cccccc] hover:bg-[#3a3a3a]`;

const Sep = () => <div className="h-5 w-px bg-[#454545] mx-1 shrink-0" />;

const Toolbar = memo(function Toolbar({
  tool, onToolChange,
  color, onColorChange,
  brushSize, onBrushSizeChange,
  filter, onFilterChange,
  onClear, onDownload,
}) {
  const dotSize = Math.min(brushSize, 22);

  return (
    <div className="flex items-center flex-wrap gap-1.5 px-4 py-1.5 bg-[#2d2d2d] border-b border-[#3a3a3a] shrink-0">

      {/* Tool selector */}
      <div className="flex items-center gap-1">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => onToolChange(t.id)}
            title={t.label}
            className={tool === t.id ? BTN_ACTIVE : BTN_TOOL}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Sep />

      {/* Color picker + palette */}
      <div className="flex items-center gap-1.5">
        <label className="text-[#858585] text-[11px] font-mono mr-0.5">Color</label>
        <div className="relative">
          <div className="w-6 h-6 rounded border border-[#555]" style={{ background: color }} />
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <div className="flex gap-[3px] ml-1">
          {PALETTE.map((c) => (
            <button
              key={c}
              title={c}
              onClick={() => { onColorChange(c); onToolChange('pen'); }}
              className="w-4 h-4 rounded-sm border transition-transform hover:scale-125 shrink-0"
              style={{
                background:  c,
                borderColor: color === c ? '#fff' : '#555',
                boxShadow:   color === c ? '0 0 0 1px #0e639c' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <Sep />

      {/* Brush size */}
      <div className="flex items-center gap-2">
        <label className="text-[#858585] text-[11px] font-mono">Size</label>
        <input
          type="range" min="1" max="40" value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          className="w-24 accent-[#0e639c] cursor-pointer"
        />
        <span className="text-[#cccccc] text-[11px] font-mono w-5 tabular-nums">{brushSize}</span>
        <div className="flex items-center justify-center w-9 h-6 rounded bg-[#1e1e1e]">
          <div
            className="rounded-full"
            style={{
              width:      dotSize,
              height:     dotSize,
              background: tool === 'eraser' ? '#777' : color,
              opacity:    0.9,
            }}
          />
        </div>
      </div>

      <Sep />

      {/* Filter selector */}
      <div className="flex items-center gap-1.5">
        <label className="text-[#858585] text-[11px] font-mono">Filter</label>
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="bg-[#3a3a3a] text-[#cccccc] text-[11px] font-mono px-2 py-[3px] rounded border border-[#555] cursor-pointer outline-none"
        >
          {FILTERS.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
      </div>

      <Sep />

      {/* Actions */}
      <button onClick={onClear}    className={BTN_ACTION}>🗑 Clear</button>
      <button onClick={onDownload} className={BTN_ACTION}>⬇ Save</button>
    </div>
  );
});

Toolbar.propTypes = {
  tool:              PropTypes.string.isRequired,
  onToolChange:      PropTypes.func.isRequired,
  color:             PropTypes.string.isRequired,
  onColorChange:     PropTypes.func.isRequired,
  brushSize:         PropTypes.number.isRequired,
  onBrushSizeChange: PropTypes.func.isRequired,
  filter:            PropTypes.string.isRequired,
  onFilterChange:    PropTypes.func.isRequired,
  onClear:           PropTypes.func.isRequired,
  onDownload:        PropTypes.func.isRequired,
};

export default Toolbar;
