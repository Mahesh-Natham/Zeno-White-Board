import { Group, Rect, Line, Text } from 'react-konva';
import { Html } from 'react-konva-utils';
import { format, addDays, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, PanelRight, Calendar, MessageSquare, Trash2, AlertCircle, ChevronsUp, Equal, ChevronDown, Plus, X, CheckCircle2 } from 'lucide-react';
import { TimelineTask, TimelineLane, Priority } from '../types';
import useToolStore from '../../../../../store/toolStore';
import { TOOLS } from '../../../../../config/constants';

interface TimelineTaskBarProps {
  task: TimelineTask;
  taskLane: TimelineLane & { y: number; height: number; subCount: number };
  pixelsPerDay: number;
  rowHeight: number;
  barHeight: number;
  baseDate: Date;
  elementLocked: boolean;
  state: any;
  setters: any;
  updateTask: (taskId: string, updates: Partial<TimelineTask>) => void;
  handleTaskDragEnd: (e: any, task: TimelineTask) => void;
  visibleLanes: TimelineLane[];
  groupBy: string;
  lanes: TimelineLane[];
  reorderLane: (lanes: TimelineLane[], sourceId: string, targetIdx: number, visibleArray: TimelineLane[]) => TimelineLane[];
  onChange?: (id: string, updates: any) => void;
  elementId: string;
  taskToolbarRef: React.RefObject<HTMLDivElement>;
  priorityMenuRef: React.RefObject<HTMLDivElement>;
  normalizedTasks: TimelineTask[];
}

