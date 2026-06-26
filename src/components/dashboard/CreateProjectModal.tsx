import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { createProject } from '../../services/projectService';
import toast from 'react-hot-toast';

interface CreateProjectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateProjectModal({ isOpen, onOpenChange }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4262FF');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userProfile } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }

    if (!userProfile?.defaultWorkspaceId) {
      toast.error('Workspace not found');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProject(userProfile.defaultWorkspaceId, userProfile.uid, name, color);
      toast.success('Project created successfully!');
      onOpenChange(false);
      setName('');
      setColor('#4262FF');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors = ['#4262FF', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-dashboard-card rounded-2xl shadow-2xl z-50 p-6 animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-dashboard-border">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderPlus className="text-brand" />
              Create new project
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <X size={20} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q3 Marketing Campaign"
                className="w-full px-4 py-2 border border-slate-300 dark:border-dashboard-border rounded-lg bg-white dark:bg-dashboard-dark text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Project Color
              </label>
              <div className="flex gap-3">
                {colors.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-dashboard-card ring-brand' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Dialog.Close asChild>
                <button 
                  type="button"
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dashboard-dark rounded-lg transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-brand text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-brand-hover transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
