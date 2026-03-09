import PropTypes from 'prop-types';

const DOTS = [0, 1, 2, 3, 4];

const PaneDivider = function PaneDivider({ onMouseDown }) {
  return (
    <div
      className="relative w-1 shrink-0 bg-[#252526] hover:bg-[#0e639c] cursor-col-resize z-20 transition-colors duration-100 group"
      onMouseDown={onMouseDown}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-[3px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        {DOTS.map((i) => (
          <div key={i} className="w-px h-1 bg-white rounded-full" />
        ))}
      </div>
    </div>
  );
};

PaneDivider.propTypes = {
  onMouseDown: PropTypes.func.isRequired,
};

export default PaneDivider;