export function TimelineTaskBar({
  task, taskLane, pixelsPerDay, rowHeight, barHeight, baseDate, elementLocked,
  state, setters, updateTask, handleTaskDragEnd, visibleLanes, groupBy, lanes,
  reorderLane, onChange, elementId, taskToolbarRef, priorityMenuRef, normalizedTasks
}: TimelineTaskBarProps) {

  const {
    selectedTaskId, hoveredTaskId, editingTaskId, connectingFromTaskId,
    openDurationTaskId, openCommentTaskId, showColorPalette, openPriorityTaskId, resizingTask
  } = state;

  const {
    setHoveredTaskId, setSelectedTaskId, setConnectingFromTaskId, setSelectedDep,
    setShowColorPalette, setOpenTaskDetailsId, setOpenDurationTaskId, setOpenCommentTaskId,
    setEditingTaskId, setOpenPriorityTaskId, setResizingTask
  } = setters;

  const taskX = task.startOffset * pixelsPerDay;
  const taskY = taskLane.y + (task.subLaneIndex || 0) * rowHeight + (rowHeight - barHeight) / 2;
  const isSelectedTask = selectedTaskId === task.id;
  const hasPriority = !!(task.priority || isSelectedTask);
  const isResizing = resizingTask?.id === task.id;
  
  let visualX = 0;
  let visualW = task.duration * pixelsPerDay;
  if (isResizing) {
     if (resizingTask.type === 'left') {
        visualX = resizingTask.deltaX;
        visualW = task.duration * pixelsPerDay - resizingTask.deltaX;
     } else if (resizingTask.type === 'right') {
        visualW = task.duration * pixelsPerDay + resizingTask.deltaX;
     }
     visualW = Math.max(10, visualW);
  }

  return (
    <Group
      x={taskX}
      y={taskY}
      listening={!elementLocked}
      draggable={!elementLocked && !task.isMilestone}
      onMouseEnter={() => setHoveredTaskId(task.id)}
      onMouseLeave={() => setHoveredTaskId(null)}
      dragBoundFunc={function(pos) {
        if (!this.getParent()) return pos;
        const transform = this.getParent().getAbsoluteTransform().copy().invert();
        const localPos = transform.point(pos);
        const snappedLocalX = Math.max(0, Math.round(localPos.x / pixelsPerDay)) * pixelsPerDay;
        return this.getParent().getAbsoluteTransform().point({
          x: snappedLocalX,
          y: localPos.y
        });
      }}
      onDragEnd={(e: any) => handleTaskDragEnd(e, task)}
      onMouseDown={(e: any) => {
        if (e.evt && e.evt.button === 2) return; // Allow right-click for Context Menu
        e.cancelBubble = true;
        if (e.evt) e.evt.stopPropagation();
        if (elementLocked) return;
        
        if (connectingFromTaskId) {
           if (connectingFromTaskId !== task.id) {
              const deps = task.dependencies || [];
              if (!deps.includes(connectingFromTaskId)) {
                 updateTask(task.id, { dependencies: [...deps, connectingFromTaskId] });
              }
           }
           setConnectingFromTaskId(null);
        } else {
           setSelectedTaskId(task.id);
           setSelectedDep(null);
           setShowColorPalette(false);
        }
      }}
    >
      <Group x={visualX}>
        {task.isMilestone ? (
          <Line
            points={[
              pixelsPerDay / 2, 5,
              pixelsPerDay / 2 + 10, 15,
              pixelsPerDay / 2, 25,
              pixelsPerDay / 2 - 10, 15
            ]}
            closed={true}
            fill={task.color || '#3b82f6'}
            stroke={selectedTaskId === task.id ? '#2563eb' : 'rgba(0,0,0,0.15)'}
            strokeWidth={selectedTaskId === task.id ? 2 : 1}
          />
        ) : (
          <Rect
            width={Math.max(20, visualW)}
            height={barHeight}
            fill={task.color || '#3b82f6'}
            cornerRadius={4}
            stroke={selectedTaskId === task.id ? '#2563eb' : 'rgba(0,0,0,0.1)'}
            strokeWidth={selectedTaskId === task.id ? 2 : 1}
          />
        )}
        
        {(hoveredTaskId === task.id || isResizing) && !elementLocked && !task.isMilestone && (
          <>
            <Group x={4} y={barHeight / 2 - 4} listening={false}>
              <Line points={[0, 0, 0, 8]} stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
              <Line points={[2, 0, 2, 8]} stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
            </Group>
            <Group x={Math.max(20, visualW) - 6} y={barHeight / 2 - 4} listening={false}>
              <Line points={[0, 0, 0, 8]} stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
              <Line points={[2, 0, 2, 8]} stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
            </Group>
          </>
        )}

      {/* Task Toolbar Overlay */}
      {selectedTaskId === task.id && !editingTaskId && !connectingFromTaskId && !elementLocked && (
        <Html groupProps={{ x: 0, y: -45 }} divProps={{ style: { position: 'absolute', zIndex: 50 } }}>
           <div className="timeline-task-toolbar flex flex-col gap-1.5 bg-white shadow-xl border border-gray-100 rounded-lg p-1.5 pointer-events-auto"
             onMouseDown={e => e.stopPropagation()}
             ref={taskToolbarRef as any}
           >
             <div className="flex items-center gap-1 border-gray-100">
               <button onClick={() => setConnectingFromTaskId(task.id)} className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Connect Task"><Link2 size={14} /></button>
               <button onClick={() => setOpenTaskDetailsId(task.id)} className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600" title="Open Details"><PanelRight size={14} /></button>
               <button onClick={() => setOpenDurationTaskId(openDurationTaskId === task.id ? null : task.id)} className={`flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 rounded transition-colors text-[11px] font-medium ${openDurationTaskId === task.id ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}>
                 <Calendar size={13} />
                  <span>
                    {task.isMilestone ? format(addDays(baseDate, task.startOffset), 'MMM d') : `${format(addDays(baseDate, task.startOffset), 'MMM d')} - ${format(addDays(addDays(baseDate, task.startOffset), task.duration), 'MMM d')}`}
                  </span>
               </button>
               <button onClick={() => setOpenCommentTaskId(openCommentTaskId === task.id ? null : task.id)} className={`p-1 hover:bg-gray-100 rounded transition-colors ${openCommentTaskId === task.id ? 'text-blue-500 bg-blue-50' : 'text-gray-600'}`}><MessageSquare size={14} /></button>
               <div className="w-px h-4 bg-gray-200 mx-1" />
               <button onClick={() => setShowColorPalette(!showColorPalette)} className="w-4 h-4 rounded-sm shadow-sm border border-black/10 transition-transform ml-1 mr-1" style={{ backgroundColor: task.color || '#3b82f6' }} />
               <div className="w-px h-4 bg-gray-200" />
               <button className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors" onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); const newTasks = normalizedTasks.filter(t => t.id !== task.id); if (onChange) onChange(elementId, { tasks: newTasks }); setSelectedTaskId(null); }}><Trash2 size={14} /></button>
            </div>

             <AnimatePresence>
               {showColorPalette && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-gray-100 overflow-hidden">
                   {['#FFF9B1', '#A6CCF5', '#B4E8C0', '#FFD0E5', '#FFD4A9', '#D5D8FF', '#E2E8F0', '#3b82f6'].map(color => (
                       <button key={color} onClick={() => { updateTask(task.id, { color }); setShowColorPalette(false); }} className="w-5 h-5 rounded-sm hover:scale-110 cursor-pointer shadow-sm border border-black/10" style={{ backgroundColor: color }} />
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>

             <AnimatePresence>
               {openDurationTaskId === task.id && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-2 mt-1.5 pt-2 border-t border-gray-100 overflow-hidden">
                   <div className="flex items-center justify-between gap-3">
                     <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap w-8">{task.isMilestone ? 'Date' : 'Start'}</span>
                     <input type="date" value={format(addDays(baseDate, task.startOffset), 'yyyy-MM-dd')} onChange={(e) => { const newStart = new Date(e.target.value); if (!isNaN(newStart.getTime())) { const startDate = addDays(baseDate, task.startOffset); const endDate = addDays(startDate, task.duration); const offset = differenceInDays(newStart, baseDate); const newDuration = Math.max(1, differenceInDays(endDate, newStart)); if (task.isMilestone) updateTask(task.id, { startOffset: offset }); else updateTask(task.id, { startOffset: offset, duration: newDuration }); } }} className="text-[11px] px-1 py-0.5 border border-gray-200 rounded outline-none w-[100px]" />
                   </div>
                   {!task.isMilestone && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap w-8">End</span>
                        <input type="date" value={format(addDays(addDays(baseDate, task.startOffset), task.duration), 'yyyy-MM-dd')} onChange={(e) => { const newEnd = new Date(e.target.value); if (!isNaN(newEnd.getTime())) { const startDate = addDays(baseDate, task.startOffset); const newDuration = Math.max(1, differenceInDays(newEnd, startDate)); updateTask(task.id, { duration: newDuration }); } }} className="text-[11px] px-1 py-0.5 border border-gray-200 rounded outline-none w-[100px]" />
                      </div>
                    )}
                 </motion.div>
               )}
             </AnimatePresence>

             <AnimatePresence>
               {openCommentTaskId === task.id && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-1.5 mt-1.5 pt-1.5 border-t border-gray-100 overflow-hidden min-w-[220px]">
                   <textarea autoFocus className="w-full h-24 p-2 text-xs border border-gray-200 rounded resize-none outline-none" placeholder="Add a comment..." value={task.comment || ''} onChange={(e) => updateTask(task.id, { comment: e.target.value })} onKeyDown={(e) => { if (e.key === 'Escape') setOpenCommentTaskId(null); }} />
                   <div className="flex justify-end"><button onClick={() => setOpenCommentTaskId(null)} className="text-[11px] font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded">Done</button></div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </Html>
      )}

      {editingTaskId === task.id ? (
        <Html groupProps={{ x: task.isMilestone ? (pixelsPerDay / 2 + (hasPriority ? 45 : 15)) : (hasPriority ? 32 : 8), y: 0 }} divProps={{ style: { position: 'absolute', height: '30px', display: 'flex', alignItems: 'center' } }}>
          <input autoFocus defaultValue={task.title} style={{ width: `${task.isMilestone ? 180 : (Math.max(20, visualW) - (hasPriority ? 32 : 8))}px`, fontSize: '12px', fontFamily: '"Arial Rounded MT Bold", "Helvetica Rounded", Arial, sans-serif', color: '#1f2937', background: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0 }} onBlur={(e) => { updateTask(task.id, { title: e.target.value || 'Untitled' }); setEditingTaskId(null); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') e.target.blur(); e.stopPropagation(); }} onMouseDown={e => e.stopPropagation()} />
        </Html>
      ) : (
        <>
          {hasPriority && !editingTaskId && (
            <Html groupProps={{ x: task.isMilestone ? (pixelsPerDay / 2 + 15) : 4, y: 0 }} divProps={{ style: { position: 'absolute', height: '30px', display: 'flex', alignItems: 'center', pointerEvents: 'auto' } }}>
              <div className="relative" ref={openPriorityTaskId === task.id ? priorityMenuRef : null} onMouseDown={e => e.stopPropagation()}>
                <button onClick={() => setOpenPriorityTaskId(openPriorityTaskId === task.id ? null : task.id)} className={`flex items-center justify-center w-6 h-6 rounded-md border transition-all duration-200 ${ task.priority === 'urgent' ? 'bg-red-500 text-white border-red-600' : task.priority === 'high' ? 'bg-red-100 text-red-600' : task.priority === 'medium' ? 'bg-orange-100 text-orange-600' : task.priority === 'low' ? 'bg-blue-100 text-blue-600' : 'bg-white/80 text-gray-400' }`}>
                  {task.priority === 'urgent' ? <AlertCircle size={14} /> : task.priority === 'high' ? <ChevronsUp size={14} /> : task.priority === 'medium' ? <Equal size={14} /> : task.priority === 'low' ? <ChevronDown size={14} /> : <Plus size={14} />}
                </button>
                <AnimatePresence>
                  {openPriorityTaskId === task.id && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute top-full left-0 mt-1.5 w-40 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 flex flex-col p-1">
                      <button onClick={() => { updateTask(task.id, { priority: 'urgent' }); setOpenPriorityTaskId(null); }} className="flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"><AlertCircle size={14} /> Urgent</button>
                      <button onClick={() => { updateTask(task.id, { priority: 'high' }); setOpenPriorityTaskId(null); }} className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"><ChevronsUp size={14} /> High</button>
                      <button onClick={() => { updateTask(task.id, { priority: 'medium' }); setOpenPriorityTaskId(null); }} className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50"><Equal size={14} /> Medium</button>
                      <button onClick={() => { updateTask(task.id, { priority: 'low' }); setOpenPriorityTaskId(null); }} className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"><ChevronDown size={14} /> Low</button>
                      <div className="h-px bg-gray-100 my-1 mx-1" />
                      <button onClick={() => { updateTask(task.id, { priority: null }); setOpenPriorityTaskId(null); }} className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"><X size={14} /> Clear</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Html>
          )}
          
          <Text x={task.isMilestone ? (pixelsPerDay / 2 + (hasPriority ? 45 : 15)) : (hasPriority ? 32 : 8)} y={0} height={30} text={task.title} fontSize={12} fontFamily='"Arial Rounded MT Bold", "Helvetica Rounded", Arial, sans-serif' fill="#1f2937" width={task.isMilestone ? 180 : (Math.max(20, visualW) - (hasPriority ? 32 : 8) - (task.comment ? 24 : 0))} wrap="none" ellipsis={true} verticalAlign="middle" onDblClick={(e: any) => { e.cancelBubble = true; setEditingTaskId(task.id); setSelectedTaskId(task.id); setSelectedDep(null); }} />
          
          {(!editingTaskId && (task.comment || task.assigneeIds?.length || task.checklists?.length)) && (
            <Html groupProps={{ x: task.isMilestone ? (pixelsPerDay / 2 + (hasPriority ? 45 : 15) + 160) : (Math.max(20, visualW) - 60), y: 0 }} divProps={{ style: { position: 'absolute', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pointerEvents: 'auto', paddingRight: '4px', gap: '4px' } }}>
              
              {task.checklists?.length > 0 && (
                <div className="flex items-center gap-0.5 text-xs text-gray-500 bg-white/50 px-1 rounded cursor-help" title={`${task.checklists.reduce((acc, cl) => acc + cl.items.filter((i: any) => i.isCompleted).length, 0)}/${task.checklists.reduce((acc, cl) => acc + cl.items.length, 0)} checklist items`}>
                  <CheckCircle2 size={10} />
                  <span className="text-[9px] font-bold">{task.checklists.reduce((acc, cl) => acc + cl.items.filter((i: any) => i.isCompleted).length, 0)}/{task.checklists.reduce((acc, cl) => acc + cl.items.length, 0)}</span>
                </div>
              )}

              {task.assigneeIds?.length > 0 && (
                <div className="flex -space-x-1">
                  {task.assigneeIds.slice(0, 2).map((id) => (
                    <div key={id} className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm bg-gradient-to-br from-indigo-500 to-purple-500" title={id}>
                      {id.substring(0, 2).toUpperCase()}
                    </div>
                  ))}
                  {task.assigneeIds.length > 2 && (
                    <div className="w-5 h-5 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[8px] font-bold text-gray-600 shadow-sm">
                      +{task.assigneeIds.length - 2}
                    </div>
                  )}
                </div>
              )}

              {task.comment && (
                <div className="ml-auto relative group/comment flex items-center justify-center w-5 h-5 hover:bg-white/60 rounded transition-colors cursor-pointer" onMouseDown={e => e.stopPropagation()}>
                  <MessageSquare size={11} className="text-amber-700 opacity-90" fill="white" />
                  <div className="absolute bottom-full right-0 mb-1 opacity-0 group-hover/comment:opacity-100 transition-opacity pointer-events-none">
                     <div className="bg-gray-800 text-white text-[11px] p-2 rounded max-w-[200px] break-words">{task.comment}</div>
                  </div>
                </div>
              )}
            </Html>
          )}
        </>
      )}
      </Group>

      {/* Resize Handles */}
      {!task.isMilestone && (
        <>
          <Rect 
            x={-5} 
            y={0} 
            width={10} 
            height={barHeight} 
            fill="transparent" 
            draggable 
            dragBoundFunc={function(pos) { return { x: pos.x, y: this.absolutePosition().y }; }} 
            onDragStart={() => setResizingTask({ id: task.id, type: 'left', deltaX: 0 })}
            onDragMove={(e) => {
              const deltaX = e.target.x() + 5;
              setResizingTask({ id: task.id, type: 'left', deltaX });
            }}
            onDragEnd={(e) => {
              const deltaX = e.target.x() + 5;
              const daysDelta = Math.round(deltaX / pixelsPerDay);
              const finalDaysDelta = Math.min(daysDelta, task.duration - 1);
              updateTask(task.id, {
                startOffset: task.startOffset + finalDaysDelta,
                duration: task.duration - finalDaysDelta
              });
              setResizingTask(null);
              e.target.x(-5);
              e.target.getLayer()?.batchDraw();
            }}
            onMouseEnter={(e: any) => { if (useToolStore.getState().activeTool !== TOOLS.SELECT) return; e.target.getStage().container().style.cursor = 'ew-resize'; }} 
            onMouseLeave={(e: any) => { if (useToolStore.getState().activeTool !== TOOLS.SELECT) return; e.target.getStage().container().style.cursor = 'default'; }} 
          />
          <Rect 
            x={task.duration * pixelsPerDay - 5} 
            y={0} 
            width={10} 
            height={barHeight} 
            fill="transparent" 
            draggable 
            dragBoundFunc={function(pos) { return { x: pos.x, y: this.absolutePosition().y }; }} 
            onDragStart={() => setResizingTask({ id: task.id, type: 'right', deltaX: 0 })}
            onDragMove={(e) => {
              const originalX = task.duration * pixelsPerDay - 5;
              const deltaX = e.target.x() - originalX;
              setResizingTask({ id: task.id, type: 'right', deltaX });
            }}
            onDragEnd={(e) => {
              const originalX = task.duration * pixelsPerDay - 5;
              const deltaX = e.target.x() - originalX;
              const daysDelta = Math.round(deltaX / pixelsPerDay);
              const newDuration = Math.max(1, task.duration + daysDelta);
              updateTask(task.id, { duration: newDuration });
              setResizingTask(null);
              e.target.x(task.duration * pixelsPerDay - 5);
              e.target.getLayer()?.batchDraw();
            }}
            onMouseEnter={(e: any) => { if (useToolStore.getState().activeTool !== TOOLS.SELECT) return; e.target.getStage().container().style.cursor = 'ew-resize'; }} 
            onMouseLeave={(e: any) => { if (useToolStore.getState().activeTool !== TOOLS.SELECT) return; e.target.getStage().container().style.cursor = 'default'; }} 
          />
        </>
      )}
    </Group>
  );
}
