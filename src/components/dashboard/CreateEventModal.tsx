import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Calendar, Clock, AlignLeft, Folder, LayoutTemplate } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useProjectStore from '../../store/projectStore';
import useBoardStore from '../../store/boardStore';
import { createEvent } from '../../services/calendarService';
import toast from 'react-hot-toast';

interface CreateEventModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string; // YYYY-MM-DD
}

export default function CreateEventModal({ isOpen, onOpenChange, defaultDate }: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const { userProfile, currentUser } = useAuthStore();
  const { projects } = useProjectStore();
  const { boards } = useBoardStore();

  useEffect(() => {
    if (defaultDate) {
      setDate(defaultDate);
    }
  }, [defaultDate]);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setTime('10:00');
      setSelectedProjectId('');
      setSelectedBoardId('');
    }
  }, [isOpen, defaultDate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsCreating(true);
    try {
      const workspaceId = userProfile?.defaultWorkspaceId;
      if (!workspaceId) throw new Error('No active workspace');
      if (!currentUser) throw new Error('No logged in user');

      await createEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        time: time || undefined,
        workspaceId,
        ownerId: currentUser.uid,
        projectId: selectedProjectId || null,
        boardId: selectedBoardId || null,
      });

      toast.success('Reminder added to calendar');
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to add calendar event');
    } finally {
      setIsCreating(false);
    }
  };

  // Filter boards based on selected project
  const filteredBoards = selectedProjectId
    ? boards.filter(b => b.projectId === selectedProjectId && !b.isDeleted)
    : boards.filter(b => !b.isDeleted);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-dashboard-card rounded-lg shadow-xl border border-slate-200/80 dark:border-dashboard-border z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-dashboard-border">
            <Dialog.Title className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Calendar size={16} className="text-brand" strokeWidth={1.5} />
              Add Event & Reminder
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors">
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleCreate} className="p-4 space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="eventTitle" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Title
              </label>
              <input
                id="eventTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs doing?"
                className="w-full px-3 py-1.5 text-[13px] rounded border border-slate-200 dark:border-dashboard-border bg-white dark:bg-dashboard-dark focus:outline-none focus:ring-1 focus:ring-brand focus:border-transparent text-slate-800 dark:text-white transition-all"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="eventDescription" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Description (Optional)
              </label>
              <div className="relative flex items-start">
                <AlignLeft className="absolute left-2.5 top-2 text-slate-400" size={14} />
                <textarea
                  id="eventDescription"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add notes, links, or task list..."
                  className="w-full pl-8 pr-3 py-1.5 text-[13px] rounded border border-slate-200 dark:border-dashboard-border bg-white dark:bg-dashboard-dark focus:outline-none focus:ring-1 focus:ring-brand focus:border-transparent text-slate-800 dark:text-white transition-all resize-none"
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="eventDate" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                  <input
                    id="eventDate"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 text-[13px] rounded border border-slate-200 dark:border-dashboard-border bg-white dark:bg-dashboard-dark focus:outline-none focus:ring-1 focus:ring-brand focus:border-transparent text-slate-800 dark:text-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="eventTime" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                  <input
                    id="eventTime"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 text-[13px] rounded border border-slate-200 dark:border-dashboard-border bg-white dark:bg-dashboard-dark focus:outline-none focus:ring-1 focus:ring-brand focus:border-transparent text-slate-800 dark:text-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Linking Options */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-dashboard-border/50">
              <div>
                <label htmlFor="eventProject" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                  <Folder size={12} className="text-slate-400" />
                  Link Project
                </label>
                <select
                  id="eventProject"
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    setSelectedBoardId(''); // Reset board when project changes
                  }}
                  className="w-full px-2.5 py-1.5 text-[13px] rounded border border-slate-200 dark:border-dashboard-border bg-white dark:bg-dashboard-dark text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand transition-all cursor-pointer"
                >
                  <option value="">None</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="eventBoard" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                  <LayoutTemplate size={12} className="text-slate-400" />
                  Link Board
                </label>
                <select
                  id="eventBoard"
                  value={selectedBoardId}
                  onChange={(e) => setSelectedBoardId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-[13px] rounded border border-slate-200 dark:border-dashboard-border bg-white dark:bg-dashboard-dark text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand transition-all cursor-pointer"
                >
                  <option value="">None</option>
                  {filteredBoards.map(b => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dashboard-border">
              <Dialog.Close asChild>
                <button type="button" className="px-3.5 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dashboard-dark rounded transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isCreating || !title.trim()}
                className="px-3.5 py-1.5 text-xs font-medium bg-brand hover:bg-brand-hover text-white rounded transition-colors disabled:opacity-50 shadow-sm"
              >
                {isCreating ? 'Adding...' : 'Add event'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
