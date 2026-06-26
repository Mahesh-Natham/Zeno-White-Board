import { create } from 'zustand';
import { Project } from '../services/projectService';

export type DashboardView = 'all' | 'recent' | 'starred' | 'calendar' | 'trash' | 'project';

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  activeView: DashboardView;
  isLoading: boolean;
  setProjects: (projects: Project[]) => void;
  setActiveProject: (projectId: string | null) => void;
  setActiveView: (view: DashboardView) => void;
  setLoading: (loading: boolean) => void;
}

const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  activeProjectId: null,
  activeView: 'all',
  isLoading: true,
  setProjects: (projects) => set({ projects, isLoading: false }),
  setActiveProject: (activeProjectId) => set({ activeProjectId, activeView: 'project' }),
  setActiveView: (activeView) => set({ activeView, activeProjectId: activeView === 'project' ? useProjectStore.getState().activeProjectId : null }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useProjectStore;
