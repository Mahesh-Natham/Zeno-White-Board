import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Edit2, Copy, Trash2, LayoutTemplate, Star, RefreshCcw } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { updateBoard, deleteBoard, duplicateBoard, softDeleteBoard, restoreBoard, toggleStarBoard } from '../../services/boardService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function BoardCard({ board }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(board.title);
  const inputRef = useRef(null);
  const { currentUser } = useAuthStore();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRenameSubmit = async () => {
    if (editTitle.trim() === '') {
      setEditTitle(board.title);
      setIsEditing(false);
      return;
    }

    if (editTitle.trim() !== board.title) {
      try {
        await updateBoard(board.id, { title: editTitle.trim() });
        toast.success('Board renamed');
      } catch (error) {
        console.error(error);
        toast.error('Failed to rename board');
        setEditTitle(board.title);
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') {
      setEditTitle(board.title);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (board.isDeleted) {
      if (window.confirm('Are you sure you want to permanently delete this board? This cannot be undone.')) {
        try {
          await deleteBoard(board.id);
          toast.success('Board permanently deleted');
        } catch (error) {
          console.error(error);
          toast.error('Failed to delete board');
        }
      }
    } else {
      try {
        await softDeleteBoard(board.id);
        toast.success('Board moved to trash');
      } catch (error) {
        console.error(error);
        toast.error('Failed to move to trash');
      }
    }
  };

  const handleRestore = async () => {
    try {
      await restoreBoard(board.id);
      toast.success('Board restored');
    } catch (error) {
      console.error(error);
      toast.error('Failed to restore board');
    }
  };

  const handleToggleStar = async () => {
    try {
      await toggleStarBoard(board.id, board.isStarred);
      if (board.isStarred) {
        toast.success('Removed from starred');
      } else {
        toast.success('Added to starred');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update star');
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateBoard(board.id, currentUser.uid);
      toast.success('Board duplicated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to duplicate board');
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={`group flex flex-col bg-white dark:bg-dashboard-card rounded-lg border border-slate-200/80 dark:border-dashboard-border shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all overflow-hidden relative ${board.isDeleted ? 'opacity-70 grayscale' : ''}`}
    >
      {/* Thumbnail Area */}
      <Link 
        to={board.isDeleted ? '#' : `/board/${board.id}`}
        className={`w-full aspect-[16/10] bg-slate-50 dark:bg-dashboard-darker border-b border-slate-100 dark:border-dashboard-border flex items-center justify-center p-2.5 relative overflow-hidden ${board.isDeleted ? 'cursor-not-allowed pointer-events-none' : ''}`}
      >
        {board.thumbnailUrl ? (
          <img src={board.thumbnailUrl} alt={board.title} className="w-full h-full object-cover rounded shadow-sm" />
        ) : (
          <div className="w-full h-full bg-white dark:bg-dashboard-card rounded shadow-sm border border-slate-100 dark:border-dashboard-border flex items-center justify-center">
            <LayoutTemplate className="text-slate-300 dark:text-slate-600 w-8 h-8" />
          </div>
        )}
        
        {/* Overlay gradient on hover */}
        {!board.isDeleted && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </Link>

      {/* Info Area */}
      <div className="p-2.5 bg-white dark:bg-dashboard-card flex items-start justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          {isEditing && !board.isDeleted ? (
            <input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              className="w-full text-[13px] font-semibold text-slate-850 dark:text-white border-b-2 border-brand outline-none bg-transparent mb-0.5"
            />
          ) : (
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 
                className={`text-[13px] font-semibold text-slate-800 dark:text-white truncate transition-colors ${!board.isDeleted ? 'cursor-text hover:text-brand dark:hover:text-brand' : ''}`}
                onDoubleClick={() => !board.isDeleted && setIsEditing(true)}
                title={!board.isDeleted ? "Double-click to rename" : ""}
              >
                {board.title}
              </h3>
              {board.isStarred && !board.isDeleted && (
                <Star className="text-amber-400 fill-amber-400 shrink-0" size={12} />
              )}
            </div>
          )}
          
          <p className="text-[10px] text-slate-400 dark:text-slate-550">
            Edited {formatDistanceToNow(board.updatedAt, { addSuffix: true })}
          </p>
        </div>

        {/* Options Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none">
              <MoreHorizontal size={16} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              className="min-w-[160px] bg-white dark:bg-dashboard-card rounded-lg shadow-xl border border-slate-100 dark:border-dashboard-border py-1 z-50 animate-in fade-in zoom-in-95" 
              align="end"
              sideOffset={5}
            >
              {board.isDeleted ? (
                <>
                  <DropdownMenu.Item 
                    onClick={handleRestore}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-dashboard-dark hover:text-brand dark:hover:text-brand"
                  >
                    <RefreshCcw size={14} /> Restore
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-slate-100 dark:bg-dashboard-border my-1" />
                  <DropdownMenu.Item 
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 outline-none cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Trash2 size={14} /> Delete permanently
                  </DropdownMenu.Item>
                </>
              ) : (
                <>
                  <DropdownMenu.Item 
                    onClick={handleToggleStar}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-dashboard-dark hover:text-brand dark:hover:text-brand"
                  >
                    <Star size={14} className={board.isStarred ? 'fill-amber-400 text-amber-400' : ''} /> 
                    {board.isStarred ? 'Remove Star' : 'Star Board'}
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-dashboard-dark hover:text-brand dark:hover:text-brand"
                  >
                    <Edit2 size={14} /> Rename
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    onClick={handleDuplicate}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-dashboard-dark hover:text-brand dark:hover:text-brand"
                  >
                    <Copy size={14} /> Duplicate
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-slate-100 dark:bg-dashboard-border my-1" />
                  <DropdownMenu.Item 
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 outline-none cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Trash2 size={14} /> Move to trash
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </motion.div>
  );
}
