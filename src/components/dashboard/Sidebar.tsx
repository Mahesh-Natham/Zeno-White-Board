import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  Star,
  Trash2,
  Settings, 
  LogOut,
  UserPlus,
  FolderDot,
  ChevronDown,
  ChevronRight,
  Calendar
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useProjectStore from '../../store/projectStore';
import { logout } from '../../services/authService';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import InviteMembersModal from '../modals/InviteMembersModal';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function Sidebar() {
  const { userProfile } = useAuthStore();
  const { projects, activeProjectId, activeView, setActiveProject, setActiveView } = useProjectStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to log out');
    }
  };

  const NavItem = ({ view, icon: Icon, label }) => {
    const isActive = activeView === view;
    return (
      <li>
        <button 
          onClick={() => setActiveView(view)}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md font-medium text-[13px] transition-colors ${
            isActive 
              ? 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <Icon size={16} strokeWidth={1.5} className={isActive ? 'text-brand' : 'text-slate-400 dark:text-slate-500'} />
          {label}
        </button>
      </li>
    );
  };

  return (
    <div className="w-56 bg-slate-50/50 dark:bg-dashboard-dark border-r border-slate-200/80 dark:border-dashboard-border flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Header / Workspace Switcher */}
      <div className="p-3 border-b border-slate-200/80 dark:border-dashboard-border">
        <WorkspaceSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5 px-2">
          <NavItem view="all" icon={LayoutDashboard} label="All Boards" />
          <NavItem view="recent" icon={Clock} label="Recent" />
          <NavItem view="starred" icon={Star} label="Starred" />
          <NavItem view="calendar" icon={Calendar} label="Calendar" />
        </ul>

        {/* Projects Section */}
        <div className="mt-4">
          <button 
            onClick={() => setIsProjectsOpen(!isProjectsOpen)}
            className="w-full flex items-center justify-between px-4 mb-1 group"
          >
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              Projects
            </h3>
            {isProjectsOpen ? (
              <ChevronDown size={12} strokeWidth={1.5} className="text-slate-400" />
            ) : (
              <ChevronRight size={12} strokeWidth={1.5} className="text-slate-400" />
            )}
          </button>
          
          {isProjectsOpen && (
            <ul className="space-y-0.5 px-2">
              {projects.map(project => (
                <li key={project.id}>
                  <button
                    onClick={() => setActiveProject(project.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md font-medium text-[13px] transition-colors ${
                      activeView === 'project' && activeProjectId === project.id 
                        ? 'bg-white dark:bg-dashboard-card text-slate-900 dark:text-white font-semibold shadow-sm border border-slate-200/50 dark:border-dashboard-border' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <FolderDot 
                      size={14} 
                      strokeWidth={1.5}
                      style={{ color: project.color || '#4262FF' }}
                    />
                    <span className="truncate">{project.name}</span>
                  </button>
                </li>
              ))}
              {projects.length === 0 && (
                <li className="px-3 py-1.5 text-xs text-slate-400 italic">No projects yet</li>
              )}
            </ul>
          )}
        </div>

        <ul className="space-y-0.5 px-2 mt-4 border-t border-slate-200/80 dark:border-dashboard-border pt-3">
          <NavItem view="trash" icon={Trash2} label="Trash" />
        </ul>

        {/* Invite Section */}
        <div className="mt-4 px-4">
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 bg-white dark:bg-dashboard-card text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-dashboard-border py-1.5 rounded-md font-medium text-[13px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <UserPlus size={14} strokeWidth={1.5} />
            Invite people
          </button>
        </div>
      </nav>

      <InviteMembersModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={userProfile?.defaultWorkspaceId}
      />

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-200/80 dark:border-dashboard-border bg-slate-50 dark:bg-dashboard-card">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-brand flex items-center justify-center text-white font-medium text-xs shrink-0 shadow-sm">
            {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
              {userProfile?.displayName || 'User'}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
              {userProfile?.email}
            </p>
          </div>
          <Link 
            to={`/workspace/${userProfile?.defaultWorkspaceId}/settings`}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded transition-colors"
            title="Settings"
          >
            <Settings size={14} strokeWidth={1.5} />
          </Link>
          <button 
            onClick={handleLogout}
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
            title="Log out"
          >
            <LogOut size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
