import { useEffect } from 'react';

export default function useHtmlZoom(containerRef) {
  useEffect(() => {
    const handleWheel = (e) => {
      const el = containerRef.current;
      if (!el || !el.contains(e.target)) return;

      e.preventDefault();
      e.stopPropagation();

      const canvas = document.querySelector('.konvajs-content');
      if (canvas) {
        canvas.dispatchEvent(new WheelEvent('wheel', {
          deltaY: e.deltaY,
          deltaX: e.deltaX,
          clientX: e.clientX,
          clientY: e.clientY,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          bubbles: true
        }));
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, [containerRef]);
}
