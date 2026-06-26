import { useEffect, useCallback } from 'react';
import useCanvasStore from '../store/canvasStore';
import useToolStore from '../store/toolStore';
import { TOOLS } from '../config/constants';

export default function useKeyboardShortcuts() {
  // NOTE: All store reads happen inside the handler via getState().
  // This prevents stale closures AND eliminates the need to re-register
  // the listener on every store change (was firing 50-100x/min during collaboration).

  const handleKeyDown = useCallback((e) => {
    // Don't trigger shortcuts if typing in an input or textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    // Read from store at call time — no stale closures
    const { elements, selectedIds, addElement, removeElements, clearSelection, undo, redo, setViewport } = useCanvasStore.getState();
    const { setActiveTool } = useToolStore.getState();

    // Redo MUST be checked before Undo since Ctrl+Shift+Z includes both ctrl and 'z'
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      redo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      redo();
      return;
    }

    // Undo (Ctrl+Z without shift)
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undo();
      return;
    }

    // Delete / Backspace
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedIds.length > 0) {
        e.preventDefault();
        removeElements(selectedIds);
      }
      return;
    }

    // Duplicate (Ctrl+D)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      if (selectedIds.length > 0) {
        const newElements = selectedIds.map(id => {
          const el = elements[id];
          if (!el) return null;
          return {
            ...el,
            id: `${el.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            x: el.x + 20,
            y: el.y + 20,
          };
        }).filter(Boolean);
        newElements.forEach(el => addElement(el));
      }
      return;
    }

    // Fit to Screen (Shift + 1)
    if (e.shiftKey && e.key === '1') {
      e.preventDefault();
      setViewport({ x: 0, y: 0, scale: 1 });
      return;
    }

    // Zoom to 100% (Shift + 2)
    if (e.shiftKey && e.key === '2') {
      e.preventDefault();
      setViewport((prev) => ({ ...prev, scale: 1 }));
      return;
    }

    // Deselect all and reset tool on Escape
    if (e.key === 'Escape') {
      clearSelection();
      setActiveTool(TOOLS.SELECT);
      return;
    }

    // Tool selection
    const keyToolMap = {
      'v': TOOLS.SELECT,
      'h': TOOLS.HAND,
      't': TOOLS.TEXT,
      'n': TOOLS.STICKY_NOTE,
      's': TOOLS.RECTANGLE,
      'l': TOOLS.LINE,
      'p': TOOLS.PEN,
      'c': TOOLS.COMMENT,
    };

    if (!e.ctrlKey && !e.metaKey && !e.altKey && keyToolMap[e.key.toLowerCase()]) {
      e.preventDefault();
      setActiveTool(keyToolMap[e.key.toLowerCase()]);
    }
  }, []); // ← empty: stable ref, registered ONCE, reads fresh state via getState()

  useEffect(() => {

    const handlePaste = (e) => {
      // Ignore if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }
      
      const text = e.clipboardData.getData('text');
      if (!text) return;

      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      
      if (lines.length > 0) {
        e.preventDefault();
        // Always fresh — no stale closure
        const { addElement: add } = useCanvasStore.getState();
        const currentViewport = useCanvasStore.getState().viewport;
        const startX = -currentViewport.x / currentViewport.scale + window.innerWidth / 2 / currentViewport.scale;
        const startY = -currentViewport.y / currentViewport.scale + window.innerHeight / 2 / currentViewport.scale;

        const newElements = lines.map((line, index) => ({
          id: `sticky_note-${Date.now()}-${index}`,
          type: TOOLS.STICKY_NOTE,
          x: startX + (index % 5) * 220,
          y: startY + Math.floor(index / 5) * 220,
          width: 200,
          height: 200,
          text: line,
          fill: '#FFF7D1',
          stroke: '#E6DB9A',
          textColor: '#111827',
          fontSize: 24,
          fontFamily: 'Inter',
          align: 'center',
          verticalAlign: 'middle',
          opacity: 1,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          fontStyle: 'normal',
          textDecoration: 'none'
        }));

        newElements.forEach(el => add(el));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [handleKeyDown]); // ← only re-registers if handleKeyDown reference changes (never)
}
