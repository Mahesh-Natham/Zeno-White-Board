import React, { useRef } from 'react';
import { Group, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
import { AppWindow, GripHorizontal } from 'lucide-react';
import { GoogleWorkspaceElement as GoogleWorkspaceElementType } from '../../../types';

import useCanvasStore from '../../../store/canvasStore';
import useToolStore from '../../../store/toolStore';
import { TOOLS } from '../../../config/constants';

interface GoogleWorkspaceElementProps {
  element: GoogleWorkspaceElementType;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
}

export default function GoogleWorkspaceElement({
  element,
  isSelected,
  onSelect,
  onChange
}: GoogleWorkspaceElementProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scale = useCanvasStore(state => state.viewport.scale) || 1;
  const activeTool = useToolStore((state) => state.activeTool);
  const isConnecting = [TOOLS.ARROW, TOOLS.LINE, TOOLS.ELBOW_ARROW, TOOLS.SMART_CONNECTOR].includes(activeTool as any);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only capture events on the header drag handle to allow native iframe scrolling
    const target = e.target as HTMLElement;
    if (target.closest('.drag-handle')) {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.stopPropagation();
      // Adjust movement by scale for accurate dragging
      onChange({
        x: element.x + e.movementX / scale,
        y: element.y + e.movementY / scale
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.stopPropagation();
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
    >
      <Rect
        name="board-element"
        width={element.width}
        height={element.height}
        fill="rgba(0,0,0,0)"
        cornerRadius={8}
        stroke={isSelected ? '#22C55E' : undefined}
        strokeWidth={isSelected ? 2 : 0}
      />
      <Html
        groupProps={{ x: 0, y: 0 }}
        divProps={{
          style: {
            width: `${element.width}px`,
            height: `${element.height}px`,
            position: 'absolute',
            zIndex: element.zIndex || 10,
            pointerEvents: 'none',
          }
        }}
      >
        <div 
          ref={containerRef}
          className={`bg-white rounded-xl shadow-xl border-2 flex flex-col overflow-hidden transition-colors w-full h-full ${isSelected ? 'border-green-500 shadow-green-500/20' : ''} ${isConnecting ? 'pointer-events-none-all' : ''}`}
          style={{
            transformOrigin: 'top left',
            borderColor: isSelected ? undefined : (element.stroke || '#e5e7eb'),
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Header Drag Handle */}
          <div className="drag-handle flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-grab active:cursor-grabbing select-none group">
            <div className="flex items-center gap-2 text-gray-700">
              <AppWindow className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-sm">Google Workspace</span>
            </div>
            <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
              <GripHorizontal className="w-5 h-5" />
            </div>
          </div>

          {/* Iframe Container */}
          <div className="flex-1 w-full bg-gray-100 relative">
            <iframe
              src={element.url}
              title="Google Workspace Embed"
              className="absolute inset-0 w-full h-full border-0"
              style={{ pointerEvents: isConnecting ? 'none' : 'auto' }}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </Html>
    </Group>
  );
}
