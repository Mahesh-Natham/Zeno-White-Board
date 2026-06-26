import { useEffect, useRef } from 'react';
import useCanvasStore from '../../store/canvasStore';

export default function Minimap() {
  const { elements, viewport, setViewport } = useCanvasStore();
  const canvasRef = useRef(null);

  const minimapWidth = 200;
  const minimapHeight = 120;
  const padding = 20;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, minimapWidth, minimapHeight);
    
    // Get bounds of all elements
    const elementList = Object.values(elements);
    if (elementList.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    elementList.forEach(el => {
      let x1 = el.x;
      let y1 = el.y;
      let x2 = el.x + (el.width || 0);
      let y2 = el.y + (el.height || 0);
      
      if (el.points) {
        x2 = el.x + Math.max(el.points[0], el.points[2]);
        y2 = el.y + Math.max(el.points[1], el.points[3]);
        x1 = el.x + Math.min(el.points[0], el.points[2]);
        y1 = el.y + Math.min(el.points[1], el.points[3]);
      }

      minX = Math.min(minX, x1);
      minY = Math.min(minY, y1);
      maxX = Math.max(maxX, x2);
      maxY = Math.max(maxY, y2);
    });

    // Make sure we have some width/height
    const contentWidth = Math.max(maxX - minX, 100);
    const contentHeight = Math.max(maxY - minY, 100);

    // Calculate scale to fit everything in the minimap
    const scaleX = (minimapWidth - padding * 2) / contentWidth;
    const scaleY = (minimapHeight - padding * 2) / contentHeight;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (minimapWidth - contentWidth * scale) / 2 - minX * scale;
    const offsetY = (minimapHeight - contentHeight * scale) / 2 - minY * scale;

    // Draw elements
    elementList.forEach(el => {
      ctx.fillStyle = el.fill || el.stroke || '#ccc';
      ctx.globalAlpha = el.opacity || 1;
      
      let x = el.x * scale + offsetX;
      let y = el.y * scale + offsetY;
      let w = (el.width || 0) * scale;
      let h = (el.height || 0) * scale;

      if (el.points) {
         w = Math.max(10, Math.abs(el.points[2] - el.points[0]) * scale);
         h = Math.max(10, Math.abs(el.points[3] - el.points[1]) * scale);
      }

      ctx.fillRect(x, y, w || 5, h || 5);
    });

    // Draw Viewport Rect
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#4262FF';
    ctx.lineWidth = 2;
    
    // Viewport is essentially a rect from -viewport.x / viewport.scale to (-viewport.x + window.innerWidth) / viewport.scale
    const viewW = window.innerWidth / viewport.scale;
    const viewH = window.innerHeight / viewport.scale;
    const viewX = -viewport.x / viewport.scale;
    const viewY = -viewport.y / viewport.scale;

    const mapX = viewX * scale + offsetX;
    const mapY = viewY * scale + offsetY;
    const mapW = viewW * scale;
    const mapH = viewH * scale;

    ctx.strokeRect(mapX, mapY, mapW, mapH);
    // Fill with slight transparent blue
    ctx.fillStyle = 'rgba(66, 98, 255, 0.1)';
    ctx.fillRect(mapX, mapY, mapW, mapH);

  }, [elements, viewport]);

  return (
    <div className="absolute bottom-20 right-4 bg-white/90 backdrop-blur-md rounded-md shadow-floating border border-gray-100 overflow-hidden z-10 pointer-events-auto">
      <canvas 
        ref={canvasRef} 
        width={minimapWidth} 
        height={minimapHeight} 
        className="block cursor-pointer"
        onClick={(e) => {
          // Simple click-to-pan feature
          const rect = canvasRef.current.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - rect.top;

          // Inverse the calculation
          const elementList = Object.values(elements);
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          elementList.forEach(el => {
            let x1 = el.x; let y1 = el.y; let x2 = el.x + (el.width || 0); let y2 = el.y + (el.height || 0);
            minX = Math.min(minX, x1); minY = Math.min(minY, y1); maxX = Math.max(maxX, x2); maxY = Math.max(maxY, y2);
          });
          const contentWidth = Math.max(maxX - minX, 100);
          const contentHeight = Math.max(maxY - minY, 100);
          const scaleX = (minimapWidth - padding * 2) / contentWidth;
          const scaleY = (minimapHeight - padding * 2) / contentHeight;
          const scale = Math.min(scaleX, scaleY);
          const offsetX = (minimapWidth - contentWidth * scale) / 2 - minX * scale;
          const offsetY = (minimapHeight - contentHeight * scale) / 2 - minY * scale;

          const targetCanvasX = (clickX - offsetX) / scale;
          const targetCanvasY = (clickY - offsetY) / scale;

          // Center the viewport on this point
          const viewW = window.innerWidth / viewport.scale;
          const viewH = window.innerHeight / viewport.scale;

          setViewport({
            ...viewport,
            x: -(targetCanvasX - viewW / 2) * viewport.scale,
            y: -(targetCanvasY - viewH / 2) * viewport.scale
          });
        }}
      />
    </div>
  );
}
