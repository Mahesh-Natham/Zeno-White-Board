import { Group, Rect, Text, Line } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Plus, MoreVertical, Trash2, ChevronDown, Check, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, addMonths, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore, subMonths, differenceInDays } from 'date-fns';
import { TimelineLane, TimelineTask, ViewScale } from '../types';

interface TimelineSidebarProps {
  elementId: string;
  title: string;
  sidebarWidth: number;
  headerHeight: number;
  laneLayouts: (TimelineLane & { y: number; height: number; subCount: number })[];
  lanes: TimelineLane[];
  tasks: TimelineTask[];
  onChange?: (id: string, updates: any) => void;
  state: any;
  setters: any;
  handleScaleChange: (scale: ViewScale) => void;
  groupBy: string;
  clearSelections: () => void;
  baseDate: Date;
  calculatedEndDate: Date;
  pixelsPerDay: number;
  leftMonthPickerRef: React.RefObject<HTMLDivElement>;
  rightMonthPickerRef: React.RefObject<HTMLDivElement>;
  laneMenuRef: React.RefObject<HTMLDivElement>;
  updateLaneRecursively: (lanes: TimelineLane[], id: string, updater: any) => TimelineLane[];
  deleteLaneRecursively: (lanes: TimelineLane[], id: string) => TimelineLane[];
  elementLocked?: boolean;
}

