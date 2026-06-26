import { useState, useEffect } from 'react';
import useCanvasStore from '../store/canvasStore';

interface UseCanvasEventsProps {
  resetDrawingState: () => void;
}

export function useCanvasEvents({ resetDrawingState }: UseCanvasEventsProps) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isAltPressed, setIsAltPressed] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyA') {
        e.preventDefault();
        const currentElements = useCanvasStore.getState().elements;
        const allIds = Object.keys(currentElements);
        useCanvasStore.getState().setSelectedIds(allIds);
        return;
      }
      
      if (e.code === 'Escape') {
        resetDrawingState();
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
      if (e.key === 'Alt') {
        setIsAltPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsSpacePressed(false);
      if (e.key === 'Alt') setIsAltPressed(false);
    };

    const handleBlur = () => {
      setIsSpacePressed(false);
      setIsAltPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [resetDrawingState]);

  return {
    windowSize,
    isSpacePressed,
    isAltPressed,
  };
}
