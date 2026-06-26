import { useEffect, useState, useMemo } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import BoardGrid from '../components/dashboard/BoardGrid';
import BoardList from '../components/dashboard/BoardList';
import ProjectGrid from '../components/dashboard/ProjectGrid';
import CreateBoardModal from '../components/dashboard/CreateBoardModal';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';
import CalendarView from '../components/dashboard/CalendarView';
import BoardFolderView from '../components/dashboard/BoardFolderView';
import useAuthStore from '../store/authStore';
import useBoardStore from '../store/boardStore';
import useProjectStore from '../store/projectStore';
import { useCalendarStore } from '../store/calendarStore';
import { getBoardsListener } from '../services/boardService';
import { getProjectsListener } from '../services/projectService';
import { getEventsListener } from '../services/calendarService';
import { Search, LayoutGrid, List as ListIcon, SlidersHorizontal, Folder } from 'lucide-react';
import ThemeToggle from '../components/dashboard/ThemeToggle';

export default function DashboardPage() {
  const { userProfile, currentUser } = useAuthStore();
  const { boards, setBoards, setLoading: setBoardsLoading, isLoading: boardsLoading } = useBoardStore();
  const { projects, setProjects, activeProjectId, activeView, setActiveProject, setLoading: setProjectsLoading, isLoading: projectsLoading } = useProjectStore();
  
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'folder'>('grid');

  useEffect(() => {
    const workspaceId = userProfile?.defaultWorkspaceId;
    if (!workspaceId) return;

    setProjectsLoading(true);
    const unsubProjects = getProjectsListener(workspaceId, (fetchedProjects) => {
      setProjects(fetchedProjects);
    });

    return () => unsubProjects();
  }, [userProfile?.defaultWorkspaceId, setProjects, setProjectsLoading]);

  useEffect(() => {
    const workspaceId = userProfile?.defaultWorkspaceId;
    if (!workspaceId) return;

    setBoardsLoading(true);
    const unsubBoards = getBoardsListener(workspaceId, (fetchedBoards) => {
      setBoards(fetchedBoards);
    });

    return () => unsubBoards();
  }, [userProfile?.defaultWorkspaceId, setBoards, setBoardsLoading]);

  const { setEvents, setLoading: setCalendarLoading, isLoading: calendarLoading } = useCalendarStore();

  useEffect(() => {
    const workspaceId = userProfile?.defaultWorkspaceId;
    if (!workspaceId) return;

    setCalendarLoading(true);
    const unsubEvents = getEventsListener(workspaceId, (fetchedEvents) => {
      setEvents(fetchedEvents);
    });

    return () => unsubEvents();
  }, [userProfile?.defaultWorkspaceId, setEvents, setCalendarLoading]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const displayedBoards = useMemo(() => {
    let filtered = boards;
    
    // 1. Filter by view
    if (activeView === 'trash') {
      filtered = filtered.filter(b => b.isDeleted);
    } else {
      filtered = filtered.filter(b => !b.isDeleted);
      
      if (activeView === 'starred') {
        filtered = filtered.filter(b => b.isStarred);
      } else if (activeView === 'recent') {
        // Just sort by updated at, maybe limit to top 10? We already sort by date in the listener.
        filtered = filtered.slice(0, 12);
      } else if (activeView === 'project') {
        filtered = filtered.filter(b => b.projectId === activeProjectId);
      }
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return filtered;
  }, [boards, activeView, activeProjectId, searchQuery]);

  const isLoading = projectsLoading || boardsLoading || calendarLoading;

  const renderHeaderTitle = () => {
    if (activeView === 'all') return 'All Boards';
    if (activeView === 'recent') return 'Recently Viewed';
    if (activeView === 'starred') return 'Starred Boards';
    if (activeView === 'calendar') return 'Calendar & Agenda';
    if (activeView === 'trash') return 'Trash';
    if (activeView === 'project' && activeProject) {
      return (
        <span className="flex items-center gap-3">
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: activeProject.color || '#4262FF' }}
          />
          {activeProject.name}
        </span>
      );
    }
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand selection:text-white bg-slate-50/30 dark:bg-dashboard-darker transition-colors duration-300">
      
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="pl-56 flex flex-col h-screen">
        {/* Top Header */}
        <header className="h-12 border-b border-slate-200/80 dark:border-dashboard-border flex items-center justify-between px-6 bg-white dark:bg-dashboard-darker sticky top-0 z-20">
          
          <div className="flex-1 flex items-center max-w-md relative">
            <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 dark:text-slate-500" />
            <input 
              type="text"
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 h-8 bg-slate-50 dark:bg-dashboard-card border border-slate-200/80 dark:border-dashboard-border rounded-md text-[13px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <ThemeToggle />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              
              <div className="flex items-center justify-between mb-5">
                <h1 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center">
                  {renderHeaderTitle()}
                </h1>

                {activeView !== 'calendar' && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 dark:bg-dashboard-card rounded-md p-0.5 border border-slate-200 dark:border-dashboard-border">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1 rounded-sm transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-dashboard-border shadow-crisp text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        title="Grid View"
                      >
                        <LayoutGrid size={14} strokeWidth={1.5} />
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-dashboard-border shadow-crisp text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        title="List View"
                      >
                        <ListIcon size={14} strokeWidth={1.5} />
                      </button>
                      <button 
                        onClick={() => setViewMode('folder')}
                        className={`p-1 rounded-sm transition-colors ${viewMode === 'folder' ? 'bg-white dark:bg-dashboard-border shadow-crisp text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        title="Folder View"
                      >
                        <Folder size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                    
                    <button className="flex items-center gap-1.5 px-2.5 h-8 text-[13px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-dashboard-card border border-slate-200 dark:border-dashboard-border rounded-md hover:bg-slate-50 dark:hover:bg-dashboard-border transition-colors">
                      <SlidersHorizontal size={14} strokeWidth={1.5} />
                      Sort
                    </button>

                    <button 
                      onClick={() => activeView === 'project' ? setIsCreateBoardOpen(true) : setIsCreateProjectOpen(true)}
                      className="bg-brand hover:bg-brand-hover text-white px-3 h-8 rounded-md font-medium text-[13px] transition-colors shadow-sm"
                    >
                      + New {activeView === 'project' ? 'Board' : 'Project'}
                    </button>
                  </div>
                )}
              </div>

              {activeView === 'calendar' ? (
                <CalendarView />
              ) : (
                <>
                  {/* View Content */}
                  {activeView === 'all' && projects.length > 0 && !searchQuery && (
                    <div className="mb-6">
                      <h2 className="text-[11px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider mb-2.5">Projects</h2>
                      <ProjectGrid 
                        projects={projects} 
                        onCreateClick={() => setIsCreateProjectOpen(true)}
                        onProjectClick={(id) => setActiveProject(id)}
                        activeProjectId={activeProjectId}
                      />
                    </div>
                  )}

                  <div>
                    {activeView === 'all' && !searchQuery && (
                      <h2 className="text-[11px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider mb-2.5">All Boards</h2>
                    )}
                    
                    {viewMode === 'grid' && (
                      <BoardGrid 
                        boards={displayedBoards} 
                        onCreateClick={() => setIsCreateBoardOpen(true)} 
                      />
                    )}
                    {viewMode === 'list' && (
                      <BoardList 
                        boards={displayedBoards} 
                        onCreateClick={() => setIsCreateBoardOpen(true)} 
                      />
                    )}
                    {viewMode === 'folder' && (
                      <BoardFolderView 
                        boards={displayedBoards}
                        projects={projects}
                        onCreateBoardClick={() => setIsCreateBoardOpen(true)}
                      />
                    )}
                  </div>

                  </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateBoardModal 
        isOpen={isCreateBoardOpen} 
        onOpenChange={setIsCreateBoardOpen} 
        projectId={activeProjectId}
      />
      
      <CreateProjectModal 
        isOpen={isCreateProjectOpen} 
        onOpenChange={setIsCreateProjectOpen} 
      />
    </div>
  );
}
