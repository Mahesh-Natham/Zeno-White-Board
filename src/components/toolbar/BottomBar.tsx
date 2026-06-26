import { ZoomIn, ZoomOut, Sidebar, HelpCircle } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '../../config/constants';

export default function BottomBar() {
  const { viewport, setViewport } = useCanvasStore();

  const handleZoomIn = () => {
    const newScale = Math.min(viewport.scale * ZOOM_STEP, MAX_ZOOM);
    setViewport({ ...viewport, scale: newScale });
  };

  const handleZoomOut = () => {
    const newScale = Math.max(viewport.scale / ZOOM_STEP, MIN_ZOOM);
    setViewport({ ...viewport, scale: newScale });
  };

  const handleZoomReset = () => {
    setViewport({ x: 0, y: 0, scale: 1 });
  };

  const zoomPercent = Math.round(viewport.scale * 100);


  return (
    <div className="absolute bottom-4 right-4 flex items-end pointer-events-none z-10">
      <div className="flex items-center gap-1 pointer-events-auto bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-md shadow-floating">
        {/* Frames / Sidebar */}
        <button className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors" title="Frames">
          <Sidebar className="w-4 h-4" />
        </button>
        
        <div className="w-px h-4 bg-gray-200 mx-0.5" />

        {/* Zoom Controls */}
        <button 
          onClick={handleZoomOut}
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <button 
          onClick={handleZoomReset}
          className="px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-md min-w-[50px] text-center transition-colors"
          title="Zoom to 100%"
        >
          {zoomPercent}%
        </button>

        <button 
          onClick={handleZoomIn}
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-gray-200 mx-0.5" />

        {/* Help */}
        <button className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors" title="Help">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
