import { useState, useRef, useEffect, useCallback } from 'react';
import { CANVAS_W, CANVAS_H } from '../constants/canvasConstants';

const useCanvas = () => {
  const [tool, setTool]             = useState('pen');
  const [color, setColor]           = useState('#e74c3c');
  const [brushSize, setBrushSize]   = useState(6);
  const [filter, setFilter]         = useState('none');
  const [previewSrc, setPreviewSrc] = useState('');
  const [mousePos, setMousePos]     = useState({ x: 0, y: 0 });

  // Stroke collection for shape detection
  const [strokes, setStrokes]       = useState([]);
  const currentStrokeRef            = useRef([]);

  const canvasRef     = useRef(null);
  const isDrawingRef  = useRef(false);
  const lastPosRef    = useRef(null);
  const rafRef        = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    setPreviewSrc(canvasRef.current.toDataURL());
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const schedulePreview = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (canvasRef.current) setPreviewSrc(canvasRef.current.toDataURL());
    });
  }, []);

  const getPos = useCallback((e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }, []);

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    const pos  = getPos(e);
    const ctx  = canvasRef.current.getContext('2d');
    const size = tool === 'eraser' ? brushSize * 4 : brushSize;
    isDrawingRef.current = true;
    lastPosRef.current   = pos;
    currentStrokeRef.current = [{ x: pos.x, y: pos.y }];
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.fill();
    schedulePreview();
  }, [tool, color, brushSize, getPos, schedulePreview]);

  const onMouseMove = useCallback((e) => {
    const pos = getPos(e);
    setMousePos({ x: Math.round(pos.x), y: Math.round(pos.y) });
    if (!isDrawingRef.current) return;
    const ctx  = canvasRef.current.getContext('2d');
    const size = tool === 'eraser' ? brushSize * 4 : brushSize;
    currentStrokeRef.current.push({ x: pos.x, y: pos.y });
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle  = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth    = size;
    ctx.lineCap      = 'round';
    ctx.lineJoin     = 'round';
    ctx.stroke();
    lastPosRef.current = pos;
    schedulePreview();
  }, [tool, color, brushSize, getPos, schedulePreview]);

  const stopDrawing = useCallback(() => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      // Save completed stroke (only for pen, not eraser)
      if (tool !== 'eraser' && currentStrokeRef.current.length >= 3) {
        const stroke = {
          points: currentStrokeRef.current,
          color,
          width: brushSize,
        };
        setStrokes((prev) => [...prev, stroke]);
      }
      currentStrokeRef.current = [];
      schedulePreview();
    }
  }, [schedulePreview, tool, color, brushSize]);

  const clearCanvas = useCallback(() => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    setStrokes([]);
    schedulePreview();
  }, [schedulePreview]);

  const downloadCanvas = useCallback(() => {
    const a    = document.createElement('a');
    a.download = 'canvas.png';
    a.href     = canvasRef.current.toDataURL();
    a.click();
  }, []);

  return {
    canvasRef,
    tool, setTool,
    color, setColor,
    brushSize, setBrushSize,
    filter, setFilter,
    previewSrc,
    mousePos,
    strokes,
    onMouseDown,
    onMouseMove,
    stopDrawing,
    clearCanvas,
    downloadCanvas,
  };
};

export default useCanvas;
