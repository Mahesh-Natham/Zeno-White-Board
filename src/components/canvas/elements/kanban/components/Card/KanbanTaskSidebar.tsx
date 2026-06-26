import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, AlignLeft, Clock, Flag, CheckCircle2, AlertCircle, Calendar, Diamond } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { KanbanData } from '../../types';
import { useKanbanUIStore } from '../../store';
import { useKanbanCardDetail } from '../../hooks/useKanbanCardDetail';
import { MOCK_USERS } from '../../utils';

interface KanbanTaskSidebarProps {
  data: KanbanData;
  onUpdateData: (updates: Partial<KanbanData>) => void;
  isReadOnly: boolean;
}

export function KanbanTaskSidebar({ data, onUpdateData, isReadOnly }: KanbanTaskSidebarProps) {
  const { openCardId, setOpenCardId } = useKanbanUIStore();
  const card = data.cards.find(c => c.id === openCardId);

  const [activeTab, setActiveTab] = useState('details');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const detailState = useKanbanCardDetail({ card, openCardId, setOpenCardId, data, onUpdateData });
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openCardId) {
        detailState.actions.saveCardChanges();
        detailState.actions.handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCardId, detailState.actions]);

  if (!openCardId || !card) return null;

  const {
    formState: { title, description, priority, estimationPoints, assigneeIds, labelIds, checklists, startDate, dueDate, isMilestone },
    setters: { setTitle, setDescription, setPriority, setEstimationPoints, setStartDate, setDueDate, setIsMilestone },
    actions: { handleClose, saveCardChanges, toggleAssignee, toggleChecklistItem, handleAddChecklist, handleAddChecklistItem }
  } = detailState;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] pointer-events-none flex justify-end" onWheel={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/20 backdrop-blur-[2px] pointer-events-auto" 
          onPointerDown={() => { saveCardChanges(); handleClose(); }} 
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
                <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Kanban Task Details</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <input 
              type="text" 
              placeholder="Task Title"
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveCardChanges}
              disabled={isReadOnly}
              className="text-2xl font-bold text-gray-900 outline-none border-none placeholder-gray-300 w-full mb-6 bg-transparent"
            />
            
            <div className="flex gap-6 text-[14px] font-semibold border-b border-gray-100 relative">
              <button 
                className={`pb-3 transition-colors relative ${activeTab === 'details' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Details
                {activeTab === 'details' && <motion.div layoutId="kanbanActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />}
              </button>
              <button 
                className={`pb-3 transition-colors flex items-center gap-1.5 relative ${activeTab === 'comments' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Comments
                {card.comment && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                {activeTab === 'comments' && <motion.div layoutId="kanbanActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            {activeTab === 'details' ? (
              <div className="flex flex-col">
                <div className="flex flex-col py-2">
                  
                  {/* Status Property (Mapped to List) */}
                  <div className="group flex items-center min-h-[40px] px-6 text-[13px] hover:bg-gray-50/50 transition-colors">
                    <div className="w-[120px] text-gray-500 flex items-center gap-2.5 font-medium shrink-0">
                      <CheckCircle2 size={14} className="text-gray-400" /> List
                    </div>
                    <div className="flex-1 relative text-[13px] font-medium text-gray-700">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                        {data.columns.find(c => c.id === card.columnId)?.title || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  {/* Type/Milestone Property */}
                  <div className="group flex items-center min-h-[40px] px-6 text-[13px] hover:bg-gray-50/50 transition-colors">
                    <div className="w-[120px] text-gray-500 flex items-center gap-2.5 font-medium shrink-0">
                      <Diamond size={14} className="text-gray-400" /> Type
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <button
                        onClick={() => setIsMilestone(!isMilestone)}
                        disabled={isReadOnly}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                          isMilestone
                            ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <Diamond size={12} className={isMilestone ? 'text-blue-500 fill-blue-500' : 'text-gray-400'} />
                        <span>{isMilestone ? 'Milestone' : 'Standard Task'}</span>
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
                        disabled={isReadOnly}
                        className="inline-flex items-center gap-2 text-[13px] font-medium px-2.5 py-1 -ml-2.5 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          priority === 'low' ? 'bg-blue-50 text-blue-600' :
                          priority === 'medium' ? 'bg-orange-50 text-orange-600' :
                          priority === 'high' ? 'bg-red-50 text-red-600' :
                          priority === 'critical' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500'
                        }`}>
                          {priority && priority !== 'none' ? priority : 'None'}
                        </span>
                      </button>
                      {openDropdown === 'priority' && !isReadOnly && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 shadow-xl rounded-lg py-1.5 z-50 overflow-hidden">
                          {[
                            { val: 'none', label: 'None', cls: 'text-gray-500 hover:bg-gray-50' },
                            { val: 'low', label: 'Low', cls: 'text-blue-600 hover:bg-blue-50' },
                            { val: 'medium', label: 'Medium', cls: 'text-orange-600 hover:bg-orange-50' },
                            { val: 'high', label: 'High', cls: 'text-red-600 hover:bg-red-50' },
                            { val: 'critical', label: 'Critical', cls: 'text-red-700 hover:bg-red-50 font-bold' }
                          ].map(opt => (
                            <button key={opt.val} onClick={() => {}} className={`flex items-center w-full text-left px-3.5 py-2 text-[13px] font-medium transition-colors ${opt.cls}`}>
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
                      {assigneeIds && assigneeIds.map((id: string) => (
                        <div key={id} className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-inner shrink-0" title={id}>
                          {id.substring(0, 2).toUpperCase()}
                        </div>
                      ))}
                      {!isReadOnly && (
                        <input 
                          type="text" 
                          placeholder={assigneeIds?.length ? "Add assignee..." : "Unassigned"}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                               const newId = e.currentTarget.value.trim();
                               toggleAssignee(newId);
                               setTimeout(saveCardChanges, 0);
                               e.currentTarget.value = '';
                            }
                          }}
                          className="w-[120px] text-[13px] font-medium text-gray-700 bg-transparent px-2 py-1 rounded-md outline-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                        />
                      )}
                    </div>
                  </div>

                  {/* Labels Property */}
                  <div className="group flex items-center min-h-[40px] px-6 text-[13px] hover:bg-gray-50/50 transition-colors">
                    <div className="w-[120px] text-gray-500 flex items-center gap-2.5 font-medium shrink-0">
                      <Flag size={14} className="text-gray-400" /> Labels
                    </div>
                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      {labelIds && labelIds.map((id: string) => (
                        <span key={id} className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-200 text-gray-700">
                          {id}
                        </span>
                      ))}
                      {!isReadOnly && (
                        <input 
                          type="text" 
                          placeholder={labelIds?.length ? "Add label..." : "No labels"}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                               const newId = e.currentTarget.value.trim();
                               detailState.actions.toggleLabel(newId);
                               setTimeout(saveCardChanges, 0);
                               e.currentTarget.value = '';
                            }
                          }}
                          className="w-[120px] text-[13px] font-medium text-gray-700 bg-transparent px-2 py-1 rounded-md outline-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                        />
                      )}
                    </div>
                  </div>

                  {/* Dates Property */}
                  <div className="group flex items-center min-h-[40px] px-6 text-[13px] hover:bg-gray-50/50 transition-colors">
                    <div className="w-[120px] text-gray-500 flex items-center gap-2.5 font-medium shrink-0">
                      <Calendar size={14} className="text-gray-400" /> {isMilestone ? 'Date' : 'Timeline'}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <input 
                        type="date" 
                        value={startDate || ''}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setTimeout(saveCardChanges, 0);
                        }}
                        disabled={isReadOnly}
                        className="text-[13px] font-medium text-gray-700 bg-transparent px-2 py-1 -ml-2 rounded-md outline-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer w-[120px]"
                      />
                      {!isMilestone && (
                        <>
                          <span className="text-gray-400">→</span>
                          <input 
                            type="date" 
                            value={dueDate || ''}
                            onChange={(e) => {
                              setDueDate(e.target.value);
                              setTimeout(saveCardChanges, 0);
                            }}
                            disabled={isReadOnly}
                            className="text-[13px] font-medium text-gray-700 bg-transparent px-2 py-1 rounded-md outline-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer w-[115px]"
                          />
                          {startDate && dueDate && !isNaN(new Date(startDate).getTime()) && !isNaN(new Date(dueDate).getTime()) && (
                            <span className="text-gray-400 text-xs ml-1 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {Math.max(1, differenceInDays(new Date(dueDate), new Date(startDate)) + 1)} days
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Estimate Property */}
                  {!isMilestone && (
                    <div className="group flex items-center min-h-[40px] px-6 text-[13px] hover:bg-gray-50/50 transition-colors">
                      <div className="w-[120px] text-gray-500 flex items-center gap-2.5 font-medium shrink-0">
                        <Clock size={14} className="text-gray-400" /> Story Points
                      </div>
                      <div className="flex-1 flex items-center">
                        <input 
                          type="number" 
                          placeholder="Empty"
                          min={0}
                          value={estimationPoints || ''}
                          onChange={(e) => setEstimationPoints(parseFloat(e.target.value) || undefined)}
                          onBlur={saveCardChanges}
                          disabled={isReadOnly}
                          className="w-16 text-[13px] font-medium text-gray-700 bg-transparent px-2 py-1 -ml-2 rounded-md outline-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                        />
                        {(estimationPoints || 0) > 0 && <span className="text-gray-400 text-xs ml-1">pts</span>}
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={saveCardChanges}
                    disabled={isReadOnly}
                    className="w-full flex-1 min-h-[150px] text-[14px] leading-relaxed text-gray-700 bg-transparent placeholder-gray-300 outline-none resize-none"
                  />

                  {/* Checklists Section */}
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-gray-400" />
                        <h3 className="text-[14px] font-semibold text-gray-800">Checklists</h3>
                      </div>
                      {!isReadOnly && (
                        <button
                          onClick={() => {}}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded"
                        >
                          Add Checklist
                        </button>
                      )}
                    </div>
                    
                    {checklists?.map((cl: any) => (
                      <div key={cl.id} className="mb-4 bg-gray-50/50 rounded-lg p-3 border border-gray-100">
                        <div className="font-semibold text-gray-700 text-sm mb-2">{cl.title}</div>
                        <div className="flex flex-col gap-2">
                          {cl.items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                checked={item.isCompleted} 
                                onChange={() => { toggleChecklistItem(cl.id, item.id); setTimeout(saveCardChanges, 0); }}
                                disabled={isReadOnly}
                              />
                              <span className={`text-sm ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.text}</span>
                            </div>
                          ))}
                          {!isReadOnly && (
                            <input 
                              type="text"
                              placeholder="Add item..."
                              className="text-sm bg-transparent border-none outline-none text-gray-600 mt-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                  handleAddChecklistItem(cl.id, e.currentTarget.value.trim());
                                  setTimeout(saveCardChanges, 0);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                          )}
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
                    value={card.comment || ''}
                    onChange={(e) => {
                       const updatedCards = data.cards.map(c => c.id === card.id ? { ...c, comment: e.target.value } : c);
                       onUpdateData({ cards: updatedCards });
                    }}
                    disabled={isReadOnly}
                    className="w-full h-40 text-[13px] text-gray-700 bg-gray-50/50 border border-gray-200 rounded-lg p-3 outline-none hover:bg-white hover:border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none shadow-sm"
                 />
                 <div className="flex items-start gap-2 bg-blue-50/50 text-blue-600 rounded-lg p-3 border border-blue-100">
                   <AlertCircle size={16} className="mt-0.5 shrink-0" />
                   <p className="text-[12px] font-medium leading-relaxed">Comments are automatically saved and will show as a badge on the kanban card.</p>
                 </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
