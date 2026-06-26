import { useEffect, useRef, useState } from 'react';
import InfiniteCanvas from '../canvas/InfiniteCanvas';
import TopBar from '../toolbar/TopBar';
import LeftToolbar from '../toolbar/LeftToolbar';
import BottomBar from '../toolbar/BottomBar';
import FloatingToolbar from '../toolbar/FloatingToolbar';
import Minimap from '../toolbar/Minimap';
import EmbedUrlModal from '../modals/EmbedUrlModal';
import useCanvasStore from '../../store/canvasStore';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';

export default function BoardLayout({ board, isReadOnly }) {
  const { setBoardId } = useCanvasStore();
  const canvasRef = useRef(null);
  const [stageReady, setStageReady] = useState(false);
  
  useKeyboardShortcuts();
  
  useEffect(() => {
    if (board && board.id) {
      setBoardId(board.id);
    }
  }, [board, setBoardId]);

  // Once the InfiniteCanvas mounts, grab the actual Konva stage
  useEffect(() => {
    if (canvasRef.current) {
      setStageReady(true);
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-canvas-bg flex flex-col">
      <TopBar board={board} isReadOnly={isReadOnly} />
      <div className="flex-1 relative">
        <InfiniteCanvas ref={canvasRef} board={board} isReadOnly={isReadOnly} />
        {!isReadOnly && <LeftToolbar />}
        {!isReadOnly && stageReady && <FloatingToolbar stageRef={canvasRef} />}
        <Minimap />
        <EmbedUrlModal />
      </div>
      {!isReadOnly && <BottomBar />}
    </div>
  );
}
