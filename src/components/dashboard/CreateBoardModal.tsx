import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, LayoutTemplate, Square, GitBranch, FileType } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useBoardStore from '../../store/boardStore';
import { createBoard } from '../../services/boardService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const TEMPLATES = [
  { id: 'blank', name: 'Blank board', icon: Square },
  { id: 'brainstorm', name: 'Brainstorming', icon: LayoutTemplate },
  { id: 'mindmap', name: 'Mind Map', icon: GitBranch },

  { id: 'flowchart', name: 'Flowchart', icon: FileType },
];

export default function CreateBoardModal({ isOpen, onOpenChange, projectId }) {
  const [boardName, setBoardName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [isCreating, setIsCreating] = useState(false);
  
  const { userProfile, currentUser } = useAuthStore();
  const { boards } = useBoardStore();
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Check limit (now 10 boards)
    if (userProfile?.plan === 'free' && boards.length >= 10) {
      toast.error('Free plan limit reached. You can only have up to 10 boards. Please upgrade to create more.', {
        duration: 5000,
        icon: '🔒'
      });
      onOpenChange(false);
      return;
    }

    if (!boardName.trim()) {
      toast.error('Please enter a board name');
      return;
    }

    setIsCreating(true);
    try {
      const workspaceId = userProfile?.defaultWorkspaceId;
      if (!workspaceId) throw new Error('No workspace found');

      const boardId = await createBoard(
        workspaceId,
        currentUser.uid,
        boardName.trim(),
        projectId || null,
        selectedTemplate !== 'blank' ? { template: selectedTemplate } : null
      );
      
      toast.success('Board created!');
      onOpenChange(false);
      navigate(`/board/${boardId}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to create board');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-dashboard-card rounded-xl shadow-2xl border border-slate-200 dark:border-dashboard-border z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dashboard-border">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
              Create a new board
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md transition-colors">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleCreate} className="p-6">
            <div className="mb-6">
              <label htmlFor="boardName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Board Name
              </label>
              <input
                id="boardName"
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="e.g., Q3 Product Roadmap"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-dashboard-border bg-white dark:bg-dashboard-dark focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-slate-900 dark:text-white"
                autoFocus
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Start from a template
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TEMPLATES.map((tmpl) => {
                  const Icon = tmpl.icon;
                  const isSelected = selectedTemplate === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl.id)}
                      className={`cursor-pointer rounded-lg border p-4 flex flex-col items-center justify-center text-center transition-all ${
                        isSelected 
                          ? 'border-brand bg-brand/5 dark:bg-brand/10 ring-1 ring-brand shadow-neon' 
                          : 'border-gray-200 dark:border-dashboard-border hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-dashboard-dark hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon 
                        size={32} 
                        strokeWidth={1.5}
                        className={`mb-3 transition-colors ${isSelected ? 'text-brand' : 'text-slate-400 dark:text-slate-500'}`} 
                      />
                      <span className={`text-sm font-medium transition-colors ${isSelected ? 'text-brand dark:text-brand' : 'text-slate-700 dark:text-slate-300'}`}>
                        {tmpl.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dashboard-border">
              <Dialog.Close asChild>
                <button type="button" className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-dashboard-dark rounded-lg transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isCreating || !boardName.trim()}
                className="px-5 py-2.5 text-sm font-medium bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 shadow-sm"
              >
                {isCreating ? 'Creating...' : 'Create board'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
