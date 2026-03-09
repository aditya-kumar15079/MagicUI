import { useState, useRef, useEffect } from 'react';

const useDivider = (initialPos = 50) => {
  const [dividerPos, setDividerPos] = useState(initialPos);
  const containerRef  = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const r   = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - r.left) / r.width) * 100;
      setDividerPos(Math.min(Math.max(pct, 15), 85));
    };

    const onUp = () => {
      isDraggingRef.current      = false;
      document.body.style.cursor = '';
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const startDivDrag = (e) => {
    isDraggingRef.current      = true;
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
  };

  return { dividerPos, containerRef, startDivDrag };
};

export default useDivider;
