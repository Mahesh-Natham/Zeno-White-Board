import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { MoreHorizontal, Edit2, Copy, Trash2, LayoutTemplate, Star, RefreshCcw } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { updateBoard, deleteBoard, duplicateBoard, softDeleteBoard, restoreBoard, toggleStarBoard } from '../../services/boardService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function BoardList({ boards, onCreateClick }) {
  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] max-w-md mx-auto text-center border-2 border-dashed border-slate-200 dark:border-dashboard-border rounded-xl">
        <div className="w-16 h-16 bg-slate-100 dark:bg-dashboard-card rounded-full flex items-center justify-center mb-4">
          <LayoutTemplate size={24} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-medium text-slate-900 dark:text-white mb-2">No boards found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Create a new board to get started.
        </p>
        <button 
          onClick={onCreateClick}
          className="bg-brand text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-brand-hover transition-colors"
        >
          + New board
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dashboard-card rounded-lg border border-slate-200/80 dark:border-dashboard-border shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200/80 dark:border-dashboard-border bg-slate-50 dark:bg-dashboard-darker/30 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium hidden md:table-cell">Owner</th>
            <th className="px-4 py-2 font-medium hidden lg:table-cell">Last Modified</th>
            <th className="px-4 py-2 font-medium text-right w-20">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-dashboard-border">
          {boards.map(board => (
            <BoardListRow key={board.id} board={board} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BoardListRow({ board }) {
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
      if (window.confirm('Are you sure you want to permanently delete this board?')) {
        await deleteBoard(board.id);
        toast.success('Board deleted');
      }
    } else {
      await softDeleteBoard(board.id);
      toast.success('Board moved to trash');
    }
  };

  const handleRestore = async () => {
    await restoreBoard(board.id);
    toast.success('Board restored');
  };

  const handleToggleStar = async () => {
    await toggleStarBoard(board.id, board.isStarred);
  };

  const handleDuplicate = async () => {
    await duplicateBoard(board.id, currentUser.uid);
    toast.success('Board duplicated');
  };

  return (
    <tr className={`group hover:bg-slate-50/80 dark:hover:bg-dashboard-dark transition-colors ${board.isDeleted ? 'opacity-70 grayscale bg-slate-50/50 dark:bg-dashboard-dark/50' : ''}`}>
      <td className="px-4 py-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-slate-100 dark:bg-dashboard-darker rounded flex items-center justify-center shrink-0 border border-slate-200 dark:border-dashboard-border">
            {board.thumbnailUrl ? (
              <img src={board.thumbnailUrl} alt={board.title} className="w-full h-full object-cover rounded" />
            ) : (
              <LayoutTemplate className="text-slate-400 w-4 h-4" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            {isEditing && !board.isDeleted ? (
              <input
                ref={inputRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleKeyDown}
                className="text-[13px] font-medium text-slate-800 dark:text-white border-b border-brand outline-none bg-transparent"
              />
            ) : (
              <div className="flex items-center gap-1.5">
                <Link 
                  to={board.isDeleted ? '#' : `/board/${board.id}`}
                  className={`text-[13px] font-medium text-slate-800 dark:text-white truncate ${!board.isDeleted ? 'hover:text-brand dark:hover:text-brand' : 'cursor-not-allowed pointer-events-none'}`}
                >
                  {board.title}
                </Link>
                {board.isStarred && !board.isDeleted && (
                  <Star className="text-amber-400 fill-amber-400 shrink-0" size={12} />
                )}
              </div>
            )}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 block lg:hidden mt-0.5">
              {formatDistanceToNow(board.updatedAt, { addSuffix: true })}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-1.5 hidden md:table-cell">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-[9px] font-bold">
            U
          </div>
          <span className="text-[13px] text-slate-600 dark:text-slate-350">Me</span>
        </div>
      </td>
      <td className="px-4 py-1.5 hidden lg:table-cell">
        <span className="text-[13px] text-slate-600 dark:text-slate-350">
          {format(new Date(board.updatedAt), 'MMM d, yyyy')}
        </span>
      </td>
      <td className="px-4 py-1.5 text-right">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none">
              <MoreHorizontal size={15} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="min-w-[140px] bg-white dark:bg-dashboard-card rounded-md shadow-xl border border-slate-100 dark:border-dashboard-border py-1 z-50">
              {board.isDeleted ? (
                <>
                  <DropdownMenu.Item onClick={handleRestore} className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-dashboard-dark hover:text-brand">
                    <RefreshCcw size={12} /> Restore
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-slate-100 dark:bg-dashboard-border my-1" />
                  <DropdownMenu.Item onClick={handleDelete} className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 outline-none cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10">
                    <Trash2 size={12} /> Delete permanently
                  </DropdownMenu.Item>
                </>
              ) : (
                <>
                  <DropdownMenu.Item onClick={handleToggleStar} className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-dashboard-dark hover:text-brand">
                    <Star size={12} className={board.isStarred ? 'fill-amber-400 text-amber-400' : ''} /> 
                    {board.isStarred ? 'Remove Star' : 'Star Board'}
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-dashboard-dark hover:text-brand">
                    <Edit2 size={12} /> Rename
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={handleDuplicate} className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-dashboard-dark hover:text-brand">
                    <Copy size={12} /> Duplicate
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-slate-100 dark:bg-dashboard-border my-1" />
                  <DropdownMenu.Item onClick={handleDelete} className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 outline-none cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10">
                    <Trash2 size={12} /> Move to trash
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </td>
    </tr>
  );
}
