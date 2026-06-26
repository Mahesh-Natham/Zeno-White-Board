import { LayoutTemplate } from 'lucide-react';
import BoardCard from './BoardCard';
import { motion } from 'framer-motion';

export default function BoardGrid({ boards, onCreateClick }) {
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

  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] max-w-md mx-auto text-center border-2 border-dashed border-slate-200 dark:border-dashboard-border rounded-xl bg-slate-50 dark:bg-dashboard-card/30">
        <div className="w-16 h-16 bg-slate-100 dark:bg-dashboard-card rounded-full flex items-center justify-center mb-4">
          <LayoutTemplate size={24} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-medium text-slate-900 dark:text-white mb-2">No boards found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Create a new board to get started.
        </p>
        <button 
          onClick={onCreateClick}
          className="bg-brand text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-brand-hover transition-colors shadow-sm"
        >
          + New board
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
    >
      {/* Always show a "Create New" card as the first item */}
      <motion.div 
        variants={item}
        onClick={onCreateClick}
        className="group flex flex-col items-center justify-center bg-slate-50/50 dark:bg-dashboard-darker/50 rounded-lg border-2 border-dashed border-slate-200/60 dark:border-dashboard-border hover:border-brand/60 hover:bg-brand/5 dark:hover:bg-brand/10 cursor-pointer transition-all aspect-[16/10]"
      >
        <div className="w-8 h-8 bg-white dark:bg-dashboard-card rounded border border-slate-200 dark:border-dashboard-border shadow-sm flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
          <span className="text-brand text-lg font-medium leading-none">+</span>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-brand transition-colors">New board</span>
      </motion.div>

      {boards.map((board) => (
        <motion.div key={board.id} variants={item}>
          <BoardCard board={board} />
        </motion.div>
      ))}
    </motion.div>
  );
}
