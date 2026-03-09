import useCanvas from './hooks/useCanvas';
import useDivider from './hooks/useDivider';
import { FILTERS } from './constants/canvasConstants';
import TitleBar from './components/canvas/TitleBar';
import Toolbar from './components/canvas/Toolbar';
import SplitView from './components/canvas/SplitView';
import DrawingCanvas from './components/canvas/DrawingCanvas';
import PreviewPane from './components/canvas/PreviewPane';
import StatusBar from './components/canvas/StatusBar';

export default function App() {
  const canvas  = useCanvas();
  const divider = useDivider();

  const activeFilter = FILTERS.find((f) => f.id === canvas.filter);

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] overflow-hidden" style={{ userSelect: 'none' }}>
      <TitleBar activeFilterLabel={activeFilter.label} />

      <Toolbar
        tool={canvas.tool}               onToolChange={canvas.setTool}
        color={canvas.color}             onColorChange={canvas.setColor}
        brushSize={canvas.brushSize}     onBrushSizeChange={canvas.setBrushSize}
        filter={canvas.filter}           onFilterChange={canvas.setFilter}
        onClear={canvas.clearCanvas}
        onDownload={canvas.downloadCanvas}
      />

      <SplitView
        dividerPos={divider.dividerPos}
        containerRef={divider.containerRef}
        startDivDrag={divider.startDivDrag}
        activeFilter={activeFilter}
        leftPanel={
          <DrawingCanvas
            canvasRef={canvas.canvasRef}
            tool={canvas.tool}
            onMouseDown={canvas.onMouseDown}
            onMouseMove={canvas.onMouseMove}
            onStopDrawing={canvas.stopDrawing}
          />
        }
        rightPanel={
          <PreviewPane src={canvas.previewSrc} activeFilter={activeFilter} />
        }
      />

      <StatusBar
        mousePos={canvas.mousePos}
        tool={canvas.tool}
        brushSize={canvas.brushSize}
        color={canvas.color}
        activeFilter={activeFilter}
      />
    </div>
  );
}

