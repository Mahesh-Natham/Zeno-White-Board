import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  Folder, 
  ChevronDown, 
  ChevronRight, 
  LayoutTemplate, 
  Star, 
  Trash2, 
  Plus,
  ArrowUpRight 
} from 'lucide-react';
import { toggleStarBoard, softDeleteBoard } from '../../services/boardService';
import toast from 'react-hot-toast';
import { Project } from '../../services/projectService';
import { Board } from '../../types';

interface BoardFolderViewProps {
  boards: Board[];
  projects: Project[];
  onCreateBoardClick: () => void;
}

export default function BoardFolderView({ boards, projects, onCreateBoardClick }: BoardFolderViewProps) {
  // Store expanded states of folders
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
    // Expand first few folders by default
    const initial: Record<string, boolean> = { unassigned: true };
    projects.forEach(p => {
      initial[p.id] = true;
    });
    return initial;
  });

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // Group boards by project
  const boardsByProject = (boards || []).reduce((acc, board) => {
    if (!board) return acc;
    const pId = board.projectId || 'unassigned';
    if (!acc[pId]) acc[pId] = [];
    acc[pId].push(board);
    return acc;
  }, {} as Record<string, Board[]>);

  const handleToggleStar = async (boardId: string, isStarred: boolean) => {
    try {
      await toggleStarBoard(boardId, isStarred);
      toast.success(isStarred ? 'Removed star' : 'Starred board');
    } catch (e) {
      toast.error('Failed to toggle star');
    }
  };

  const handleSoftDelete = async (boardId: string) => {
    try {
      await softDeleteBoard(boardId);
      toast.success('Moved board to trash');
    } catch (e) {
      toast.error('Failed to delete board');
    }
  };

  const renderBoardRow = (board: Board) => {
    return (
      <div 
        key={board.id} 
        className="flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded transition-colors group text-xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 bg-slate-100 dark:bg-dashboard-darker rounded flex items-center justify-center shrink-0 border border-slate-200 dark:border-dashboard-border">
            {board.thumbnail ? (
              <img src={board.thumbnail} alt={board.title} className="w-full h-full object-cover rounded" />
            ) : (
              <LayoutTemplate className="text-slate-400 w-3.5 h-3.5" strokeWidth={1.5} />
            )}
          </div>
          <Link 
            to={`/board/${board.id}`}
            className="font-medium text-slate-700 dark:text-slate-200 hover:text-brand dark:hover:text-brand truncate flex items-center gap-1"
          >
            {board.title}
            <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 text-slate-400" />
          </Link>
          {board.isStarred && (
            <Star className="text-amber-400 fill-amber-400 shrink-0" size={11} />
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            Updated {formatDistanceToNow(board.updatedAt, { addSuffix: true })}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => handleToggleStar(board.id, !!board.isStarred)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded"
              title={board.isStarred ? "Unstar" : "Star"}
            >
              <Star size={12} className={board.isStarred ? 'fill-amber-400 text-amber-400' : ''} />
            </button>
            <button 
              onClick={() => handleSoftDelete(board.id)}
              className="p-1 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded"
              title="Move to trash"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFolderSection = (folderId: string, folderName: string, folderColor?: string) => {
    const folderBoards = boardsByProject[folderId] || [];
    const isExpanded = !!expandedFolders[folderId];
    
    return (
      <div key={folderId} className="border border-slate-250/60 dark:border-dashboard-border rounded-lg overflow-hidden bg-white dark:bg-dashboard-card shadow-sm">
        {/* Accordion Header */}
        <div 
          onClick={() => toggleFolder(folderId)}
          className="flex items-center justify-between px-4 py-2 bg-slate-50/50 dark:bg-dashboard-darker/20 cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-dashboard-darker/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
            <Folder 
              size={14} 
              style={{ color: folderColor || '#94a3b8' }} 
              className={folderColor ? '' : 'text-slate-400 dark:text-slate-500'} 
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {folderName}
            </span>
            <span className="text-[10px] bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold">
              {folderBoards.length}
            </span>
          </div>
          
          {folderId !== 'unassigned' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onCreateBoardClick();
              }}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand rounded transition-colors"
              title="Add board to this project"
            >
              <Plus size={13} />
            </button>
          )}
        </div>

        {/* Accordion Content */}
        {isExpanded && (
          <div className="p-2 border-t border-slate-100 dark:border-dashboard-border space-y-1 bg-white dark:bg-dashboard-card">
            {folderBoards.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 italic">
                No boards in this project
              </div>
            ) : (
              folderBoards.map(board => renderBoardRow(board))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Group folders */}
      {projects.map(project => 
        renderFolderSection(project.id, project.name, project.color)
      )}

      {/* Unassigned Boards section */}
      {(boardsByProject['unassigned']?.length > 0 || projects.length === 0) && 
        renderFolderSection('unassigned', 'Unassigned Boards', undefined)
      }
    </div>
  );
}
