import PropTypes from 'prop-types';
import { CANVAS_W, CANVAS_H } from '../../constants/canvasConstants';

const StatusBar = function StatusBar({
  mousePos,
  tool,
  brushSize,
  color,
  activeFilter,
}) {
  return (
    <div className="flex items-center gap-3 px-4 h-6 bg-[#007acc] shrink-0">
      <span className="text-white text-[11px] font-mono">
        {CANVAS_W} × {CANVAS_H}px
      </span>
      <span className="text-white opacity-40 text-[11px]">·</span>

      <span className="text-white text-[11px] font-mono">
        {tool === 'eraser' ? 'Eraser' : 'Pen'} · {brushSize}px
      </span>
      <span className="text-white opacity-40 text-[11px]">·</span>

      <span className="text-white text-[11px] font-mono flex items-center">
        <span
          className="inline-block w-2.5 h-2.5 rounded-sm mr-1.5 align-middle"
          style={{ background: color }}
        />
        {color.toUpperCase()}
      </span>
      <span className="text-white opacity-40 text-[11px]">·</span>

      <span className="text-white text-[11px] font-mono">
        {mousePos.x}, {mousePos.y}
      </span>

      <div className="ml-auto">
        <span className="text-white opacity-70 text-[11px] font-mono">
          Canvas Studio · {activeFilter.label}
        </span>
      </div>
    </div>
  );
};

StatusBar.propTypes = {
  mousePos: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  tool:      PropTypes.string.isRequired,
  brushSize: PropTypes.number.isRequired,
  color:     PropTypes.string.isRequired,
  activeFilter: PropTypes.shape({
    id:    PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    css:   PropTypes.string.isRequired,
  }).isRequired,
};

export default StatusBar;
