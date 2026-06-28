import { useState, useRef, useCallback } from 'react';
import useCanvasStore from '../store/canvasStore';
import useToolStore from '../store/toolStore';
import useAuthStore from '../store/authStore';
import useUiStore from '../store/uiStore';
import { TOOLS, ZOOM_STEP, MIN_ZOOM, MAX_ZOOM } from '../config/constants';
import { createDefaultElement } from '../utils/elementFactory';
import { simplifyPoints } from '../utils/canvasUtils';

interface UseCanvasDrawingProps {
  stageRef: React.RefObject<any>;
  isReadOnly: boolean;
  isSpacePressed: boolean;
  startDrag?: (targetId: string, pos: {x: number, y: number}) => void;
  moveDrag?: (pos: {x: number, y: number}) => void;
  endDrag?: (pos: {x: number, y: number}) => void;
  handleElementSelect?: (e: any, id: string) => void;
}

export function useCanvasDrawing({
  stageRef,
  isReadOnly,
  isSpacePressed,
  startDrag,
  moveDrag,
  endDrag,
  handleElementSelect,
}: UseCanvasDrawingProps) {
  // Local state for drawing
  const [isDrawing, setIsDrawing] = useState(false);
  const [previewElement, setPreviewElement] = useState<any>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  
  // Local state for selection rect
  const [selectionBox, setSelectionBox] = useState({ visible: false, startX: 0, startY: 0, endX: 0, endY: 0 });
  
  // State for panning cursor
  const [isPanDragging, setIsPanDragging] = useState(false);

  const lastMousePos = useRef({ x: 0, y: 0 });
  const hasDraggedRightClick = useRef(false);

  const resetDrawingState = useCallback(() => {
    setIsDrawing(false);
    setPreviewElement(null);
    setSelectionBox({ visible: false, startX: 0, startY: 0, endX: 0, endY: 0 });
  }, []);

  // Helper to convert screen points to absolute canvas points
  const getCanvasPoint = (pointer: any) => {
    const stage = stageRef.current;
    if (!stage || !pointer) return { x: 0, y: 0 };
    return {
      x: (pointer.x - stage.x()) / stage.scaleX(),
      y: (pointer.y - stage.y()) / stage.scaleY(),
    };
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    let newScale = direction > 0 ? oldScale * ZOOM_STEP : oldScale / ZOOM_STEP;
    newScale = Math.max(MIN_ZOOM, Math.min(newScale, MAX_ZOOM));

    useCanvasStore.getState().setViewport({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
      scale: newScale,
    });
  };

  const handleConnectorDragStart = (elementId: string) => {
    if (isReadOnly) return;
    
    const pointer = stageRef.current?.getPointerPosition();
    if (!pointer) return;
    const pos = getCanvasPoint(pointer);
    const { userProfile } = useAuthStore.getState();
    const userId = userProfile?.uid || 'anonymous';
    const { defaultStyles } = useToolStore.getState();
    
    let newElement = createDefaultElement(TOOLS.ELBOW_ARROW, pos.x, pos.y, userId, defaultStyles);
    newElement.points = [0, 0, 0, 0];
    newElement.startElementId = elementId;
    newElement.dash = [10, 10]; // Dotted line while drawing
    newElement.opacity = 0.6; // Semi-transparent while drawing
    newElement.stroke = '#fdba74'; // Light orange connector color
    
    setIsDrawing(true);
    setPreviewElement(newElement);
  };

  const handleMouseDown = (e: any) => {
    if (isReadOnly) return;
    
    if (e.evt && e.evt.pointerId !== undefined && e.evt.target && e.evt.target.setPointerCapture) {
      try { e.evt.target.setPointerCapture(e.evt.pointerId); } catch(err) {}
    }
    
    // Close context menu if open
    if (contextMenuPos) setContextMenuPos(null);

    const { activeTool, setActiveTool, defaultStyles } = useToolStore.getState();
    const { userProfile } = useAuthStore.getState();
    const { clickShortcuts, addElement, removeElements, clearSelection, elements } = useCanvasStore.getState();

    if (e.evt.button === 2) {
      // Check for triple right-click
      if (e.evt.detail === 3) {
        e.evt.preventDefault();
        const pointer = stageRef.current?.getPointerPosition();
        if (!pointer) return;
        const pos = getCanvasPoint(pointer);
        const userId = userProfile?.uid || 'anonymous';
        
        // Use custom shortcut
        const toolToCreate = clickShortcuts.rightTripleClick || TOOLS.STICKY_NOTE;
        
        if (toolToCreate === 'none' || toolToCreate === 'None') {
          return;
        }
        
        const newElement = createDefaultElement(toolToCreate, pos.x, pos.y, userId, defaultStyles);
        
        // Handle tool specifics
        if (toolToCreate === TOOLS.TEXT) {
          newElement.width = 200;
          newElement.height = 40;
        } else if (['rectangle', 'circle', 'triangle', 'rhombus'].includes(toolToCreate as string)) {
          newElement.width = 100;
          newElement.height = 100;
        }

        addElement(newElement);
        
        if ([TOOLS.STICKY_NOTE, TOOLS.TEXT].includes(toolToCreate as string)) {
          setEditingElementId(newElement.id);
        }
        
        setActiveTool(TOOLS.SELECT);
        return;
      }

      // Start right click pan
      lastMousePos.current = { x: e.evt.clientX, y: e.evt.clientY };
      hasDraggedRightClick.current = false;
      setIsPanDragging(true);
      return;
    }

    let targetElementId = null;
    let isClickingEmptyStage = e.target === e.target.getStage();
    
    if (isClickingEmptyStage) {
      // Check if clicking over an HTML overlay (Kanban/Table)
      const pointer = stageRef.current?.getPointerPosition();
      if (pointer) {
        const pos = getCanvasPoint(pointer);
        const els = Object.values(elements).reverse();
        for (const el of els) {
          if (['kanban', 'table', 'timeline', 'google_workspace'].includes(el.type)) {
            let w = el.width || 0;
            let h = el.height || 0;
            if (!w || !h) {
              if (['kanban', 'table'].includes(el.type)) { w = 1000; h = 700; }
              else if (el.type === 'timeline') { w = 900; h = 600; }
              else if (el.type === 'google_workspace') { w = 800; h = 600; }
            }
            const elMinX = el.x;
            const elMinY = el.y;
            const elMaxX = el.x + w;
            const elMaxY = el.y + h;
            if (pos.x >= elMinX && pos.x <= elMaxX && pos.y >= elMinY && pos.y <= elMaxY) {
              isClickingEmptyStage = false; // Treat as clicking an element
              targetElementId = el.id;
              break;
            }
          }
        }
      }
    } else {
      let currentNode = e.target;
      while (currentNode && !targetElementId) {
        targetElementId = currentNode.id();
        currentNode = currentNode.parent;
      }
    }
    
    if (activeTool === TOOLS.SELECT) {
      if (isClickingEmptyStage) {
        clearSelection();
        const pointer = stageRef.current?.getPointerPosition();
        if (!pointer) return;
        const pos = getCanvasPoint(pointer);
        setSelectionBox({ visible: true, startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y });
      } else if (targetElementId && handleElementSelect && startDrag) {
        handleElementSelect(e, targetElementId);
        const pointer = stageRef.current?.getPointerPosition();
        if (pointer) {
          startDrag(targetElementId, getCanvasPoint(pointer));
        }
      }
      return;
    }

    // Eraser tool — click on element to delete it
    if (activeTool === TOOLS.ERASER) {
      if (!isClickingEmptyStage) {
        const targetId = e.target.id() || e.target.parent?.id();
        if (targetId && elements[targetId]) {
          removeElements([targetId]);
        }
      }
      return;
    }

    // Hand tool / Space panning — don't create elements
    if (activeTool === TOOLS.HAND || isSpacePressed) {
      setIsPanDragging(true);
      return;
    }
    
    // Comment tool — placeholder, don't create elements
    if (activeTool === TOOLS.COMMENT) return;

    // Creating new elements
    const pointer = stageRef.current?.getPointerPosition();
    if (!pointer) return;
    const pos = getCanvasPoint(pointer);
    const userId = userProfile?.uid || 'anonymous';
    const newElement = createDefaultElement(activeTool, pos.x, pos.y, userId, defaultStyles);



    if (activeTool === TOOLS.AREA_ERASER) {
      clearSelection();
      setSelectionBox({ visible: true, startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y });
      return;
    }

    if (activeTool === TOOLS.GOOGLE_WORKSPACE) {
      console.log("Triggering Google Workspace Modal at", pos);
      try {
        const { openEmbedModal } = useUiStore.getState();
        openEmbedModal({ x: pos.x, y: pos.y });
        console.log("Modal state opened successfully");
      } catch (err) {
        console.error("Failed to open embed modal", err);
      }
      return;
    }

    if (activeTool === TOOLS.IMAGE) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (event: any) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const boardId = useCanvasStore.getState().boardId;
        if (!boardId) return;

        newElement.src = 'loading';
        newElement.width = 200;
        newElement.height = 200;
        addElement(newElement);

        setActiveTool(TOOLS.SELECT);

        try {
          const { compressImage } = await import('../utils/imageCompressor');
          const { uploadImage } = await import('../services/storageService');
          
          const compressed = await compressImage(file);
          const url = await uploadImage(boardId, compressed);
          
          const img = new Image();
          img.src = URL.createObjectURL(compressed);
          img.onload = () => {
            useCanvasStore.getState().updateElement(newElement.id, {
              src: url,
              width: img.width,
              height: img.height,
            });
            URL.revokeObjectURL(img.src);
          };
          img.onerror = () => {
            // Fallback if we can't get dimensions
            useCanvasStore.getState().updateElement(newElement.id, {
              src: url,
            });
          }
        } catch (error) {
          console.error('Failed to upload image:', error);
          removeElements([newElement.id]);
        }
      };
      input.click();
      return;
    }

    if (activeTool === TOOLS.REACTION) {
      const reactionElement = createDefaultElement(TOOLS.TEXT, pos.x, pos.y, userId, defaultStyles);
      reactionElement.text = useToolStore.getState().selectedReaction;
      reactionElement.fontSize = 48;
      reactionElement.width = 60;
      reactionElement.height = 60;
      reactionElement.fill = 'transparent';
      reactionElement.stroke = 'transparent';
      addElement(reactionElement);
      setActiveTool(TOOLS.SELECT);
      return;
    }

    if (activeTool === TOOLS.STICKY_NOTE || activeTool === TOOLS.TEXT || activeTool === TOOLS.TIMELINE || activeTool === TOOLS.KANBAN || activeTool === TOOLS.TABLE || activeTool === TOOLS.DOC) {
      // One-click creation tools
      if (activeTool === TOOLS.DOC) {
        newElement.width = 600;
        newElement.height = 800;
        newElement.content = '';
      }
      addElement(newElement);
      
      if (activeTool === TOOLS.STICKY_NOTE || activeTool === TOOLS.TEXT) {
        setEditingElementId(newElement.id);
      }

      setActiveTool(TOOLS.SELECT); // Automatically switch back to Select tool so they don't accidentally create more when clicking out
    } else {
      // If we are already drawing an arrow (2-click mode), don't start a new one!
      if (isDrawing && previewElement && ['arrow', 'line', 'elbow_arrow'].includes(previewElement.type)) {
        return;
      }
      
      // Drag creation tools (Shapes, Pen, Line, Arrow, Frame, Marker, Lasso)
      if ([TOOLS.LINE, TOOLS.ARROW, TOOLS.ELBOW_ARROW, TOOLS.SMART_ARROW, TOOLS.SMART_CONNECTOR].includes(activeTool as string) && targetElementId) {
        newElement.startElementId = targetElementId;
      }
      setIsDrawing(true);
      setPreviewElement(newElement);
    }
  };

  const handleDoubleClick = (e: any) => {
    if (isReadOnly) return;
    
    // Only handle left double-click (button 0)
    if (e.evt && e.evt.button !== 0) return;
    
    const isClickingEmptyStage = e.target === e.target.getStage();
    
    const { defaultStyles, setActiveTool } = useToolStore.getState();
    const { userProfile } = useAuthStore.getState();
    const { clickShortcuts, addElement } = useCanvasStore.getState();

    // Create element on double clicking empty stage
    if (isClickingEmptyStage) {
      const pointer = stageRef.current?.getPointerPosition();
      if (!pointer) return;
      const pos = getCanvasPoint(pointer);
      const userId = userProfile?.uid || 'anonymous';
      
      // Use custom shortcut for double click
      const toolToCreate = clickShortcuts.leftDoubleClick || TOOLS.TEXT;
      
      if (toolToCreate === 'none' || toolToCreate === 'None') {
        return;
      }
      
      const newElement = createDefaultElement(toolToCreate, pos.x, pos.y, userId, defaultStyles);
      
      // Setup text width and shapes dimensions appropriately if they differ from sticky note defaults
      if (toolToCreate === TOOLS.TEXT) {
        newElement.width = 200;
        newElement.height = 40;
      } else if (['rectangle', 'circle', 'triangle', 'rhombus'].includes(toolToCreate as string)) {
        newElement.width = 100;
        newElement.height = 100;
      }
      
      addElement(newElement);
      setEditingElementId(newElement.id);
      setActiveTool(TOOLS.SELECT);
    }
  };

  const handleMouseMove = (e: any) => {
    if (isReadOnly) return;

    if (e.evt.buttons === 2) {
      // Right click drag to pan
      const dx = e.evt.clientX - lastMousePos.current.x;
      const dy = e.evt.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.evt.clientX, y: e.evt.clientY };
      
      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
        hasDraggedRightClick.current = true;
        useCanvasStore.getState().setViewport({
          ...useCanvasStore.getState().viewport,
          x: useCanvasStore.getState().viewport.x + dx,
          y: useCanvasStore.getState().viewport.y + dy
        });
      }
      return;
    }

    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const pos = getCanvasPoint(pointer);

    const { activeTool } = useToolStore.getState();
    const { elements, removeElements } = useCanvasStore.getState();

    // Track hovered element for connection dots
    if (!isDrawing && !isPanDragging && !selectionBox.visible && activeTool === TOOLS.SELECT) {
      let newHoveredId = null;
      const shape = stage.getIntersection(pointer);
      
      if (shape && shape !== stage && shape.name() !== 'board-element') {
        newHoveredId = shape.id() || shape.parent?.id();
      }
      
      // Fallback for HTML overlays
      if (!newHoveredId) {
        const els = Object.values(elements).reverse();
        for (const el of els) {
          if (['kanban', 'table', 'timeline'].includes(el.type)) {
            let w = el.width || 0;
            let h = el.height || 0;
            if (!w || !h) {
              if (['kanban', 'table'].includes(el.type)) { w = 1000; h = 700; }
              else if (el.type === 'timeline') { w = 900; h = 600; }
            }
            const elMinX = el.x;
            const elMinY = el.y;
            const elMaxX = el.x + w;
            const elMaxY = el.y + h;
            if (pos.x >= elMinX && pos.x <= elMaxX && pos.y >= elMinY && pos.y <= elMaxY) {
              newHoveredId = el.id;
              break;
            }
          }
        }
      }
      
      if (hoveredElementId !== newHoveredId) {
        setHoveredElementId(newHoveredId);
      }
    } else if (hoveredElementId !== null) {
      setHoveredElementId(null);
    }

    // Eraser tool — delete elements on mouse drag
    if (activeTool === TOOLS.ERASER && e.evt.buttons === 1) {
      const shape = stage.getIntersection(pointer);
      if (shape && shape !== stage) {
        const targetId = shape.id() || shape.parent?.id();
        if (targetId && elements[targetId]) {
          removeElements([targetId]);
        }
      }
      return;
    }

    // Handling Drag
    if (activeTool === TOOLS.SELECT && moveDrag && !selectionBox.visible) {
      moveDrag(pos);
    }

    // Handling Selection Rect OR Area Eraser
    if ((activeTool === TOOLS.SELECT || activeTool === TOOLS.AREA_ERASER) && selectionBox.visible) {
      setSelectionBox((prev) => ({ ...prev, endX: pos.x, endY: pos.y }));
      return;
    }

    // Handling shape drawing preview
    if (isDrawing && previewElement) {
      if ([TOOLS.PEN, TOOLS.MARKER, TOOLS.LASSO, TOOLS.SMART_DRAWING, TOOLS.SMART_ARROW, TOOLS.SMART_CONNECTOR].includes(activeTool as string)) {
        setPreviewElement({
          ...previewElement,
          points: [...previewElement.points, pos.x - previewElement.x, pos.y - previewElement.y],
        });
      } else if (activeTool === TOOLS.LINE || activeTool === TOOLS.ARROW || activeTool === TOOLS.ELBOW_ARROW) {
        setPreviewElement({
          ...previewElement,
          points: [0, 0, pos.x - previewElement.x, pos.y - previewElement.y],
        });
      } else if (activeTool === 'block_arrow') {
        const dx = pos.x - previewElement.x;
        const dy = pos.y - previewElement.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const rotation = (Math.atan2(dy, dx) * 180) / Math.PI;
        setPreviewElement({
          ...previewElement,
          width: length,
          height: Math.max(20, Math.min(150, length * 0.4)),
          rotation: rotation,
        });
      } else {
        // Shapes (Rect, Circle, Triangle, Frame)
        setPreviewElement({
          ...previewElement,
          width: pos.x - previewElement.x,
          height: pos.y - previewElement.y,
        });
      }
    }
  };

  const handleMouseUp = (e: any) => {
    setIsPanDragging(false);
    if (isReadOnly) return;
    
    const { activeTool, setActiveTool, defaultStyles } = useToolStore.getState();
    const { elements, removeElements, setSelectedIds, addElement } = useCanvasStore.getState();

    // Finalize Selection Rect OR Area Eraser
    if ((activeTool === TOOLS.SELECT || activeTool === TOOLS.AREA_ERASER) && selectionBox.visible) {
      // Find intersecting elements
      const box = {
        minX: Math.min(selectionBox.startX, selectionBox.endX),
        minY: Math.min(selectionBox.startY, selectionBox.endY),
        maxX: Math.max(selectionBox.startX, selectionBox.endX),
        maxY: Math.max(selectionBox.startY, selectionBox.endY),
      };
      
      const intersectingIds = Object.values(elements).filter(el => {
        // Basic AABB intersection check
        const elMinX = el.x;
        const elMinY = el.y;
        const elMaxX = el.x + (el.width || 0);
        const elMaxY = el.y + (el.height || 0);
        
        return !(elMaxX < box.minX || elMinX > box.maxX || elMaxY < box.minY || elMinY > box.maxY);
      }).map(el => el.id);

      if (activeTool === TOOLS.AREA_ERASER) {
        if (intersectingIds.length > 0) {
          removeElements(intersectingIds);
        }
      } else {
        setSelectedIds(intersectingIds);
      }
      
      setSelectionBox({ visible: false, startX: 0, startY: 0, endX: 0, endY: 0 });
      return;
    }

    // End Drag
    if (activeTool === TOOLS.SELECT && endDrag && !selectionBox.visible) {
      const pointer = stageRef.current?.getPointerPosition();
      if (pointer) endDrag(getCanvasPoint(pointer));
    }

    // Finalize Shape Drawing
    if (isDrawing && previewElement) {
      // If it was Lasso, select elements instead of drawing
      if (activeTool === TOOLS.LASSO) {
        const pts = previewElement.points;
        if (pts && pts.length > 4) {
          // Calculate lasso bounding box
          let minX = pts[0], maxX = pts[0], minY = pts[1], maxY = pts[1];
          for (let i = 0; i < pts.length; i += 2) {
            minX = Math.min(minX, pts[i]);
            maxX = Math.max(maxX, pts[i]);
            minY = Math.min(minY, pts[i+1]);
            maxY = Math.max(maxY, pts[i+1]);
          }
          const box = {
            minX: previewElement.x + minX,
            minY: previewElement.y + minY,
            maxX: previewElement.x + maxX,
            maxY: previewElement.y + maxY,
          };
          
          const intersectingIds = Object.values(elements).filter(el => {
            const elMinX = el.x;
            const elMinY = el.y;
            const elMaxX = el.x + (el.width || 0);
            const elMaxY = el.y + (el.height || 0);
            return !(elMaxX < box.minX || elMinX > box.maxX || elMaxY < box.minY || elMinY > box.maxY);
          }).map(el => el.id);

          setSelectedIds(intersectingIds);
        }
        setIsDrawing(false);
        setPreviewElement(null);
        setActiveTool(TOOLS.SELECT); // Switch back to select after lasso
        return;
      }
      let targetElementId = null;
      const pointer = stageRef.current?.getPointerPosition();
      
      if (pointer) {
        const intersections = stageRef.current?.getAllIntersections(pointer) || [];
        
        const hitNode = intersections.find((node: any) => {
          const id = node.id() || node.parent?.id();
          return id && id !== 'preview' && (!previewElement || id !== previewElement.id) && node.name() === 'board-element';
        });
        
        if (hitNode) {
          targetElementId = hitNode.id() || hitNode.parent?.id();
        } else {
          // Fallback for HTML overlays (Kanban/Table) which capture pointer events
          const pos = getCanvasPoint(pointer);
          const els = Object.values(elements).reverse();
          for (const el of els) {
            if (previewElement && el.id === previewElement.startElementId) continue;

            if (['kanban', 'table', 'timeline', 'google_workspace'].includes(el.type)) {
              let w = el.width || 0;
              let h = el.height || 0;
              if (!w || !h) {
                if (['kanban', 'table'].includes(el.type)) { w = 1000; h = 700; }
                else if (el.type === 'timeline') { w = 900; h = 600; }
                else if (el.type === 'google_workspace') { w = 800; h = 600; }
              }
              const elMinX = el.x;
              const elMinY = el.y;
              const elMaxX = el.x + w;
              const elMaxY = el.y + h;
              if (pos.x >= elMinX && pos.x <= elMaxX && pos.y >= elMinY && pos.y <= elMaxY) {
                targetElementId = el.id;
                break;
              }
            }
          }
        }
      }

      // Smart Drawing Recognition & Smoothing
      if ([TOOLS.SMART_DRAWING, TOOLS.SMART_ARROW, TOOLS.SMART_CONNECTOR].includes(activeTool as string)) {
        const pts = previewElement.points;
        let finalShape = { ...previewElement };
        
        if (pts && pts.length > 4) {
          const simplified = simplifyPoints(pts, 3); // Lower tolerance keeps more points for a smoother bezier curve
          
          if (activeTool === TOOLS.SMART_DRAWING) {
            let minX = pts[0], maxX = pts[0], minY = pts[1], maxY = pts[1];
            for (let i = 0; i < pts.length; i += 2) {
              minX = Math.min(minX, pts[i]);
              maxX = Math.max(maxX, pts[i]);
              minY = Math.min(minY, pts[i+1]);
              maxY = Math.max(maxY, pts[i+1]);
            }
            const w = maxX - minX;
            const h = maxY - minY;
            const startX = pts[0], startY = pts[1];
            const endX = pts[pts.length - 2], endY = pts[pts.length - 1];
            
            const dist = Math.sqrt((endX - startX)**2 + (endY - startY)**2);
            const diagonal = Math.sqrt(w*w + h*h);
            const isClosed = dist < diagonal * 0.25;
            
            if (isClosed && w > 10 && h > 10) {
              const aspect = Math.max(w/h, h/w);
              if (aspect < 1.3) {
                finalShape.type = TOOLS.CIRCLE;
              } else {
                finalShape.type = TOOLS.RECTANGLE;
              }
              finalShape.x = previewElement.x + minX;
              finalShape.y = previewElement.y + minY;
              finalShape.width = w;
              finalShape.height = h;
              finalShape.fill = 'transparent';
              delete finalShape.points;
            } else if (!isClosed && diagonal > 20 && simplified.length === 4) {
              finalShape.type = TOOLS.LINE;
              finalShape.points = [0, 0, endX - startX, endY - startY];
              finalShape.x = previewElement.x + startX;
              finalShape.y = previewElement.y + startY;
            } else {
              finalShape.type = TOOLS.PEN;
              finalShape.points = simplified;
            }
          } else if (activeTool === TOOLS.SMART_ARROW) {
            finalShape.type = TOOLS.ARROW;
            finalShape.points = simplified;
          } else if (activeTool === TOOLS.SMART_CONNECTOR) {
            finalShape.type = TOOLS.ELBOW_ARROW;
            // Elbow arrow only uses start and end points [x1, y1, x2, y2]
            finalShape.points = [simplified[0], simplified[1], simplified[simplified.length - 2], simplified[simplified.length - 1]];
            finalShape.stroke = '#fdba74'; // Light orange connector color
          }
        } else {
          finalShape.type = TOOLS.PEN;
        }

        // Keep the startElementId and set endElementId like arrows do
        if (['arrow', 'line', 'elbow_arrow'].includes(finalShape.type) && targetElementId && targetElementId !== finalShape.startElementId && targetElementId !== finalShape.id) {
          finalShape.endElementId = targetElementId;
        }
        
        addElement(finalShape);
        setIsDrawing(false);
        setPreviewElement(null);
        return;
      }

      // Fix negative width/height for shapes
      let finalElement = { ...previewElement };

      if (['rectangle', 'circle', 'triangle', 'rhombus', 'divider', 'frame'].includes(finalElement.type)) {
        if (finalElement.width < 0) {
          finalElement.x += finalElement.width;
          finalElement.width = Math.abs(finalElement.width);
        }
        if (finalElement.height < 0) {
          finalElement.y += finalElement.height;
          finalElement.height = Math.abs(finalElement.height);
        }
        
        // Prevent accidental micro-clicks from creating tiny shapes
        if (finalElement.width < 5 && finalElement.height < 5) {
          // Special case: If frame, we allow single click to create with default styles
          if (finalElement.type === 'frame') {
            finalElement.width = 800;
            finalElement.height = 600;
            // Center the one-click frame on the click
            finalElement.x -= finalElement.width / 2;
            finalElement.y -= finalElement.height / 2;
          } else {
            setIsDrawing(false);
            setPreviewElement(null);
            return;
          }
        }
      } else if (finalElement.type === 'block_arrow') {
        // Enforce default size on micro-clicks and ignore scaling flips
        if (finalElement.width < 10) {
          finalElement.width = 100;
          finalElement.height = 40;
          finalElement.rotation = 0;
        }
      } else if (['arrow', 'line', 'elbow_arrow'].includes(finalElement.type)) {
        const pts = finalElement.points || [0,0,0,0];
        const dist = Math.sqrt(pts[2]**2 + pts[3]**2);
        
        // If distance is very small (< 10px), it was just a click! Enter 2-click drawing mode.
        // We do not cancel here because the first click on a dot also triggers handleMouseUp
        // with dist < 10. They can cancel by pressing Escape (if implemented) or clicking elsewhere.
        if (dist < 10) {
          return;
        }
        
        if (targetElementId && targetElementId !== finalElement.startElementId && targetElementId !== finalElement.id) {
          finalElement.endElementId = targetElementId;
        }

        // Remove dotted preview styling so the final line is solid
        delete finalElement.dash;
        finalElement.opacity = 1;
      }

      addElement(finalElement);
      setIsDrawing(false);
      setPreviewElement(null);
      setActiveTool(TOOLS.SELECT);
    }
  };

  const handleContextMenu = (e: any) => {
    e.evt.preventDefault();
    if (isReadOnly || hasDraggedRightClick.current) {
      hasDraggedRightClick.current = false;
      return;
    }

    // If clicking on stage (not element), clear selection
    if (e.target === stageRef.current) {
      useCanvasStore.getState().setSelectedIds([]);
      setContextMenuPos(null);
      return;
    }

    setContextMenuPos({ x: e.evt.clientX, y: e.evt.clientY });
  };

  return {
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
  };
}
