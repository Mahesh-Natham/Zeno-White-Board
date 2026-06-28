import { useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer } from 'react-konva';
import { useShallow } from 'zustand/react/shallow';

import CanvasGrid from './CanvasGrid';
import ElementRenderer from './elements/ElementRenderer';
import ElementTransformer from './ElementTransformer';
import ConnectionDots from './ConnectionDots';
import SelectionRect from './SelectionRect';
import TextEditorOverlay from './TextEditorOverlay';
import CursorLayer from './CursorLayer';
import ContextMenu from './ContextMenu';

import useCanvasStore from '../../store/canvasStore';
import useToolStore from '../../store/toolStore';
import useCollaboration from '../../hooks/useCollaboration';
import elementService from '../../services/elementService';
import syncEngine from '../../services/syncEngine';
import { TOOLS } from '../../config/constants';

// Hooks
import { useCanvasEvents } from '../../hooks/useCanvasEvents';
import { useCanvasDrawing } from '../../hooks/useCanvasDrawing';
import { useElementDragging } from '../../hooks/useElementDragging';
import { useCanvasInteractions } from '../../hooks/useCanvasInteractions';

const InfiniteCanvas = forwardRef(({ board, isReadOnly }: any, ref) => {
  // ── Granular store subscriptions ─────────────────────────────────────────
  const selectedIds = useCanvasStore(state => state.selectedIds);
  const viewport    = useCanvasStore(state => state.viewport);
  
  // Custom equality for rendering ONLY when element IDs or zIndex changes
  const sortedIds = useCanvasStore(
    useShallow(state => 
      Object.values(state.elements)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        .map(el => el.id)
    )
  );
  
  const setViewport     = useCanvasStore(state => state.setViewport);
  const setElements     = useCanvasStore(state => state.setElements);
  
  // Also get the full elements object for the preview overlay and transformers
  const elements = useCanvasStore(state => state.elements);

  const { activeTool } = useToolStore();

  const stageRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    getStage: () => stageRef.current,
  }));

  // Setup Firebase Listener
  useEffect(() => {
    if (!board || !board.id) return;
    
    const unsubscribe = elementService.subscribeToElements(board.id, (remoteElements) => {
      const localElements = useCanvasStore.getState().elements;
      const mergedElements = { ...remoteElements };

      // Handle remote elements that are locked locally
      Object.keys(mergedElements).forEach((id) => {
        if (syncEngine.isLocked(id)) {
          if (localElements[id]) {
            mergedElements[id] = localElements[id]; // Keep local changes
          } else {
            delete mergedElements[id]; // It was deleted locally
          }
        }
      });

      // Handle local elements that are locked but not in remote yet
      Object.keys(localElements).forEach((id) => {
        if (syncEngine.isLocked(id) && !mergedElements[id]) {
          mergedElements[id] = localElements[id];
        }
      });

      setElements(mergedElements);
    });

    return () => unsubscribe();
  }, [board?.id, setElements]);

  // Handle Conversions
  useEffect(() => {
    const handleConvert = async (e: any) => {
      const { id, from, to } = e.detail;
      const el = useCanvasStore.getState().elements[id];
      if (!el) return;

      const { 
        convertKanbanToTimeline, 
        convertTimelineToKanban,
        convertTableToKanban,
        convertKanbanToTable,
        convertTableToTimeline,
        convertTimelineToTable
      } = await import('./elements/utils/conversionUtils');

      let newEl: any = null;
      if (from === 'kanban' && to === 'timeline') {
         newEl = convertKanbanToTimeline({ ...el, ...el.kanbanData } as any, id);
      } else if (from === 'timeline' && to === 'kanban') {
         newEl = convertTimelineToKanban(el as any, id);
      } else if (from === 'table' && to === 'kanban') {
         newEl = convertTableToKanban({ ...el, ...el.tableData } as any, id);
      } else if (from === 'kanban' && to === 'table') {
         newEl = convertKanbanToTable({ ...el, ...el.kanbanData } as any, id);
      } else if (from === 'table' && to === 'timeline') {
         newEl = convertTableToTimeline({ ...el, ...el.tableData } as any, id);
      } else if (from === 'timeline' && to === 'table') {
         newEl = convertTimelineToTable(el as any, id);
      }

      if (newEl) {
         // To ensure a clean replace without lingering keys, we can delete and re-add in one go 
         // if we modified the store, but using Object.assign via UPDATE is usually fine.
         // However, we will manually strip old keys by setting them to undefined if needed,
         // or we can just pass the newEl to UPDATE since it will overwrite type.
         // To be clean, we can do a replace in the store by manually doing it.
         // But let's use the provided UPDATE and overwrite type.
         // Clear old type-specific data keys
         const cleanOldProps = {
           kanbanData: undefined,
           tableData: undefined,
           tasks: undefined,
           lanes: undefined,
           startDate: undefined,
           viewScale: undefined,
           sidebarWidth: undefined,
         };

         let finalNewProps: any = {};
         if (newEl.type === 'kanban') {
           const { type, x, y, id, width, height, ...rest } = newEl;
           finalNewProps = { width: newEl.width || 1200, height: newEl.height || 800, kanbanData: rest };
         } else if (newEl.type === 'table') {
           const { type, x, y, id, width, height, ...rest } = newEl;
           finalNewProps = { width: newEl.width || 1000, height: newEl.height || 700, ...rest };
         } else if (newEl.type === 'timeline') {
           // Timeline properties live at the root
           const { type, x, y, id, ...rest } = newEl;
           finalNewProps = rest;
         }

         useCanvasStore.getState().performAction({
           type: 'UPDATE',
           updates: [{ id, oldProps: el, newProps: { ...cleanOldProps, ...finalNewProps, type: newEl.type } }]
         });
      }
    };
    
    window.addEventListener('CONVERT_ELEMENT', handleConvert);
    return () => window.removeEventListener('CONVERT_ELEMENT', handleConvert);
  }, []);

  // Collaboration hook for presence and live cursors
  useCollaboration(board?.id, stageRef);

  // ── Custom Hooks ─────────────────────────────────────────────────────────

  const resetDrawingRef = useRef<() => void>(() => {});
  const handleElementSelectRef = useRef<any>(null);

  const { windowSize, isSpacePressed, isAltPressed } = useCanvasEvents({
    resetDrawingState: () => resetDrawingRef.current(),
  });

  const {
    startDrag,
    moveDrag,
    endDrag,
  } = useElementDragging({ stageRef, isReadOnly, isAltPressed });

  const {
    isDrawing,
    previewElement,
    selectionBox,
    isPanDragging,
    editingElementId,
    setEditingElementId,
    contextMenuPos,
    setContextMenuPos,
    hoveredElementId,
    resetDrawingState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    handleContextMenu,
    handleConnectorDragStart,
    handleWheel
  } = useCanvasDrawing({ 
    stageRef, 
    isReadOnly, 
    isSpacePressed,
    startDrag,
    moveDrag,
    endDrag,
    handleElementSelect: (e, id) => handleElementSelectRef.current?.(e, id)
  });

  useEffect(() => {
    resetDrawingRef.current = resetDrawingState;
  }, [resetDrawingState]);

  // ── Local Handlers ───────────────────────────────────────────────────────
  
  const {
    handleElementSelect,
    handleTransformerChange,
    handleElementDoubleClick,
    handleElementChange,
  } = useCanvasInteractions({
    isReadOnly,
    setEditingElementId,
  });

  useEffect(() => {
    handleElementSelectRef.current = handleElementSelect;
  }, [handleElementSelect]);

  // Determine cursor style
  const getCursorStyle = () => {
    const customHandGrab = `url("/hand-cursor.png") 16 16, grab`;
    const customHandGrabbing = `url("/hand-cursor.png") 16 16, grabbing`;

    if (isPanDragging) return customHandGrabbing;
    if (activeTool === TOOLS.HAND || isSpacePressed) return customHandGrab;
    if (activeTool === TOOLS.ERASER) return 'crosshair';
    if (isAltPressed) return 'copy';
    if (activeTool === TOOLS.SELECT) return 'default';
    return 'crosshair';
  };

  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.container().style.cursor = getCursorStyle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool, isSpacePressed, isAltPressed, isPanDragging]);



  return (
    <div 
      className="relative w-full h-full bg-canvas-bg overflow-hidden outline-none" 
      style={{ cursor: getCursorStyle() }}
      tabIndex={0}
    >
      <Stage
        ref={stageRef}
        width={windowSize.width}
        height={windowSize.height}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        draggable={activeTool === TOOLS.HAND || isSpacePressed}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            setViewport({
              ...viewport,
              x: e.target.x(),
              y: e.target.y(),
            });
          }
        }}
        className="outline-none bg-transparent"
        style={{ cursor: getCursorStyle() }}
      >
        <CanvasGrid 
          stagePos={{ x: viewport.x, y: viewport.y }}
          stageScale={viewport.scale}
          windowSize={windowSize}
        />

        <Layer>
          {sortedIds.map((id) => (
            <ElementRenderer
              key={id}
              id={id}
              isEditing={editingElementId === id}
              isSelected={selectedIds.includes(id)}
              onSelect={handleElementSelect}
              onChange={handleElementChange}
              onDoubleClick={handleElementDoubleClick}
            />
          ))}
          
          {previewElement && (
            <ElementRenderer 
              id="preview"
              previewElement={previewElement} 
              isEditing={false}
              isSelected={false} 
              onSelect={() => {}} 
              onChange={() => {}} 
              onDoubleClick={() => {}}
            />
          )}
        </Layer>

        <Layer>
          {!isReadOnly && (
            <ElementTransformer 
              selectedIds={selectedIds} 
              elements={elements} 
              onChange={handleTransformerChange} 
            />
          )}
          {!isReadOnly && activeTool === TOOLS.SELECT && (selectedIds.length === 1 || hoveredElementId) && !isPanDragging && (
            <ConnectionDots 
              selectedIds={selectedIds}
              hoveredElementId={hoveredElementId}
              elements={elements}
              stageRef={stageRef}
              onDragStart={handleConnectorDragStart}
            />
          )}
          {!isReadOnly && <SelectionRect selectionBox={selectionBox} />}
        </Layer>
      </Stage>

      <CursorLayer stageRef={stageRef} />

      {!isReadOnly && contextMenuPos && (
        <ContextMenu position={contextMenuPos} onClose={() => setContextMenuPos(null)} />
      )}

      {!isReadOnly && editingElementId && elements[editingElementId] && (
        <TextEditorOverlay
          element={elements[editingElementId]}
          stageRef={stageRef}
          onClose={() => setEditingElementId(null)}
        />
      )}
    </div>
  );
});

InfiniteCanvas.displayName = 'InfiniteCanvas';
export default InfiniteCanvas;
