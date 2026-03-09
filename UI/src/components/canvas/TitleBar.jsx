import { memo } from 'react';
import PropTypes from 'prop-types';

const TitleBar = memo(function TitleBar({ activeFilterLabel }) {
  return (
    <div className="flex items-center gap-3 px-4 h-9 bg-[#323233] border-b border-[#252526] shrink-0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cccccc" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2.5" />
        <path d="M7 8h5M7 12h8M7 16h4" strokeLinecap="round" />
      </svg>
      <span className="text-[#cccccc] text-[13px] font-medium tracking-tight">Canvas Studio</span>

      <div className="h-4 w-px bg-[#454545] mx-1" />

      <div className="flex items-center gap-1.5 px-3 py-[2px] bg-[#1e1e1e] text-[#cccccc] text-[12px] rounded-t-sm border-t-[2px] border-t-[#0e639c] font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 opacity-90" />
        canvas.draw ↔ preview.png
        <span className="ml-1 text-[10px] text-[#858585]">({activeFilterLabel})</span>
      </div>
    </div>
  );
});

TitleBar.propTypes = {
  activeFilterLabel: PropTypes.string.isRequired,
};

export default TitleBar;
