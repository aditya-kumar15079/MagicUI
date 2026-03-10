import PropTypes from 'prop-types';
import { CANVAS_W, CANVAS_H } from '../../constants/canvasConstants';

/* ── Individual SVG shape renderers ─────────────────────────── */

function Circle({ s }) {
  return (
    <circle
      cx={s.center.x}
      cy={s.center.y}
      r={s.radius}
      fill="none"
      stroke={s.color}
      strokeWidth={s.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Oval({ s }) {
  return (
    <ellipse
      cx={s.center.x}
      cy={s.center.y}
      rx={s.rx}
      ry={s.ry}
      fill="none"
      stroke={s.color}
      strokeWidth={s.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      transform={`rotate(${s.angle ?? 0}, ${s.center.x}, ${s.center.y})`}
    />
  );
}

function Rect({ s }) {
  const w = s.width;
  const h = s.height;
  return (
    <rect
      x={s.center.x - w / 2}
      y={s.center.y - h / 2}
      width={w}
      height={h}
      fill="none"
      stroke={s.color}
      strokeWidth={s.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      transform={`rotate(${s.angle ?? 0}, ${s.center.x}, ${s.center.y})`}
    />
  );
}

function Polygon({ s }) {
  const pts = s.vertices.map((v) => `${v[0]},${v[1]}`).join(' ');
  return (
    <polygon
      points={pts}
      fill="none"
      stroke={s.color}
      strokeWidth={s.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function renderShape(shape, i) {
  switch (shape.type) {
    case 'circle':
      return <Circle key={i} s={shape} />;
    case 'oval':
      return <Oval key={i} s={shape} />;
    case 'square':
    case 'rectangle':
      return <Rect key={i} s={shape} />;
    case 'triangle':
    case 'polygon':
      return <Polygon key={i} s={shape} />;
    default:
      return null;
  }
}

/* ── Main component ─────────────────────────────────────────── */

const PreviewPane = function PreviewPane({ src, activeFilter, shapes, loading }) {
  const hasShapes = shapes && shapes.length > 0;

  return (
    <div className="relative" style={{ width: CANVAS_W, height: CANVAS_H }}>
      {/* Raster fallback — always visible behind SVG */}
      {src && (
        <img
          src={src}
          alt="Live preview"
          className="block absolute inset-0"
          style={{
            width:    CANVAS_W,
            height:   CANVAS_H,
            filter:   activeFilter.css,
            opacity:  hasShapes ? 0.15 : 1,
            transition: 'opacity 0.3s',
          }}
        />
      )}

      {/* SVG perfect shapes overlay */}
      {hasShapes && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={CANVAS_W}
          height={CANVAS_H}
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          className="absolute inset-0"
          style={{ filter: activeFilter.css }}
        >
          <rect width="100%" height="100%" fill="white" />
          {shapes.map(renderShape)}
        </svg>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded bg-[#0e639c]/80 text-white text-[10px] font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
          Detecting…
        </div>
      )}
    </div>
  );
};

PreviewPane.propTypes = {
  src: PropTypes.string,
  activeFilter: PropTypes.shape({
    id:    PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    css:   PropTypes.string.isRequired,
  }).isRequired,
  shapes:  PropTypes.array,
  loading: PropTypes.bool,
};

PreviewPane.defaultProps = {
  src: '',
  shapes: [],
  loading: false,
};

export default PreviewPane;
