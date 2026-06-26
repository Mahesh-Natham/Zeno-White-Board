import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isToday, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  Folder, 
  LayoutTemplate, 
  ExternalLink 
} from 'lucide-react';
import { useCalendarStore } from '../../store/calendarStore';
import useProjectStore from '../../store/projectStore';
import useBoardStore from '../../store/boardStore';
import { deleteEvent } from '../../services/calendarService';
import CreateEventModal from './CreateEventModal';
import toast from 'react-hot-toast';

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { events, isLoading } = useCalendarStore();
  const { projects } = useProjectStore();
  const { boards } = useBoardStore();

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getProjectColor = (projectId?: string | null) => {
    if (!projectId) return '#4262FF'; // default brand
    const p = projects.find(proj => proj.id === projectId);
    return p?.color || '#4262FF';
  };

  const getProjectName = (projectId?: string | null) => {
    if (!projectId) return '';
    const p = projects.find(proj => proj.id === projectId);
    return p?.name || '';
  };

  const getBoardTitle = (boardId?: string | null) => {
    if (!boardId) return '';
    const b = boards.find(board => board.id === boardId);
    return b?.title || '';
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      toast.success('Reminder removed');
    } catch (e) {
      toast.error('Failed to delete reminder');
    }
  };

  const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
  const selectedDateEvents = (events || [])
    .filter(e => e && e.date === formattedSelectedDate)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const upcomingEvents = (events || [])
    .filter(e => e && e.date && e.date >= new Date().toISOString().split('T')[0] && e.date !== formattedSelectedDate)
    .sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.time || '').localeCompare(b.time || ''))
    .slice(0, 5);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-dashboard-card rounded-lg border border-slate-200/80 dark:border-dashboard-border shadow-sm p-4 font-sans h-[600px] overflow-hidden">
      
      {/* 1. Monthly Grid Area (8 cols) */}
      <div className="lg:col-span-8 flex flex-col h-full border-r border-slate-100 dark:border-dashboard-border pr-0 lg:pr-6">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-brand" strokeWidth={1.5} />
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-500 dark:text-slate-400"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-500 dark:text-slate-400"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day of Week Labels */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          {weekDays.map(day => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {calendarDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isDaySelected = isSameDay(day, selectedDate);
            const isDayToday = isToday(day);
            const formattedDayStr = format(day, 'yyyy-MM-dd');
            const dayEvents = (events || []).filter(e => e && e.date === formattedDayStr);

            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`relative flex flex-col justify-between p-1.5 rounded border transition-all cursor-pointer select-none aspect-square lg:aspect-auto h-full ${
                  isDaySelected 
                    ? 'border-brand/60 bg-brand/5 dark:bg-brand/10' 
                    : 'border-slate-100 dark:border-dashboard-border/30 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-dashboard-darker/20'
                }`}
              >
                {/* Date Number Label */}
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-semibold ${
                    isDayToday
                      ? 'bg-brand text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm'
                      : isCurrentMonth 
                        ? 'text-slate-700 dark:text-slate-200' 
                        : 'text-slate-300 dark:text-slate-650'
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Event Dot Indicators */}
                <div className="flex flex-wrap gap-0.5 mt-auto max-h-3 overflow-hidden">
                  {dayEvents.slice(0, 4).map(e => (
                    <span 
                      key={e.id} 
                      className="w-1 h-1 rounded-full shrink-0" 
                      style={{ backgroundColor: getProjectColor(e.projectId) }}
                      title={e.title}
                    />
                  ))}
                  {dayEvents.length > 4 && (
                    <span className="text-[7px] leading-none font-bold text-slate-400 shrink-0">+</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Reminders & Schedule Panel (4 cols) */}
      <div className="lg:col-span-4 flex flex-col h-full pl-0 lg:pl-2">
        {/* Selected Date title & Add button */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-dashboard-border pb-2 shrink-0">
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
              Agenda
            </h3>
            <p className="text-[13px] font-semibold text-slate-800 dark:text-white truncate">
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-1 bg-brand hover:bg-brand-hover text-white px-2 py-1 rounded text-[11px] font-medium shadow-sm transition-colors shrink-0"
          >
            <Plus size={12} />
            Add
          </button>
        </div>

        {/* Selected Date Events List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading events...</div>
          ) : selectedDateEvents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 italic">
              No events scheduled for this day
            </div>
          ) : (
            selectedDateEvents.map(event => (
              <div 
                key={event.id}
                className="p-2.5 rounded-lg border border-slate-200/60 dark:border-dashboard-border bg-slate-50/50 dark:bg-dashboard-darker/30 flex flex-col gap-1.5 relative group"
              >
                {/* Delete button */}
                <button
                  onClick={() => handleDelete(event.id)}
                  className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove event"
                >
                  <Trash2 size={12} />
                </button>

                {/* Event header */}
                <div className="flex items-start gap-1.5 pr-6">
                  {event.time && (
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-0.5 shrink-0 mt-0.5">
                      <Clock size={10} />
                      {event.time}
                    </span>
                  )}
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-white leading-tight">
                    {event.title}
                  </h4>
                </div>

                {/* Description */}
                {event.description && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                    {event.description}
                  </p>
                )}

                {/* Linking links */}
                {(event.projectId || event.boardId) && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-dashboard-border/40 text-[9px]">
                    {event.projectId && (
                      <span className="flex items-center gap-0.5 text-slate-500 dark:text-slate-400">
                        <Folder size={9} style={{ color: getProjectColor(event.projectId) }} />
                        {getProjectName(event.projectId)}
                      </span>
                    )}
                    {event.boardId && (
                      <Link 
                        to={`/board/${event.boardId}`}
                        className="flex items-center gap-0.5 text-brand hover:underline font-medium"
                      >
                        <LayoutTemplate size={9} />
                        {getBoardTitle(event.boardId)}
                        <ExternalLink size={8} />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Upcoming Schedule Section */}
          {upcomingEvents.length > 0 && (
            <div className="pt-3 border-t border-slate-150/60 dark:border-dashboard-border">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider mb-2">
                Upcoming Reminders
              </h4>
              <div className="space-y-1.5">
                {upcomingEvents.map(event => (
                  <div 
                    key={event.id}
                    onClick={() => event.date && setSelectedDate(parseISO(event.date))}
                    className="p-1.5 rounded border border-slate-100 dark:border-dashboard-border bg-white dark:bg-dashboard-card hover:bg-slate-55 dark:hover:bg-slate-800/40 cursor-pointer flex items-center justify-between text-[11px] transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: getProjectColor(event.projectId) }} />
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{event.title}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 shrink-0 font-medium ml-2">
                      {format(parseISO(event.date), 'MMM d')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateEventModal 
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        defaultDate={formattedSelectedDate}
      />
    </div>
  );
}
