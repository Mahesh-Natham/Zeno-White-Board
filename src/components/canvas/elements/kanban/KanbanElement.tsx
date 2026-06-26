import React, { useCallback, useRef, useEffect } from 'react';
import { Group, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
import { KanbanBoard } from './components/Board/KanbanBoard';
import { KanbanHeader } from './components/Board/KanbanHeader';
import { KanbanTaskSidebar } from './components/Card/KanbanTaskSidebar';
import { KanbanData } from './types';
import { calculateKanbanWidth } from './utils';
import { useKanbanUIStore } from './store';
import useHtmlZoom from '../../../../hooks/useHtmlZoom';
import useCanvasStore from '../../../../store/canvasStore';
import useToolStore from '../../../../store/toolStore';
import { TOOLS } from '../../../../config/constants';
import './kanban.css';

interface KanbanElementProps {
  element: any;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (e: any, id: string) => void;
  onChange: (id: string, newProps: any) => void;
  onDoubleClick: (e: any, id: string) => void;
  onDragStart: (e: any) => void;
  onDragMove: (e: any) => void;
  onDragEnd: (e: any, id: string) => void;
  allElements: any;
}

export default function KanbanElement({
  element,
  isSelected,
  onChange,
}: KanbanElementProps) {
  const data = element.kanbanData as KanbanData;
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<any>(null);
  const { groupBy } = useKanbanUIStore();

  const activeTool = useToolStore((state) => state.activeTool);
  const isConnecting = [TOOLS.ARROW, TOOLS.LINE, TOOLS.ELBOW_ARROW, TOOLS.SMART_CONNECTOR].includes(activeTool as any);

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    
    const isDragHandle = target.closest('.kanban-drag-handle');
    const isBoardBg = target.closest('.kanban-board-bg');
    
    const isInteractive = 
      target.tagName === 'INPUT' || 
      target.tagName === 'BUTTON' || 
      target.tagName === 'SELECT' || 
      target.tagName === 'TEXTAREA' || 
      target.closest('button') || 
      target.closest('.cursor-pointer') || 
      target.closest('.cursor-grab') || 
      target.closest('.kanban-card') || 
      target.closest('.kanban-column-header');

    if (isDragHandle && isInteractive) return;
    if (!isDragHandle && isInteractive) return;

    let isScrollbar = false;
    if (isBoardBg) {
       const bgEl = target.closest('.kanban-board-bg') as HTMLElement;
       if (bgEl) {
         const rect = bgEl.getBoundingClientRect();
         isScrollbar = e.clientX > rect.right - 15 || e.clientY > rect.bottom - 15;
       }
    }

    if (!(isDragHandle || (isBoardBg && !isScrollbar))) {
      return; 
    }

    e.preventDefault();
    e.stopPropagation();

    const store = useCanvasStore.getState();
    const viewport = store.viewport;
    
    if (!store.selectedIds.includes(element.id)) {
      store.setSelectedIds([element.id]);
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const initialElX = element.x;
    const initialElY = element.y;

    const handlePointerMove = (moveEv: PointerEvent) => {
      const dx = (moveEv.clientX - startX) / viewport.scale;
      const dy = (moveEv.clientY - startY) / viewport.scale;
      
      if (groupRef.current) {
         groupRef.current.position({ x: initialElX + dx, y: initialElY + dy });
      }
    };

    const handlePointerUp = (upEv: PointerEvent) => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      
      const dx = (upEv.clientX - startX) / viewport.scale;
      const dy = (upEv.clientY - startY) / viewport.scale;

      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        store.performAction({
          type: 'UPDATE',
          updates: [{
            id: element.id,
            oldProps: { x: initialElX, y: initialElY },
            newProps: { x: initialElX + dx, y: initialElY + dy }
          }]
        });
      }
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  // Re-dispatch wheel events to the canvas so zooming works over HTML overlays
  useHtmlZoom(containerRef);

  // Auto-size enforcement effect
  useEffect(() => {
    if (data.settings?.autoSize !== false) {
      const expectedWidth = calculateKanbanWidth(data.columns, data.settings, groupBy);
      if (Math.abs(element.width - expectedWidth) > 0.5) {
        onChange(element.id, { width: expectedWidth });
      }
    }
  }, [data.columns, data.settings, groupBy, element.width, element.id, onChange]);

  // Handle data updates
  const handleUpdateData = useCallback((updates: Partial<KanbanData> & { _elementWidth?: number }) => {
    const { _elementWidth, ...kanbanUpdates } = updates;
    const newProps: any = { kanbanData: { ...data, ...kanbanUpdates } };
    if (_elementWidth !== undefined) newProps.width = _elementWidth;
    onChange(element.id, newProps);
  }, [element.id, data, onChange]);

  return (
    <Group
      ref={groupRef}
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation || 0}
      scaleX={element.scaleX || 1}
      scaleY={element.scaleY || 1}
    >
      {/* 0. Kanban Header (Floating outside the main block) */}
      <KanbanHeader 
        elementId={element.id}
        data={data}
        onUpdateData={handleUpdateData}
        onPointerDown={handlePointerDown}
      />

      {/* 1. Base Konva Background - for selection highlighting and solid base */}
      <Rect
        name="board-element"
        width={element.width}
        height={element.height}
        fill="#ffffff"
        cornerRadius={8}
        stroke={isSelected ? '#3B82F6' : '#E5E7EB'}
        strokeWidth={isSelected ? 2 : 1}
        shadowColor="rgba(0,0,0,0.1)"
        shadowBlur={10}
        shadowOffsetY={4}
        shadowOpacity={0.5}
      />

      {/* 2. Main HTML Overlay - The entire Kanban UI */}
      <Html
        groupProps={{ x: 0, y: 0 }}
        divProps={{
          style: {
            width: `${element.width}px`,
            height: `${element.height}px`,
            position: 'absolute',
            pointerEvents: 'none',
          },
        }}
      >
        <div 
          id={`kanban-root-${element.id}`}
          ref={containerRef}
          className={`w-full h-full rounded-lg overflow-hidden relative ${isConnecting ? 'pointer-events-none-all' : ''}`}
          onMouseDown={(e) => {
            const target = e.target as HTMLElement;
            
            const isInteractive = 
              target.tagName === 'INPUT' || 
              target.tagName === 'BUTTON' || 
              target.tagName === 'SELECT' || 
              target.tagName === 'TEXTAREA' || 
              target.closest('button') || 
              target.closest('.cursor-pointer') || 
              target.closest('.cursor-grab') || 
              target.closest('.kanban-card') || 
              target.closest('.kanban-column-header');

            if (isInteractive) {
              // We MUST stop propagation so Konva doesn't start dragging the board
              // when we interact with a card or column header
              e.stopPropagation();
              return;
            }

            const isDragHandle = target.closest('.kanban-drag-handle');
            const isBoardBg = target.closest('.kanban-board-bg');
            
            let isScrollbar = false;
            if (isBoardBg) {
               const bgEl = target.closest('.kanban-board-bg') as HTMLElement;
               if (bgEl) {
                 const rect = bgEl.getBoundingClientRect();
                 isScrollbar = e.clientX > rect.right - 15 || e.clientY > rect.bottom - 15;
               }
            }

            if ((isDragHandle || (isBoardBg && !isScrollbar))) {
              // Let the event bubble to Konva for dragging/selection
              return;
            }

            // Otherwise, interact with the HTML (cards, inputs, scrollbars)
            e.stopPropagation();
          }}
          onPointerDown={handlePointerDown}
        >
          {/* Custom Global Styles for Appearance Settings */}
          {(data.settings?.textColor || data.settings?.fontFamily) && (
            <style>{`
              #kanban-root-${element.id} *:not(.kanban-exclude-color) {
                ${data.settings.textColor ? `color: ${data.settings.textColor} !important;` : ''}
              }
              #kanban-root-${element.id} * {
                ${data.settings.fontFamily ? `font-family: ${data.settings.fontFamily} !important;` : ''}
              }
              /* Ensure the placeholder text inherits correctly but stays slightly transparent */
              #kanban-root-${element.id} input::placeholder, 
              #kanban-root-${element.id} textarea::placeholder {
                opacity: 0.6;
              }
            `}</style>
          )}

          <KanbanBoard 
            data={data} 
            isReadOnly={element.locked}
            onUpdateData={handleUpdateData}
          />

          {/* Slide-in portal for card details, rendered over the board but inside the bounds */}
          <KanbanTaskSidebar 
            data={data} 
            isReadOnly={element.locked}
            onUpdateData={handleUpdateData}
          />
        </div>
      </Html>
    </Group>
  );
}
