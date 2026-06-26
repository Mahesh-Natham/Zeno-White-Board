import React, { useCallback, useRef, useEffect } from 'react';
import { Group, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
import { TableProvider, TableData } from '../../../../components/dashboard/table/TableContext';
import TableView from '../../../../components/dashboard/TableView';
import useHtmlZoom from '../../../../hooks/useHtmlZoom';
import useCanvasStore from '../../../../store/canvasStore';
import useToolStore from '../../../../store/toolStore';
import { TOOLS } from '../../../../config/constants';

interface TableElementProps {
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

export default function TableElement({
  element,
  isSelected,
  onChange,
}: TableElementProps) {
  const data = element.tableData as TableData;
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<any>(null);

  const activeTool = useToolStore((state) => state.activeTool);
  const isConnecting = [TOOLS.ARROW, TOOLS.LINE, TOOLS.ELBOW_ARROW, TOOLS.SMART_CONNECTOR].includes(activeTool as any);

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    
    // Don't drag if clicking interactive elements
    if (target.closest('button, input, select, .nodrag, .canvas-table-row')) return;
    
    // Check if clicking a scrollbar
    const scrollContainer = target.closest('.table-scroll-container');
    if (scrollContainer) {
      const el = scrollContainer as HTMLElement;
      if (e.clientX > el.getBoundingClientRect().right - el.offsetWidth + el.clientWidth ||
          e.clientY > el.getBoundingClientRect().bottom - el.offsetHeight + el.clientHeight) {
        return; // It's the scrollbar
      }
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

  const handleUpdateData = useCallback((updates: Partial<TableData>) => {
    onChange(element.id, { tableData: { ...data, ...updates } });
  }, [element.id, data, onChange]);

  const requiredWidth = (data?.columns?.reduce((sum, col) => sum + (col.visible ? col.width : 0), 0) || 0) + 140;
  const requiredHeight = ((data?.rows?.length || 0) * 44) + 120; // Approx row height + header/toolbar + padding
  
  const prevRequiredWidth = useRef(requiredWidth);
  const prevRequiredHeight = useRef(requiredHeight);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (data.settings?.autoSize !== false) {
      const widthChanged = requiredWidth !== prevRequiredWidth.current;
      const heightChanged = requiredHeight !== prevRequiredHeight.current;
      
      if (widthChanged || heightChanged || isFirstRender.current) {
        if (onChange) {
          onChange(element.id, { 
            width: Math.max(requiredWidth, element.width),
            height: Math.max(requiredHeight, element.height)
          });
        }
        prevRequiredWidth.current = requiredWidth;
        prevRequiredHeight.current = requiredHeight;
        isFirstRender.current = false;
      }
    }
  }, [requiredWidth, requiredHeight, element.width, element.height, element.id, onChange, data.settings?.autoSize]);

  if (!data) return null;

  return (
    <Group
      id={element.id}
      ref={groupRef}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation || 0}
      scaleX={element.scaleX || 1}
      scaleY={element.scaleY || 1}
    >
      <Rect
        name="board-element"
        width={element.width}
        height={element.height}
        fill="rgba(0,0,0,0)"
        cornerRadius={8}
        stroke={isSelected ? '#3B82F6' : '#E5E7EB'}
        strokeWidth={isSelected ? 3 : 1}
        shadowColor="rgba(0,0,0,0.1)"
        shadowBlur={10}
        shadowOffsetY={4}
        shadowOpacity={0.5}
      />

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
          ref={containerRef}
          className={`w-full h-full rounded-lg overflow-hidden relative table-element-root ${isConnecting ? 'pointer-events-none-all' : ''}`}
          onPointerDown={handlePointerDown}
        >
          <TableProvider data={{...data, id: element.id}} onUpdateData={handleUpdateData}>
            <TableView />
          </TableProvider>
        </div>
      </Html>
    </Group>
  );
}
