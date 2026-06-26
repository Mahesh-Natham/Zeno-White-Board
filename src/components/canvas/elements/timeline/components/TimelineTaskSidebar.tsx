import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Calendar, User, AlignLeft, Clock, Flag, AlertCircle, CheckCircle2, Diamond } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { TimelineTask } from '../types';

interface TimelineTaskSidebarProps {
  task: TimelineTask | undefined;
  updateTask: (taskId: string, updates: Partial<TimelineTask>) => void;
  onClose: () => void;
  baseDate: Date;
}

export function TimelineTaskSidebar({ task, updateTask, onClose, baseDate }: TimelineTaskSidebarProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  if (!task) return null;

  const startDate = addDays(baseDate, task.startOffset || 0);
  const endDate = addDays(startDate, Math.max(1, task.duration || 1) - 1);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value);
    if (!isNaN(newStartDate.getTime())) {
      const newOffset = differenceInDays(newStartDate, baseDate);
      if (newOffset >= 0) {
        updateTask(task.id, { startOffset: newOffset });
      }
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value);
    if (!isNaN(newEndDate.getTime())) {
      const newDuration = differenceInDays(newEndDate, startDate) + 1;
      if (newDuration > 0) {
        updateTask(task.id, { duration: newDuration });
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] pointer-events-none flex justify-end" onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-[2px] pointer-events-auto" 
      />

      {/* Sidebar Panel */}
      <motion.div 
        initial={{ x: '100%', boxShadow: '-8px 0 32px rgba(0,0,0,0)' }}
        animate={{ x: 0, boxShadow: '-8px 0 32px rgba(0,0,0,0.08)' }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-[420px] h-full bg-white flex flex-col pointer-events-auto z-10 border-l border-gray-100/50"
      >
        {/* Header */}
        <div className="flex flex-col pt-6 px-6 bg-white shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <CheckCircle2 size={18} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Task Details</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <input 
            type="text" 
            placeholder="Task Title"
            value={task.title || ''} 
            onChange={(e) => updateTask(task.id, { title: e.target.value })}
            className="text-2xl font-bold text-gray-900 outline-none border-none placeholder-gray-300 w-full mb-6 bg-transparent"
          />
          
          <div className="flex gap-6 text-[14px] font-semibold border-b border-gray-100 relative">
            <button 
              onClick={() => setActiveTab('details')}
              className={`pb-3 transition-colors relative ${activeTab === 'details' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Details
              {activeTab === 'details' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('comments')}
              className={`pb-3 transition-colors flex items-center gap-1.5 relative ${activeTab === 'comments' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Comments
              {task.comment && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
              {activeTab === 'comments' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {activeTab === 'details' ? (
            <div className="flex flex-col">
              <div className="flex flex-col py-2">
                
                {/* Status Property */}
                <div className="group flex items-center min-h-[40px] px-6 text-[13px] hover:bg-gray-50/50 transition-colors">
                  <div className="w-[120px] text-gray-500 flex items-center gap-2.5 font-medium shrink-0">
                    <CheckCircle2 size={14} className="text-gray-400" /> Status
                  </div>
                  <div className="flex-1 relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                      className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-700 hover:text-gray-900 px-2.5 py-1 -ml-2.5 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        task.status === 'not_started' ? 'bg-gray-400' :
                        task.status === 'in_progress' ? 'bg-blue-500' :
                        task.status === 'in_review' ? 'bg-purple-500' :
                        task.status === 'done' ? 'bg-green-500' :
                        task.status === 'blocked' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                      {task.status === 'not_started' ? 'Not Started' :
                       task.status === 'in_progress' ? 'In Progress' :
                       task.status === 'in_review' ? 'In Review' :
                       task.status === 'done' ? 'Done' :
                       task.status === 'blocked' ? 'Blocked' : 'Not Started'}
                    </button>
                    {openDropdown === 'status' && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 shadow-xl rounded-lg py-1.5 z-50 overflow-hidden">
                        {[
                          { val: 'not_started', label: 'Not Started', color: 'bg-gray-400' },
                          { val: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
                          { val: 'in_review', label: 'In Review', color: 'bg-purple-500' },
                          { val: 'done', label: 'Done', color: 'bg-green-500' },
                          { val: 'blocked', label: 'Blocked', color: 'bg-red-500' }
                        ].map(opt => (
                          <button key={opt.val} onClick={() => { updateTask(task.id, { status: opt.val as any }); setOpenDropdown(null); }} className="flex items-center gap-2.5 w-full text-left px-3.5 py-2 text-[13px] font-medium hover:bg-gray-50 transition-colors">
                            <span className={`w-2 h-2 rounded-full ${opt.color}`} /> {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Type/Milestone Property */}
                <div className="group flex items-center min-h-[40px] px-6 text-[13px] hover:bg-gray-50/50 transition-colors">
                  <div className="w-[120px] text-gray-500 flex items-center gap-2.5 font-medium shrink-0">
                    <Diamond size={14} className="text-gray-400" /> Type
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <button onClick={() => {
                        const isMilestone = !task.isMilestone;
                        const updates: Partial<TimelineTask> = { isMilestone };
                        if (isMilestone) updates.duration = 1;
                        updateTask(task.id, updates);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                        task.isMilestone
                          ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Diamond size={12} className={task.isMilestone ? 'text-blue-500 fill-blue-500' : 'text-gray-400'} />
                      <span>{task.isMilestone ? 'Milestone' : 'Standard Task'}</span>
                    </button>
                  </div>
                </div>

                {/* Priority Property */}
                <div className="group flex items-center min-h-[40px] px-6 text-[13px] hover:bg-gray-50/50 transition-colors">
                  <div className="w-[120px] text-gray-500 flex items-center gap-2.5 font-medium shrink-0">
                    <Flag size={14} className="text-gray-400" /> Priority
                  </div>
                  <div className="flex-1 relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === 'priority' ? null : 'priority')}
                      className="inline-flex items-center gap-2 text-[13px] font-medium px-2.5 py-1 -ml-2.5 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        task.priority === 'low' ? 'bg-blue-50 text-blue-600' :
                        task.priority === 'medium' ? 'bg-orange-50 text-orange-600' :
                        task.priority === 'high' ? 'bg-red-50 text-red-600' :
                        task.priority === 'urgent' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500'
                      }`}>
                        {task.priority || 'None'}
                      </span>
                    </button>
                    {openDropdown === 'priority' && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 shadow-xl rounded-lg py-1.5 z-50 overflow-hidden">
                        {[
                          { val: null, label: 'None', cls: 'text-gray-500 hover:bg-gray-50' },
                          { val: 'low', label: 'Low', cls: 'text-blue-600 hover:bg-blue-50' },
                          { val: 'medium', label: 'Medium', cls: 'text-orange-600 hover:bg-orange-50' },
                          { val: 'high', label: 'High', cls: 'text-red-600 hover:bg-red-50' },
                          { val: 'urgent', label: 'Urgent', cls: 'text-red-700 hover:bg-red-50 font-bold' }
                        ].map(opt => (
                          <button key={opt.val || 'none'} onClick={() => { updateTask(task.id, { priority: opt.val as any }); setOpenDropdown(null); }} className={`flex items-center w-full text-left px-3.5 py-2 text-[13px] font-medium transition-colors ${opt.cls}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignee Property */}
                <div className="group flex items-center min-h-[40px] px-6 text-[13px] hover:bg-gray-50/50 transition-colors">
                  <div className="w-[120px] text-gray-500 flex items-center gap-2.5 font-medium shrink-0">
                    <User size={14} className="text-gray-400" /> Assignees
                  </div>
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    {task.assigneeIds && task.assigneeIds.map(id => (
                      <div key={id} className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-inner shrink-0" title={id}>
                        {id.substring(0, 2).toUpperCase()}
                      </div>
                    ))}
                    <input 
                      type="text" 
                      placeholder={task.assigneeIds?.length ? "Add assignee..." : "Unassigned"}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                           const newId = e.currentTarget.value.trim();
                           updateTask(task.id, { assigneeIds: [...(task.assigneeIds || []), newId] });
                           e.currentTarget.value = '';
                        }
                      }}
                      className="w-[120px] text-[13px] font-medium text-gray-700 bg-transparent px-2 py-1 rounded-md outline-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Labels Property */}
                <div className="group flex items-center min-h-[40px] px-6 text-[13px] hover:bg-gray-50/50 transition-colors">
                  <div className="w-[120px] text-gray-500 flex items-center gap-2.5 font-medium shrink-0">
                    <Flag size={14} className="text-gray-400" /> Labels {/* Using Flag since Tag isn't imported, or we can import Tag */}
                  </div>
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    {task.labelIds && task.labelIds.map(id => (
                      <span key={id} className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-200 text-gray-700">
                        {id}
                      </span>
                    ))}
                    <input 
                      type="text" 
                      placeholder={task.labelIds?.length ? "Add label..." : "No labels"}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                           const newId = e.currentTarget.value.trim();
                           updateTask(task.id, { labelIds: [...(task.labelIds || []), newId] });
                           e.currentTarget.value = '';
                        }
                      }}
                      className="w-[120px] text-[13px] font-medium text-gray-700 bg-transparent px-2 py-1 rounded-md outline-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Dates Property */}
                <div className="group flex items-center min-h-[40px] px-6 text-[13px] hover:bg-gray-50/50 transition-colors">
                  <div className="w-[120px] text-gray-500 flex items-center gap-2.5 font-medium shrink-0">
                    <Calendar size={14} className="text-gray-400" /> {task.isMilestone ? 'Date' : 'Timeline'}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <input 
                      type="date" 
                      value={format(startDate, 'yyyy-MM-dd')}
                      onChange={handleStartDateChange}
                      className="text-[13px] font-medium text-gray-700 bg-transparent px-2 py-1 -ml-2 rounded-md outline-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer w-[120px]"
                    />
                    {!task.isMilestone && (
                      <>
                        <span className="text-gray-400">→</span>
                        <input 
                          type="date" 
                          value={format(endDate, 'yyyy-MM-dd')}
                          onChange={handleEndDateChange}
                          className="text-[13px] font-medium text-gray-700 bg-transparent px-2 py-1 rounded-md outline-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer w-[115px]"
                        />
                        <span className="text-gray-400 text-xs ml-1 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {Math.max(1, task.duration || 1)} {Math.max(1, task.duration || 1) === 1 ? 'day' : 'days'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Estimate Property */}
                {!task.isMilestone && (
                  <div className="group flex items-center min-h-[40px] px-6 text-[13px] hover:bg-gray-50/50 transition-colors">
                    <div className="w-[120px] text-gray-500 flex items-center gap-2.5 font-medium shrink-0">
                      <Clock size={14} className="text-gray-400" /> Story Points
                    </div>
                    <div className="flex-1 flex items-center">
                      <input 
                        type="number" 
                        placeholder="Empty"
                        min={0}
                        value={task.estimate || ''}
                        onChange={(e) => updateTask(task.id, { estimate: parseInt(e.target.value) || 0 })}
                        className="w-16 text-[13px] font-medium text-gray-700 bg-transparent px-2 py-1 -ml-2 rounded-md outline-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                      />
                      {(task.estimate || 0) > 0 && <span className="text-gray-400 text-xs ml-1">pts</span>}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-100 mx-6 my-4" />

              <div className="flex flex-col px-6 pb-6 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <AlignLeft size={16} className="text-gray-400" />
                  <h3 className="text-[14px] font-semibold text-gray-800">Description</h3>
                </div>
                <textarea 
                  placeholder="Add a more detailed description..."
                  value={task.description || ''}
                  onChange={(e) => updateTask(task.id, { description: e.target.value })}
                  className="w-full flex-1 min-h-[150px] text-[14px] leading-relaxed text-gray-700 bg-transparent placeholder-gray-300 outline-none resize-none"
                />

                {/* Checklists Section */}
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-gray-400" />
                      <h3 className="text-[14px] font-semibold text-gray-800">Checklists</h3>
                    </div>
                    <button onClick={() => {
                        const newChecklist = { id: `cl-${Date.now()}`, title: 'New Checklist', items: [] };
                        updateTask(task.id, { checklists: [...(task.checklists || []), newChecklist] });
                      }}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded"
                    >
                      Add Checklist
                    </button>
                  </div>
                  
                  {task.checklists?.map((cl: any) => (
                    <div key={cl.id} className="mb-4 bg-gray-50/50 rounded-lg p-3 border border-gray-100">
                      <div className="font-semibold text-gray-700 text-sm mb-2">{cl.title}</div>
                      <div className="flex flex-col gap-2">
                        {cl.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={item.isCompleted} 
                              onChange={(e) => {
                                const newChecklists = task.checklists?.map((c: any) => 
                                  c.id === cl.id ? { 
                                    ...c, 
                                    items: c.items.map((i: any) => i.id === item.id ? { ...i, isCompleted: e.target.checked } : i) 
                                  } : c
                                );
                                updateTask(task.id, { checklists: newChecklists });
                              }}
                            />
                            <span className={`text-sm ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.text}</span>
                          </div>
                        ))}
                        <input 
                          type="text"
                          placeholder="Add item..."
                          className="text-sm bg-transparent border-none outline-none text-gray-600 mt-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              const newItem = { id: `cli-${Date.now()}`, text: e.currentTarget.value.trim(), isCompleted: false };
                              const newChecklists = task.checklists?.map((c: any) => 
                                c.id === cl.id ? { ...c, items: [...(c.items || []), newItem] } : c
                              );
                              updateTask(task.id, { checklists: newChecklists });
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col h-full gap-4 pt-2 px-6 pb-6">
               <textarea 
                  autoFocus
                  placeholder="Write an update or comment..."
                  value={task.comment || ''}
                  onChange={(e) => updateTask(task.id, { comment: e.target.value })}
                  className="w-full h-40 text-[13px] text-gray-700 bg-gray-50/50 border border-gray-200 rounded-lg p-3 outline-none hover:bg-white hover:border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none shadow-sm"
               />
               <div className="flex items-start gap-2 bg-blue-50/50 text-blue-600 rounded-lg p-3 border border-blue-100">
                 <AlertCircle size={16} className="mt-0.5 shrink-0" />
                 <p className="text-[12px] font-medium leading-relaxed">Comments are automatically saved and will show as a badge on the timeline task block.</p>
               </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
