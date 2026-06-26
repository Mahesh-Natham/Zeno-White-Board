import { FolderPlus } from 'lucide-react';
import { Project } from '../../services/projectService';
import ProjectCard from './ProjectCard';
import { motion } from 'framer-motion';

interface ProjectGridProps {
  projects: Project[];
  onCreateClick: () => void;
  onProjectClick: (projectId: string) => void;
  activeProjectId: string | null;
}

export default function ProjectGrid({ projects, onCreateClick, onProjectClick, activeProjectId }: ProjectGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-6"
    >
      {/* Create New Project Card */}
      <motion.div 
        variants={item}
        onClick={onCreateClick}
        className="group flex flex-col items-center justify-center bg-slate-50/50 dark:bg-dashboard-darker/50 rounded-lg border-2 border-dashed border-slate-200/60 dark:border-dashboard-border hover:border-brand/60 hover:bg-brand/5 dark:hover:bg-brand/10 cursor-pointer transition-all min-h-[110px] p-3"
      >
        <div className="w-7 h-7 bg-white dark:bg-dashboard-card rounded border border-slate-200 dark:border-dashboard-border shadow-sm flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
          <FolderPlus className="text-brand" size={14} />
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-brand transition-colors">New Project</span>
      </motion.div>

      {projects.map((project) => (
        <motion.div key={project.id} variants={item}>
          <ProjectCard 
            project={project} 
            onClick={() => onProjectClick(project.id)}
            isActive={activeProjectId === project.id}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