export function TimelineSidebar({
  elementId, title, sidebarWidth, headerHeight, laneLayouts, lanes, tasks, onChange,
  state, setters, handleScaleChange, groupBy, clearSelections, baseDate, calculatedEndDate, pixelsPerDay,
  leftMonthPickerRef, rightMonthPickerRef, laneMenuRef, updateLaneRecursively, deleteLaneRecursively,
  elementLocked
}: TimelineSidebarProps) {

  const {
    editingHeaderTitle, showScaleDropdown, showDatePicker, showLeftMonthPicker, showRightMonthPicker,
    selectedLaneId, hoveredLaneId, laneMenuOpenId, editingLaneId, viewScale
  } = state;

  const {
    setEditingHeaderTitle, setShowScaleDropdown, setShowDatePicker, setShowLeftMonthPicker, setShowRightMonthPicker,
    setSelectedLaneId, setHoveredLaneId, setLaneMenuOpenId, setEditingLaneId, setLeftMonth, setRightMonth
  } = setters;

  const leftMonth = state.leftMonth || startOfMonth(baseDate);
  const rightMonth = state.rightMonth || addMonths(startOfMonth(baseDate), 1);

  const renderMonth = (monthDate: Date, isStartDate: boolean) => {
    const start = startOfWeek(startOfMonth(monthDate));
    const end = endOfWeek(endOfMonth(monthDate));
    const days = eachDayOfInterval({ start, end });
    const selectedDate = isStartDate ? baseDate : calculatedEndDate;
    const showPicker = isStartDate ? showLeftMonthPicker : showRightMonthPicker;
    const setShowPicker = isStartDate ? setShowLeftMonthPicker : setShowRightMonthPicker;
    const popupRef = isStartDate ? leftMonthPickerRef : rightMonthPickerRef;

    return (
      <div className="flex flex-col w-48 h-56" ref={popupRef}>
        <div className="flex items-center justify-between mb-2">
          {showPicker ? (
            <button 
              onClick={() => {}}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          ) : (
            <button 
              className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <button 
            className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors px-2 py-0.5 rounded hover:bg-blue-50"
          >
            {showPicker ? format(monthDate, 'yyyy') : format(monthDate, 'MMMM yyyy')}
          </button>
          {showPicker ? (
            <button 
              onClick={() => {}}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          ) : (
            <button 
              className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {showPicker ? (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((monthName, idx) => (
              <button
                key={monthName}
                className={`text-xs p-2 rounded-md transition-colors ${monthDate.getMonth() === idx ? 'bg-blue-500 text-white hover:bg-blue-600 font-bold' : 'text-gray-700 hover:bg-blue-50'}`}
              >
                {monthName}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-[10px] font-semibold text-gray-400 uppercase">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {days.map(d => {
                const isSelected = isSameDay(d, selectedDate);
                const isCurrentMonth = isSameMonth(d, monthDate);
                const inRange = (isAfter(d, baseDate) || isSameDay(d, baseDate)) && (isBefore(d, calculatedEndDate) || isSameDay(d, calculatedEndDate));
                return (
                  <button
                    key={d.toISOString()}
                    className={`text-[12px] p-1 rounded-full w-6 h-6 flex items-center justify-center transition-colors mx-auto
                      ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}
                      ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600 font-bold z-10' : ''}
                      ${inRange && !isSelected && isCurrentMonth ? 'bg-blue-50' : ''}
                    `}
                    onClick={() => {
                      if (onChange) {
                        const daysDiff = differenceInDays(d, baseDate);
                        const newWidth = sidebarWidth + Math.max(1, daysDiff) * pixelsPerDay;
                        onChange(elementId, { endDate: d.toISOString(), width: Math.max(sidebarWidth + 100, newWidth) });
                      }
                    }}
                  >
                    {format(d, 'd')}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Group>
      {/* Sidebar Header Native Canvas Text Removed to use HTML Overlay CSS Truncation */}

      {/* Sidebar HTML UI Overlays (Header Actions) */}
      <Group x={0} y={0}>
        <Html groupProps={{ x: 0, y: 0 }} divProps={{ style: { position: 'absolute', zIndex: 50, pointerEvents: 'none' } }}>
          <div 
            className={`flex items-center px-3 h-[60px] w-[200px] ${elementLocked ? 'opacity-50 pointer-events-none' : ''}`} 
            onWheel={e => {
              const canvas = document.querySelector('canvas');
              if (canvas) canvas.dispatchEvent(new WheelEvent('wheel', { deltaX: e.deltaX, deltaY: e.deltaY, clientX: e.clientX, clientY: e.clientY, bubbles: true }));
            }}
          >
             {editingHeaderTitle ? (
                <input 
                  autoFocus
                  defaultValue={title}
                  className="w-[80px] text-sm font-bold text-gray-700 bg-transparent border-b border-blue-500 focus:outline-none pointer-events-auto mr-2"
                  onBlur={(e) => {
                    setEditingHeaderTitle(false);
                    const newTitle = e.target.value.trim();
                    if (newTitle && newTitle !== title) {
                       const estWidth = Math.max(200, newTitle.length * 8 + 120);
                       onChange?.(elementId, { title: newTitle, sidebarWidth: estWidth });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                    if (e.key === 'Escape') setEditingHeaderTitle(false);
                  }}
                  onMouseDown={e => e.stopPropagation()}
                />
             ) : (
                <div 
                  className="flex-1 truncate text-sm font-bold text-gray-700 cursor-text pointer-events-auto mr-2"
                >
                  {title}
                </div>
             )}

             <div className="relative ml-auto flex items-center pointer-events-auto" onMouseDown={e => e.stopPropagation()}>
               <button
                 onClick={() => setShowScaleDropdown(!showScaleDropdown)}
                 className="flex items-center gap-1 bg-transparent text-[11px] text-gray-600 font-medium px-2 py-1 cursor-pointer hover:bg-gray-100 rounded outline-none transition-colors"
               >
                 <span className="capitalize">{viewScale || 'weeks'}</span>
                 <ChevronDown size={10} className="text-gray-500" />
               </button>
               
               {showScaleDropdown && (
                 <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-50 flex flex-col w-32 pointer-events-auto" onMouseDown={e => e.stopPropagation()}>
                   {['days', 'weeks', 'months', 'quarters', 'years'].map(scale => (
                     <button
                       key={scale}
                       onClick={() => {}}
                       className="flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-gray-50 text-gray-700 transition-colors"
                     >
                       <span className="capitalize">{scale}</span>
                       {(viewScale || 'weeks') === scale && <Check size={12} className="text-blue-500" />}
                     </button>
                   ))}
                 </div>
               )}
             </div>

             {/* Date Picker Button */}
             <div className="relative ml-1 pointer-events-auto" onMouseDown={e => e.stopPropagation()}>
               <button 
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                  title="Date Range"
               >
                 <Calendar size={13} />
               </button>
               
               {showDatePicker && (
                 <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 shadow-2xl rounded-xl p-4 z-50 flex gap-6 w-auto pointer-events-auto" onMouseDown={e => e.stopPropagation()}>
                   <div className="flex flex-col">
                     <label className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">Start Date</label>
                     {renderMonth(leftMonth, true)}
                   </div>
                   <div className="w-px bg-gray-200"></div>
                   <div className="flex flex-col">
                     <label className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">End Date</label>
                     {renderMonth(rightMonth, false)}
                   </div>
                 </div>
               )}
             </div>
          </div>
        </Html>
        {/* Native Canvas Sidebar Lanes */}
        <Group x={0} y={headerHeight}>
          {laneLayouts.map((lane) => {
            const isGroup = lane.type === 'group' || (lane.children && lane.children.length > 0);
            const paddingLeft = 16 + ((lane.level || 0) * 16);
            const isHovered = hoveredLaneId === lane.id;
            const isSelected = selectedLaneId === lane.id;
            
            return (
              <Group 
                key={lane.id} 
                y={lane.y - headerHeight}
                listening={!elementLocked}
                onMouseEnter={() => setHoveredLaneId(lane.id)}
                onMouseLeave={() => setHoveredLaneId(null)}
                onDblClick={(e) => {
                  if (e.evt && e.evt.button === 2) return;
                  e.cancelBubble = true;
                  if (groupBy === 'dependencies' && !elementLocked) setEditingLaneId(lane.id);
                }}
              >
                <Rect 
                  width={sidebarWidth} 
                  height={lane.height} 
                  fill={lane.type === 'milestones-track' ? '#f0f7ff' : (isSelected ? '#eff6ff' : (isHovered ? '#f8fafc' : 'transparent'))} 
                />
                <Line 
                  points={[0, lane.height, sidebarWidth, lane.height]} 
                  stroke="#f3f4f6" 
                  strokeWidth={1} 
                />

                <Group x={paddingLeft} y={0}>
                   {isGroup && (
                     <Text 
                       x={0} 
                       y={(lane.height - 14) / 2} 
                       text={lane.isExpanded !== false ? '▾' : '▸'} 
                       fontSize={14}
                       fill="#6b7280"
                       fontStyle="bold"
                       onMouseEnter={(e: any) => e.target.getStage().container().style.cursor = 'pointer'}
                       onMouseLeave={(e: any) => e.target.getStage().container().style.cursor = 'default'}
                     />
                   )}

                   {lane.type === 'milestones-track' ? (
                       <Rect 
                         x={isGroup ? 20 : 0} 
                         y={(lane.height - 24) / 2} 
                         width={sidebarWidth - paddingLeft - (isGroup ? 20 : 0) - 16} 
                         height={24} 
                         fill="#eff6ff" 
                         cornerRadius={4} 
                       />
                    ) : !isGroup ? (
                       <Rect 
                         x={isGroup ? 20 : 0} 
                         y={(lane.height - 24) / 2} 
                         width={sidebarWidth - paddingLeft - (isGroup ? 20 : 0) - 16} 
                         height={24} 
                         fill="#f3f4f6" 
                         cornerRadius={4} 
                       />
                    ) : null}

                   {editingLaneId === lane.id && groupBy === 'dependencies' && lane.type !== 'milestones-track' ? (
                     <Html groupProps={{ x: isGroup ? 20 : 8, y: (lane.height - 28) / 2 }} divProps={{ style: { position: 'absolute', pointerEvents: 'auto' } }}>
                        <div onMouseDown={e => e.stopPropagation()}>
                          <input
                            autoFocus
                            defaultValue={lane.title}
                            className="w-[120px] text-[13px] font-inter text-gray-700 bg-white border border-blue-500 rounded-sm outline-none px-1 h-7"
                            onBlur={(e) => {
                              const newLanes = updateLaneRecursively(lanes, lane.id, (l: any) => ({ ...l, title: e.target.value || 'Untitled' }));
                              if (onChange) onChange(elementId, { lanes: newLanes });
                              setEditingLaneId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === 'Escape') e.target.blur();
                              e.stopPropagation();
                            }}
                          />
                        </div>
                     </Html>
                   ) : (
                     <Text 
                       x={isGroup ? 20 : 8} 
                       y={(lane.height - 13) / 2} 
                       text={lane.title} 
                       fontSize={13}
                       fill={lane.type === 'milestones-track' ? '#2563eb' : (isGroup ? '#1f2937' : '#4b5563')}
                       fontFamily="Inter, Arial, sans-serif"
                       fontStyle={lane.type === 'milestones-track' || isGroup ? 'bold' : 'normal'}
                     />
                   )}
                </Group>

                {/* Hover Actions */}
                {(isHovered || laneMenuOpenId === lane.id) && groupBy === 'dependencies' && editingLaneId !== lane.id && lane.type !== 'milestones-track' && !elementLocked && (
                  <Html groupProps={{ x: sidebarWidth - 46, y: (lane.height - 24) / 2 }} divProps={{ style: { position: 'absolute', pointerEvents: 'auto' } }}>
                     <div className="flex items-center" onMouseDown={e => e.stopPropagation()} onWheel={e => e.stopPropagation()}>
                        <button 
                          onClick={() => {
                            const newRecord: TimelineLane = { id: `lane-${Date.now()}`, title: 'New Record', type: 'record' };
                            const newTask: TimelineTask = { id: `task-${Date.now()}`, title: 'New Task', startOffset: 0, duration: 3, color: '#3b82f6', laneId: newRecord.id };
                            let newLanes;
                            if (isGroup) {
                              newLanes = updateLaneRecursively(lanes, lane.id, (l: any) => ({ ...l, isExpanded: true, children: [...(l.children || []), newRecord] }));
                            } else {
                              newLanes = updateLaneRecursively(lanes, lane.id, (l: any) => ({ ...l, type: 'group', isExpanded: true, children: [newRecord] }));
                            }
                            if (onChange) onChange(elementId, { lanes: newLanes, tasks: [...tasks, newTask] });
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 bg-white/80 hover:bg-white rounded shadow-sm transition-colors mr-0.5"
                       >
                         <Plus size={14} />
                       </button>
                       <div className="relative" ref={laneMenuOpenId === lane.id ? laneMenuRef : null}>
                         <button 
                           onClick={() => setLaneMenuOpenId(lane.id === laneMenuOpenId ? null : lane.id)}
                           className="p-1 text-gray-400 hover:text-gray-600 bg-white/80 hover:bg-white rounded shadow-sm transition-colors"
                         >
                           <MoreVertical size={14} />
                         </button>
                         {laneMenuOpenId === lane.id && (
                           <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-xl border border-gray-200 py-1 z-[100]" onMouseDown={e => e.stopPropagation()}>
                             <button 
                               className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                               onClick={() => {
                                 setLaneMenuOpenId(null);
                               }}
                             >
                               <Trash2 size={12} />
                               Delete
                             </button>
                           </div>
                         )}
                       </div>
                     </div>
                  </Html>
                )}
              </Group>
            );
          })}
        </Group>
      </Group>
    </Group>
  );
}
