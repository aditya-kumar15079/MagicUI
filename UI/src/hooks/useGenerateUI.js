import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/generate-ui';

const useGenerateUI = () => {
  const [generatedImage, setGeneratedImage] = useState(null);
  const [description, setDescription]       = useState('');
  const [generating, setGenerating]         = useState(false);
  const abortRef                            = useRef(null);

  const generateUI = useCallback(async (canvasRef) => {
    if (!canvasRef?.current) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setGenerating(true);
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const base64  = dataUrl.replace(/^data:image\/png;base64,/, '');

      const res = await axios.post(
        API_URL,
        { image: base64 },
        { signal: controller.signal, timeout: 60000 },
      );

      if (!controller.signal.aborted) {
        setGeneratedImage(`data:image/png;base64,${res.data.image}`);
        setDescription(res.data.description || '');
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('UI generation failed:', err);
      }
    } finally {
      if (!controller.signal.aborted) {
        setGenerating(false);
      }
    }
  }, []);

  const clearGeneratedUI = useCallback(() => {
    setGeneratedImage(null);
    setDescription('');
  }, []);

  return { generatedImage, description, generating, generateUI, clearGeneratedUI };
};

export default useGenerateUI;
