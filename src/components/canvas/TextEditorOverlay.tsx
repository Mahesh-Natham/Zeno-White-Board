/* eslint-disable react-hooks/refs */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react';
import useCanvasStore from '../../store/canvasStore';

export default function TextEditorOverlay({ element, stageRef, onClose }) {
  const { updateElement } = useCanvasStore();
  const divRef = useRef(null);
  const hasInitiallyFocused = useRef(false);

  useEffect(() => {
    if (divRef.current && !hasInitiallyFocused.current) {
      hasInitiallyFocused.current = true;
      
      // Initialize text content directly in DOM to prevent React re-renders from overwriting it while typing
      const textToSet = element.text || '';
      if (textToSet === '' || textToSet === '\n') {
        divRef.current.innerHTML = '<br>';
      } else {
        divRef.current.innerText = textToSet;
      }
      
      setTimeout(() => {
        if (divRef.current) {
          divRef.current.focus();
          
          // Place cursor at the end
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(divRef.current);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }, 50);
    }
  }, []);

  if (!stageRef.current) return null;

  const stage = stageRef.current;
  const scale = stage.scaleX();
  const position = stage.getAbsoluteTransform().point({ x: element.x, y: element.y });
  const isSticky = element.type === 'sticky_note';
  const padding = isSticky ? 16 * scale : 0;
  
  const handleBlur = () => {
    // Save innerText instead of HTML to strip rich formatting
    if (divRef.current) {
      let finalStr = divRef.current.innerText;
      if (finalStr === '\n') finalStr = ''; // Clean up empty <br> artifact
      updateElement(element.id, { text: finalStr });
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleBlur();
    }
  };

  const handleInput = (e) => {
    const el = e.currentTarget;
    
    // If the user deletes everything, nuke any hidden browser formatting tags
    if (el.innerText.trim() === '') {
       if (el.innerHTML !== '' && el.innerHTML !== '<br>') {
           el.innerHTML = '';
       }
    }
    
    
    if (isSticky) {
       if (element.autoFontSize !== false) {
           // Scale max font size proportionally with the sticky note width (200px = 64px max font)
           let maxOptimalSize = Math.floor(64 * (element.width / 200));
           let optimalSize = maxOptimalSize;
           el.style.fontSize = `${optimalSize * scale}px`;
           
           while (el.scrollHeight > el.clientHeight && optimalSize > 12) {
               optimalSize -= 2;
               el.style.fontSize = `${optimalSize * scale}px`;
           }
           
           if (element.fontSize !== optimalSize) {
               updateElement(element.id, { fontSize: optimalSize });
           }
       }
    } else {
       // For regular text, auto-expand height. We let the div dictate the element height.
       const newSize = (el.scrollHeight / scale);
       updateElement(element.id, { height: Math.max(50, newSize) });
    }
  };

  const fontStyle = element.fontStyle || 'normal';

  return (
    <>
      <style>{`
        .text-editor-overlay * {
          font-size: inherit !important;
          font-family: inherit !important;
          color: inherit !important;
          line-height: inherit !important;
          text-align: inherit !important;
        }
      `}</style>
      <div
        ref={divRef}
        className="text-editor-overlay"
        contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onInput={handleInput}
      style={{
        position: 'absolute',
        top: `${position.y + padding}px`,
        left: `${position.x + padding}px`,
        width: `${(element.width * scale) - (padding * 2)}px`,
        height: `${(element.height * scale) - (padding * 2)}px`,
        fontSize: `${element.fontSize * scale}px`,
        fontFamily: element.fontFamily,
        fontWeight: fontStyle.includes('bold') ? 'bold' : 'normal',
        fontStyle: fontStyle.includes('italic') ? 'italic' : 'normal',
        textDecoration: element.textDecoration || 'none',
        color: element.textColor,
        textAlign: element.align,
        border: 'none',
        margin: '0px',
        background: 'transparent',
        outline: 'none',
        borderRadius: '4px',
        resize: 'none',
        lineHeight: 1.2,
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        zIndex: 50,
        
        // Flexbox centering!
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isSticky ? 'center' : 'flex-start',
        overflow: 'hidden'
      }}
    />
    </>
  );
}
