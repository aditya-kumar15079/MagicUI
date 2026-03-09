import { memo } from 'react';
import PropTypes from 'prop-types';

const DrawingCanvas = memo(function DrawingCanvas({
  canvasRef,
  tool,
  onMouseDown,
  onMouseMove,
  onStopDrawing,
}) {
  return (
    <canvas
      ref={canvasRef}
      width={2000}
      height={700}
      className="block"
      style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onStopDrawing}
      onMouseLeave={onStopDrawing}
    />
  );
});

DrawingCanvas.propTypes = {
  canvasRef:     PropTypes.shape({ current: PropTypes.object }).isRequired,
  tool:          PropTypes.string.isRequired,
  onMouseDown:   PropTypes.func.isRequired,
  onMouseMove:   PropTypes.func.isRequired,
  onStopDrawing: PropTypes.func.isRequired,
};

export default DrawingCanvas;
