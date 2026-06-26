import { Folder } from 'lucide-react';
import { Project } from '../../services/projectService';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  isActive?: boolean;
}

export default function ProjectCard({ project, onClick, isActive }: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative group cursor-pointer overflow-hidden rounded-lg border transition-all duration-300 ${isActive ? 'border-brand ring-1 ring-brand bg-brand/5 dark:bg-brand/10' : 'border-slate-200 dark:border-dashboard-border bg-white dark:bg-dashboard-card hover:border-slate-350 dark:hover:border-slate-700'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-3.5 flex flex-col h-full relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div 
            className="w-7 h-7 rounded flex items-center justify-center shadow-sm"
            style={{ backgroundColor: `${project.color || '#4262FF'}15`, color: project.color || '#4262FF' }}
          >
            <Folder size={15} />
          </div>
        </div>
        
        <h3 className="font-semibold text-[13px] text-slate-800 dark:text-white truncate mb-0.5">
          {project.name}
        </h3>
        
        <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-dashboard-border">
          <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
}
