import { useState, useEffect, useMemo, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { AlignLeft, AlignCenter, Bold, Italic, Trash2, Lock, Unlock, ArrowLeftToLine, ArrowRightToLine, MoveVertical, Grid3X3, StickyNote, Link, UserPlus, Tag, SmilePlus, MessageSquare, MoreVertical, Square, AppWindow, Copy, ExternalLink } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';
import { TOOLS } from '../../config/constants';
import TimelineProperties from './flyouts/TimelineProperties';

export default function FloatingToolbar({ stageRef }) {
  const { elements, selectedIds, updateElement, removeElements, clearSelection, performAction, viewport } = useCanvasStore();
  const [showColorPicker, setShowColorPicker] = useState<string | false>(false);
  const [position, setPosition] = useState({ x: -9999, y: -9999, visible: false });
  const toolbarRef = useRef(null);

  const selectedElements = useMemo(() => selectedIds.map(id => elements[id]).filter(Boolean), [selectedIds, elements]);

  // Close color picker when clicking outside
  useEffect(() => {
    if (!showColorPicker) return;
    
    const handleClickOutside = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setShowColorPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  // Update floating position — also depends on viewport so it moves when you zoom/pan
  useEffect(() => {
    if (selectedElements.length === 0 || !stageRef?.current) {
      setPosition(prev => ({ ...prev, visible: false }));
      return;
    }

    const stage = stageRef.current.getStage ? stageRef.current.getStage() : stageRef.current;
    if (!stage) return;
    
    // Calculate bounding box in canvas coordinates
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedElements.forEach(el => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + (el.width || 0));
      maxY = Math.max(maxY, el.y + (el.height || 0));
    });

    // Convert to screen coordinates using stage transform
    const transform = stage.getAbsoluteTransform();
    const topLeftScreen = transform.point({ x: minX, y: minY });
    const topRightScreen = transform.point({ x: maxX, y: minY });
    
    const screenWidth = topRightScreen.x - topLeftScreen.x;
    
    // Position it centered above the selection box, 16px higher
    setPosition({
      x: topLeftScreen.x + screenWidth / 2,
      y: topLeftScreen.y - 16,
      visible: true
    });
  }, [selectedElements, stageRef, viewport]); // Added viewport dependency

  if (!position.visible || selectedElements.length === 0) return null;

  const referenceElement = selectedElements[0];

  const handlePropertyChange = (key, value) => {
    selectedIds.forEach(id => {
      if (elements[id]) {
        updateElement(id, { [key]: value });
      }
    });
  };

  const handleToggleFontStyle = (styleClass) => {
    selectedIds.forEach(id => {
      const el = elements[id];
      if (!el) return;
      let newStyle = el.fontStyle || 'normal';
      if (newStyle.includes(styleClass)) {
        newStyle = newStyle.replace(styleClass, '').trim() || 'normal';
      } else {
        newStyle = (newStyle === 'normal' ? styleClass : `${newStyle} ${styleClass}`).trim();
      }
      updateElement(id, { fontStyle: newStyle });
    });
  };

  const handleStrokeStyleChange = (style) => {
    selectedIds.forEach(id => {
      const el = elements[id];
      if (!el) return;
      let dash = null;
      const sw = el.strokeWidth || 2;
      if (style === 'dashed') dash = [sw * 4, sw * 3];
      if (style === 'dotted') dash = [sw, sw * 2];
      updateElement(id, { strokeStyle: style, dash });
    });
  };

  const handleToggleLock = () => {
    const isLocked = referenceElement.locked;
    handlePropertyChange('locked', !isLocked);
  };

  const hasText = selectedElements.some(el => el.type === TOOLS.TEXT || el.type === TOOLS.STICKY_NOTE);
  const hasStroke = selectedElements.some(el => [TOOLS.RECTANGLE, TOOLS.CIRCLE, TOOLS.TRIANGLE, TOOLS.LINE, TOOLS.ARROW, TOOLS.PEN].includes(el.type));
  const hasFill = selectedElements.some(el => [TOOLS.RECTANGLE, TOOLS.CIRCLE, TOOLS.TRIANGLE, TOOLS.STICKY_NOTE].includes(el.type));
  const hasCornerRadius = selectedElements.some(el => [TOOLS.RECTANGLE, TOOLS.TRIANGLE].includes(el.type));

  const handleAlign = (type) => {
    if (selectedElements.length < 2) return;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedElements.forEach(el => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + (el.width || 0));
      maxY = Math.max(maxY, el.y + (el.height || 0));
    });

    const updates = [];
    selectedElements.forEach(el => {
      let newX = el.x;
      let newY = el.y;
      const w = el.width || 0;
      const h = el.height || 0;

      switch (type) {
        case 'left': newX = minX; break;
        case 'center': newX = minX + (maxX - minX) / 2 - w / 2; break;
        case 'right': newX = maxX - w; break;
        case 'top': newY = minY; break;
        case 'middle': newY = minY + (maxY - minY) / 2 - h / 2; break;
        case 'bottom': newY = maxY - h; break;
        case 'grid': {
           const cols = Math.ceil(Math.sqrt(selectedElements.length));
           const padding = 40;
           const maxW = Math.max(...selectedElements.map(e => e.width || 100));
           const maxH = Math.max(...selectedElements.map(e => e.height || 100));
           
           const index = selectedElements.findIndex(e => e.id === el.id);
           const row = Math.floor(index / cols);
           const col = index % cols;
           
           newX = minX + col * (maxW + padding);
           newY = minY + row * (maxH + padding);
           break;
        }
      }

      if (newX !== el.x || newY !== el.y) {
        updates.push({
          id: el.id,
          oldProps: { x: el.x, y: el.y },
          newProps: { x: newX, y: newY }
        });
      }
    });

    if (updates.length > 0) {
      performAction({ type: 'UPDATE', updates });
    }
  };

  const getStickySizeLabel = (width) => {
    if (width <= 250) return 'S';
    if (width <= 450) return 'M';
    return 'L';
  };

  const handleCycleSize = () => {
    const currentSize = getStickySizeLabel(referenceElement.width);
    let newWidth = 200;
    if (currentSize === 'S') newWidth = 400;
    else if (currentSize === 'M') newWidth = 800;
    else if (currentSize === 'L') newWidth = 200;
    
    const scaleFactor = newWidth / referenceElement.width;
    
    selectedIds.forEach(id => {
       const el = elements[id];
       updateElement(id, { 
         width: newWidth, 
         height: newWidth * (el.height / el.width), // preserve aspect ratio
         fontSize: el.autoFontSize !== false ? 64 : el.fontSize * scaleFactor 
       });
    });
  };

  const isStickyNote = selectedElements.length === 1 && referenceElement.type === TOOLS.STICKY_NOTE;
  const isTimeline = selectedElements.length === 1 && referenceElement.type === TOOLS.TIMELINE;
  const isGoogleWorkspace = selectedElements.length === 1 && referenceElement.type === TOOLS.GOOGLE_WORKSPACE;
  
  const handleCopyLink = () => {
    if (referenceElement.url) {
      navigator.clipboard.writeText(referenceElement.url);
    }
  };

  const handleOpenExternally = () => {
    if (referenceElement.url) {
      window.open(referenceElement.url, '_blank');
    }
  };

  const handleCycleWorkspaceSize = () => {
    // Sizes: A4 (900x1100), Widescreen (1200x675), Mobile (400x800)
    let newW = 900, newH = 1100;
    if (referenceElement.width === 900) {
      newW = 1200; newH = 675; // 16:9
    } else if (referenceElement.width === 1200) {
      newW = 400; newH = 800; // Mobile
    } else {
      newW = 900; newH = 1100; // A4 Standard
    }
    
    updateElement(referenceElement.id, { width: newW, height: newH });
  };

  return (
    <div 
      ref={toolbarRef}
      className="absolute z-20 pointer-events-auto transform -translate-x-1/2 -translate-y-full flex items-center bg-white rounded-md shadow-floating border border-gray-100 p-1 gap-1 transition-transform duration-75 ease-out"
      style={{ left: position.x, top: position.y }}
      onWheel={(e) => e.stopPropagation()}
    >
      {isGoogleWorkspace ? (
        <>
          <div className="w-10 h-10 flex items-center justify-center rounded-lg text-green-600 bg-green-50" title="Google Workspace">
            <AppWindow className="w-5 h-5" />
          </div>
          
          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button 
             onClick={handleCycleWorkspaceSize}
             className="px-3 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 font-medium text-sm transition-colors"
             title="Cycle Size (A4 / 16:9 / Mobile)"
          >
            {referenceElement.width === 900 ? 'A4' : referenceElement.width === 1200 ? '16:9' : 'Mobile'}
          </button>

          <div className="relative">
             <button 
                onClick={() => setShowColorPicker(showColorPicker === 'stroke' ? false : 'stroke')}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                title="Border Color"
              >
                <div className="w-5 h-5 rounded-full shadow-sm border border-gray-200" style={{ backgroundColor: referenceElement.stroke || '#e5e7eb' }} />
              </button>
              {showColorPicker === 'stroke' && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-floating border border-gray-100 p-3">
                  <HexColorPicker color={referenceElement.stroke || '#e5e7eb'} onChange={(color) => handlePropertyChange('stroke', color)} />
                </div>
              )}
          </div>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button 
             onClick={handleCopyLink}
             className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
             title="Copy Link"
          >
            <Copy className="w-5 h-5" />
          </button>

          <button 
             onClick={handleOpenExternally}
             className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
             title="Open in new tab"
          >
            <ExternalLink className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 transition-colors" title="Comment">
            <MessageSquare className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button 
            onClick={handleToggleLock}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${referenceElement.locked ? 'text-brand bg-brand/10' : 'text-gray-600 hover:bg-gray-100'}`}
            title={referenceElement.locked ? 'Unlock' : 'Lock'}
          >
            {referenceElement.locked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => {
              removeElements([referenceElement.id]);
              clearSelection();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </>
      ) : isStickyNote ? (
        <>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100" title="Shape">
            <StickyNote className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-gray-200 mx-1" />

          <select 
            value={referenceElement.fontFamily || 'Inter'}
            onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
            className="w-24 px-1 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg outline-none bg-transparent cursor-pointer"
          >
            <option value="Inter">Inter</option>
            <option value="Comic Sans MS">Comic Sans</option>
          </select>

          <div className="flex items-center">
            <select 
              value={referenceElement.autoFontSize !== false ? 'auto' : (referenceElement.fontSize || 64)}
              onChange={(e) => {
                 if (e.target.value === 'auto') {
                   handlePropertyChange('autoFontSize', true);
                   handlePropertyChange('fontSize', 64);
                 } else {
                   handlePropertyChange('autoFontSize', false);
                   handlePropertyChange('fontSize', parseInt(e.target.value) || 64);
                 }
              }}
              className="w-16 px-1 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg outline-none bg-transparent cursor-pointer"
            >
               <option value="auto">Auto</option>
               <option value="12">12</option>
               <option value="14">14</option>
               <option value="18">18</option>
               <option value="24">24</option>
               <option value="36">36</option>
               <option value="48">48</option>
               <option value="64">64</option>
               <option value="80">80</option>
               <option value="144">144</option>
            </select>
          </div>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button 
            onClick={() => handleToggleFontStyle('bold')}
            className={`w-10 h-10 flex items-center justify-center rounded-lg ${(referenceElement.fontStyle || '').includes('bold') ? 'bg-gray-100 text-brand' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <Bold className="w-5 h-5" />
          </button>

          <button 
            onClick={() => handlePropertyChange('align', referenceElement.align === 'center' ? 'left' : 'center')}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {referenceElement.align === 'center' ? <AlignCenter className="w-5 h-5" /> : <AlignLeft className="w-5 h-5" />}
          </button>

          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100">
            <Link className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button 
             onClick={handleCycleSize}
             className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 font-medium text-sm"
          >
            {getStickySizeLabel(referenceElement.width)}
          </button>

          <div className="relative">
             <button 
                onClick={() => setShowColorPicker(showColorPicker === 'fill' ? false : 'fill')}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100"
              >
                <div className="w-5 h-5 rounded-full shadow-sm border border-gray-200" style={{ backgroundColor: referenceElement.fill || '#FFF9B1' }} />
              </button>
              {showColorPicker === 'fill' && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-floating border border-gray-100 p-3">
                  <HexColorPicker color={referenceElement.fill} onChange={(color) => handlePropertyChange('fill', color)} />
                </div>
              )}
          </div>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100">
            <UserPlus className="w-5 h-5" />
          </button>
          
          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100">
            <Tag className="w-5 h-5" />
          </button>
          
          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100">
            <SmilePlus className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100">
            <MessageSquare className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button 
            onClick={handleToggleLock}
            className={`w-10 h-10 flex items-center justify-center rounded-lg ${referenceElement.locked ? 'text-brand bg-brand/10' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            {referenceElement.locked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100">
            <MoreVertical className="w-5 h-5" />
          </button>
        </>
      ) : isTimeline ? (
        <TimelineProperties element={referenceElement} onChange={handlePropertyChange} />
      ) : (
        <>
          {/* Fill Color */}
          {hasFill && (
            <div className="relative">
          <button 
            onClick={() => setShowColorPicker(showColorPicker === 'fill' ? false : 'fill')}
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Fill Color"
          >
            <div className="w-6 h-6 rounded border border-gray-200 shadow-sm" style={{ backgroundColor: referenceElement.fill || 'transparent' }} />
          </button>
          {showColorPicker === 'fill' && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-floating border border-gray-100 p-3 flex flex-col gap-3">
              <HexColorPicker color={referenceElement.fill} onChange={(color) => handlePropertyChange('fill', color)} />
              <button 
                onClick={() => handlePropertyChange('fill', 'transparent')}
                className="w-full py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
              >
                Transparent
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stroke / Border */}
      {hasStroke && (
        <div className="relative flex items-center gap-1">
          <button 
            onClick={() => {
              const currentStroke = referenceElement.stroke;
              if (!currentStroke || currentStroke === 'transparent') {
                handlePropertyChange('stroke', '#000000');
                if (!referenceElement.strokeWidth) handlePropertyChange('strokeWidth', 2);
              } else {
                handlePropertyChange('stroke', 'transparent');
              }
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ${referenceElement.stroke && referenceElement.stroke !== 'transparent' ? 'bg-gray-100' : ''}`}
            title="Toggle Border"
          >
            <Square className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setShowColorPicker(showColorPicker === 'stroke' ? false : 'stroke')}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${showColorPicker === 'stroke' ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
            title="Stroke Color"
          >
            <div className="w-6 h-6 rounded border-2 shadow-sm" style={{ borderColor: referenceElement.stroke || 'transparent' }} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowColorPicker(showColorPicker === 'thickness' ? false : 'thickness')}
              className={`px-2 h-10 rounded-lg flex items-center justify-center gap-1 text-sm font-medium transition-colors ${showColorPicker === 'thickness' ? 'bg-gray-100 text-brand' : 'text-gray-700 hover:bg-gray-100'}`}
              title="Stroke Width"
            >
              <span>{referenceElement.strokeWidth || 0}px</span>
            </button>
            {showColorPicker === 'thickness' && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-floating border border-gray-100 p-4 w-48 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                  <span>Line Thickness</span>
                  <span>{referenceElement.strokeWidth || 0}px</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="40" 
                  value={referenceElement.strokeWidth || 0} 
                  onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value) || 0)}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand"
                />
              </div>
            )}
          </div>
          
          {hasCornerRadius && (
            <div className="relative">
              <button 
                onClick={() => setShowColorPicker(showColorPicker === 'radius' ? false : 'radius')}
                className={`px-2 h-10 rounded-lg flex items-center justify-center gap-1 text-sm font-medium transition-colors ${showColorPicker === 'radius' ? 'bg-gray-100 text-brand' : 'text-gray-700 hover:bg-gray-100'}`}
                title="Corner Radius"
              >
                <div className="w-4 h-4 border-t-2 border-l-2 border-gray-600 rounded-tl-md" />
              </button>
              {showColorPicker === 'radius' && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-floating border border-gray-100 p-4 w-48 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                    <span>Corner Radius</span>
                    <span>{referenceElement.cornerRadius || 0}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={referenceElement.cornerRadius || 0} 
                    onChange={(e) => handlePropertyChange('cornerRadius', parseInt(e.target.value) || 0)}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand"
                  />
                </div>
              )}
            </div>
          )}
          
          <select 
            value={referenceElement.strokeStyle || 'solid'}
            onChange={(e) => handleStrokeStyleChange(e.target.value)}
            className="w-24 px-1 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg outline-none bg-transparent cursor-pointer transition-colors"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>

          {showColorPicker === 'stroke' && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-floating border border-gray-100 p-3 flex flex-col gap-3">
              <HexColorPicker color={referenceElement.stroke} onChange={(color) => handlePropertyChange('stroke', color)} />
              <button 
                onClick={() => handlePropertyChange('stroke', 'transparent')}
                className="w-full py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
              >
                Transparent
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dividers */}
      {(hasFill || hasStroke) && hasText && <div className="w-px h-6 bg-gray-200 mx-1" />}

      {/* Text Properties */}
      {hasText && (
        <div className="flex items-center gap-2">
          <select 
            value={referenceElement.fontFamily || 'Inter'}
            onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
            className="w-28 px-1 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg outline-none bg-transparent cursor-pointer transition-colors"
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Comic Sans MS">Comic Sans</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Monospace</option>
          </select>

          <input 
            type="number"
            value={referenceElement.fontSize || 16}
            onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value) || 16)}
            className="w-14 px-1 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg outline-none bg-transparent text-center transition-colors"
            min="8" max="144" title="Font Size"
          />

          <button 
            onClick={() => handleToggleFontStyle('bold')}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${(referenceElement.fontStyle || '').includes('bold') ? 'bg-gray-100 text-brand' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Bold className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => handleToggleFontStyle('italic')}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${(referenceElement.fontStyle || '').includes('italic') ? 'bg-gray-100 text-brand' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Italic className="w-5 h-5" />
          </button>

          <button 
            onClick={() => handlePropertyChange('align', referenceElement.align === 'center' ? 'left' : 'center')}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-gray-600 hover:bg-gray-100`}
            title="Toggle Alignment"
          >
            {referenceElement.align === 'center' ? <AlignCenter className="w-5 h-5" /> : <AlignLeft className="w-5 h-5" />}
          </button>
          
          <div className="relative">
             <button 
                onClick={() => setShowColorPicker(showColorPicker === 'text' ? false : 'text')}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                title="Text Color"
              >
                <div className="w-5 h-5 rounded-full shadow-sm border border-gray-200" style={{ backgroundColor: referenceElement.textColor || '#000000' }} />
              </button>
              {showColorPicker === 'text' && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-floating border border-gray-100 p-3">
                  <HexColorPicker color={referenceElement.textColor} onChange={(color) => handlePropertyChange('textColor', color)} />
                </div>
              )}
          </div>
        </div>
      )}

      {/* Alignment Actions (Multi-select) */}
      {selectedElements.length > 1 && (
        <>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <div className="flex items-center gap-2">
            <button onClick={() => handleAlign('left')} className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100" title="Align Left">
              <ArrowLeftToLine className="w-5 h-5" />
            </button>
            <button onClick={() => handleAlign('center')} className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100" title="Align Center">
              <MoveVertical className="w-5 h-5" />
            </button>
            <button onClick={() => handleAlign('right')} className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100" title="Align Right">
              <ArrowRightToLine className="w-5 h-5" />
            </button>
            <button onClick={() => handleAlign('grid')} className="w-10 h-10 flex items-center justify-center rounded-lg text-brand hover:bg-gray-100" title="Magic Grid Align">
              <Grid3X3 className="w-5 h-5" />
            </button>
          </div>
        </>
      )}

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* General Actions */}
      <div className="flex items-center gap-2">
        <button 
          onClick={handleToggleLock}
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${referenceElement.locked ? 'text-brand bg-brand/10' : 'text-gray-600 hover:bg-gray-100'}`}
          title={referenceElement.locked ? 'Unlock' : 'Lock'}
        >
          {referenceElement.locked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
        </button>

        <button 
          onClick={() => {
            const unlockableIds = selectedIds.filter(id => !elements[id]?.locked);
            removeElements(unlockableIds);
            clearSelection();
          }}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

        </>
      )}
    </div>
  );
}
