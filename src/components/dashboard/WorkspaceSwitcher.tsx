import { ChevronDown, Plus } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export default function WorkspaceSwitcher() {
  const { userProfile } = useAuthStore();
  
  // In a real app, we would fetch all workspaces the user is a member of.
  // For now, we'll just display their default workspace.
  const workspaceName = userProfile?.displayName ? `${userProfile.displayName}'s Workspace` : 'My Workspace';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="w-full flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/80 p-1.5 rounded-md transition-colors outline-none text-left">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-5 h-5 rounded bg-brand flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white text-[10px] font-bold">M</span>
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[13px]">
              {workspaceName}
            </span>
          </div>
          <ChevronDown size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="w-52 bg-white dark:bg-dashboard-card rounded-md shadow-lg border border-slate-100 dark:border-dashboard-border py-1 z-50 animate-in fade-in zoom-in-95"
          align="start"
          sideOffset={6}
        >
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-dashboard-border mb-1">
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Your Workspaces</p>
          </div>
          
          <DropdownMenu.Item className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer bg-slate-50 dark:bg-dashboard-dark font-medium">
            <div className="w-4 h-4 rounded bg-brand flex items-center justify-center shrink-0">
              <span className="text-white text-[9px] font-bold">M</span>
            </div>
            <span className="truncate">{workspaceName}</span>
          </DropdownMenu.Item>
          
          <DropdownMenu.Separator className="h-px bg-slate-100 dark:bg-dashboard-border my-1" />
          
          <DropdownMenu.Item className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-dashboard-dark hover:text-slate-900 dark:hover:text-white">
            <div className="w-4 h-4 rounded border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0">
              <Plus size={10} className="text-slate-400 dark:text-slate-500" />
            </div>
            <span className="truncate">Create new workspace</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
