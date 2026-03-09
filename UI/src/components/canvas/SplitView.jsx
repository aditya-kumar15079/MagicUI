import { useState } from 'react';
import PropTypes from 'prop-types';
import PaneDivider from './PaneDivider';

const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

function nextZoom(current, dir) {
  if (dir > 0) {
    const z = ZOOM_STEPS.find((s) => s > current + 0.001);
    return z ?? ZOOM_STEPS[ZOOM_STEPS.length - 1];
  }
  const z = [...ZOOM_STEPS].reverse().find((s) => s < current - 0.001);
  return z ?? ZOOM_STEPS[0];
}

const ZoomBar = ({ zoom, setZoom }) => (
  <div className="flex items-center gap-0.5 ml-auto shrink-0">
    <button
      onMouseDown={(e) => e.stopPropagation()}
      onClick={() => setZoom((z) => nextZoom(z, -1))}
      className="text-[#858585] hover:text-[#cccccc] px-1.5 text-[13px] font-mono leading-none select-none"
      title="Zoom out"
    >−</button>
    <span
      className="text-[#858585] hover:text-[#cccccc] text-[10px] font-mono w-9 text-center tabular-nums cursor-pointer select-none"
      onClick={() => setZoom(1)}
      title="Reset to 100%"
    >{Math.round(zoom * 100)}%</span>
    <button
      onMouseDown={(e) => e.stopPropagation()}
      onClick={() => setZoom((z) => nextZoom(z, 1))}
      className="text-[#858585] hover:text-[#cccccc] px-1.5 text-[13px] font-mono leading-none select-none"
      title="Zoom in"
    >+</button>
  </div>
);

ZoomBar.propTypes = {
  zoom:    PropTypes.number.isRequired,
  setZoom: PropTypes.func.isRequired,
};

const SplitView = function SplitView({
  dividerPos,
  containerRef,
  startDivDrag,
  activeFilter,
  leftPanel,
  rightPanel,
}) {
  const [leftZoom,  setLeftZoom]  = useState(1);
  const [rightZoom, setRightZoom] = useState(1);

  return (
    <>
      {/* Pane header labels — mirrors VS Code compare tab headers */}
      <div className="flex shrink-0 bg-[#252526] border-b border-[#1e1e1e]" style={{ minHeight: 28 }}>
        <div
          className="flex items-center gap-2 px-3 border-r border-[#1e1e1e] overflow-hidden"
          style={{ width: `${dividerPos}%` }}
        >
          <span className="text-[#cccccc] text-[12px] font-mono truncate">canvas.draw</span>
          <span className="px-1.5 py-px text-[10px] font-mono rounded-sm text-white bg-[#0e639c] shrink-0">DRAW</span>
          <ZoomBar zoom={leftZoom} setZoom={setLeftZoom} />
        </div>
        <div className="w-1 shrink-0 bg-[#252526]" />
        <div className="flex items-center gap-2 px-3 flex-1 overflow-hidden">
          <span className="text-[#cccccc] text-[12px] font-mono truncate">preview.png</span>
          <span className="px-1.5 py-px text-[10px] font-mono rounded-sm text-white bg-[#383838] shrink-0">
            {activeFilter.label}
          </span>
          <ZoomBar zoom={rightZoom} setZoom={setRightZoom} />
        </div>
      </div>

      {/* Split panels */}
      <div ref={containerRef} className="flex flex-1 min-h-0">
        <div className="flex flex-col min-h-0" style={{ width: `${dividerPos}%` }}>
          <div className="flex-1 overflow-scroll vscode-scroll bg-[#1a1a2e]">
            <div style={{ display: 'inline-block', zoom: leftZoom }}>
              {leftPanel}
            </div>
          </div>
        </div>

        <PaneDivider onMouseDown={startDivDrag} />

        <div className="flex flex-col min-h-0 flex-1">
          <div className="flex-1 overflow-scroll vscode-scroll bg-[#1a1a2e]">
            <div style={{ display: 'inline-block', zoom: rightZoom }}>
              {rightPanel}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

SplitView.propTypes = {
  dividerPos:   PropTypes.number.isRequired,
  containerRef: PropTypes.shape({ current: PropTypes.object }).isRequired,
  startDivDrag: PropTypes.func.isRequired,
  activeFilter: PropTypes.shape({
    id:    PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    css:   PropTypes.string.isRequired,
  }).isRequired,
  leftPanel:  PropTypes.node.isRequired,
  rightPanel: PropTypes.node.isRequired,
};

export default SplitView;
