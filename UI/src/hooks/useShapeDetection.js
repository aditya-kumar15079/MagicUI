import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/detect-shapes';
const DEBOUNCE_MS = 400;

const useShapeDetection = (strokes, canvasW, canvasH) => {
  const [shapes, setShapes]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const timerRef                = useRef(null);
  const abortRef                = useRef(null);
  const lastStrokeLenRef        = useRef(0);

  const detectShapes = useCallback(async (strokesToSend) => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const payload = {
        strokes: strokesToSend.map((s) => ({
          points: s.points,
          color:  s.color,
          width:  s.width,
        })),
        canvas_width:  canvasW,
        canvas_height: canvasH,
      };

      const res = await axios.post(API_URL, payload, {
        signal: controller.signal,
        timeout: 10000,
      });

      if (!controller.signal.aborted) {
        setShapes(res.data.shapes || []);
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('Shape detection failed:', err);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [canvasW, canvasH]);

  useEffect(() => {
    // Only fire when strokes actually change
    if (strokes.length === 0) {
      setShapes([]);
      lastStrokeLenRef.current = 0;
      return;
    }

    if (strokes.length === lastStrokeLenRef.current) return;
    lastStrokeLenRef.current = strokes.length;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      detectShapes(strokes);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [strokes, detectShapes]);

  return { shapes, loading };
};

export default useShapeDetection;
