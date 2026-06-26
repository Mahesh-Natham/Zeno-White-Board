import { useState } from 'react';
import { ArrowLeft, Download, Share2, Grid, Undo2, Redo2, Play, Video, Timer, MessageSquare, Cloud, CloudUpload, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import useCollaborationStore from '../../store/collaborationStore';
import useCanvasStore from '../../store/canvasStore';
import useUiStore from '../../store/uiStore';
import ShareBoardModal from '../modals/ShareBoardModal';
import SettingsModal from '../modals/SettingsModal';
import { updateBoard } from '../../services/boardService';

export default function TopBar({ board, isReadOnly }) {
  const [boardName, setBoardName] = useState(board?.title || 'Untitled Board');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { onlineUsers } = useCollaborationStore();
  const { historyStep, history, undo, redo, snapToGrid, toggleSnapToGrid } = useCanvasStore();
  const { syncStatus } = useUiStore();

  const handleNameChange = async () => {
    if (!board || board.title === boardName || isReadOnly) return;
    
    try {
      await updateBoard(board.id, { title: boardName });
    } catch (error) {
      console.error("Failed to update board name:", error);
      setBoardName(board.title);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  // Show up to 4 avatars, then +N
  const visibleUsers = onlineUsers.slice(0, 4);
  const hiddenCount = Math.max(0, onlineUsers.length - 4);

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-10">
      
      {/* Left side info */}
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-md shadow-floating pointer-events-auto">
        <Link 
          to="/dashboard" 
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          title="Back to dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <input 
          type="text"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          onBlur={handleNameChange}
          onKeyDown={handleKeyDown}
          disabled={isReadOnly}
          className="text-sm font-semibold text-gray-900 bg-transparent border-none outline-none hover:bg-gray-50 focus:bg-gray-100 rounded-md px-3 py-1 max-w-[200px] truncate transition-colors disabled:bg-transparent"
        />
        {isReadOnly ? (
          <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-1 rounded-md ml-1">
            View Only
          </span>
        ) : (
          <div className="flex items-center ml-2">
            {syncStatus === 'saving' && (
              <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                <CloudUpload className="w-4 h-4 animate-pulse" />
                <span>Saving...</span>
              </div>
            )}
            {syncStatus === 'saved' && (
              <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved</span>
              </div>
            )}
            {syncStatus === 'idle' && (
              <div className="flex items-center gap-1 text-xs font-medium text-gray-400" title="All changes saved to cloud">
                <Cloud className="w-4 h-4" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {!isReadOnly && (
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-md shadow-floating">
            <button 
              onClick={toggleSnapToGrid}
              className={`p-1.5 rounded-md transition-colors ${snapToGrid ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Snap to Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-gray-200 mx-0.5" />
            <button 
              onClick={undo}
              disabled={historyStep < 0}
              className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button 
              onClick={redo}
              disabled={historyStep >= history.length - 1}
              className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-md shadow-floating">
          <button className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors" title="Meeting Tools">
            <Timer className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors" title="Comments">
            <MessageSquare className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors" title="Video Chat">
            <Video className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <div className="flex -space-x-2 px-1">
            {visibleUsers.map(user => (
              <div 
                key={user.id}
                className="w-6 h-6 rounded-md border border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                style={{ backgroundColor: user.color || '#3b82f6' }}
                title={user.displayName}
              >
                {user.displayName?.charAt(0).toUpperCase()}
              </div>
            ))}
            {hiddenCount > 0 && (
              <div className="w-6 h-6 rounded-md border border-white flex items-center justify-center text-[10px] font-bold text-gray-600 bg-gray-100 shadow-sm">
                +{hiddenCount}
              </div>
            )}
          </div>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <button className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors" title="Present">
            <Play className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors" title="Export">
            <Download className="w-4 h-4" />
          </button>
        </div>
        
        <button 
          onClick={() => setIsSettingsModalOpen(true)}
          className="p-1.5 bg-white/90 backdrop-blur-md rounded-md text-gray-600 hover:bg-gray-100 shadow-floating transition-colors"
          title="Settings & Shortcuts"
        >
          <div className="w-4 h-4 flex items-center justify-center">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </div>
        </button>

        <button 
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-2 bg-brand text-white px-4 py-1.5 rounded-md shadow-floating hover:bg-brand-hover transition-all font-medium text-sm"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      <ShareBoardModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        board={board} 
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
