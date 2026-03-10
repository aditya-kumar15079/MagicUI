import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/detect-shapes';

const useShapeDetection = (canvasW, canvasH) => {
  const [shapes, setShapes]   = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef              = useRef(null);

  const detectShapes = useCallback(async (strokes) => {
    if (!strokes || strokes.length === 0) {
      setShapes([]);
      return;
    }

    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const payload = {
        strokes: strokes.map((s) => ({
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

  return { shapes, loading, detectShapes };
};

export default useShapeDetection;
