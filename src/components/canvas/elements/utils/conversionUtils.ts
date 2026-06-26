import { addDays, differenceInDays } from 'date-fns';
import { KanbanData, KanbanCard, KanbanColumn } from '../kanban/types';
import { TimelineElementData, TimelineTask, TimelineLane, Status } from '../timeline/types';
import { getSwimlanes } from '../kanban/utils';

export function timelineToKanbanDates(
  timelineBaseDate: string,
  startOffset: number,
  duration: number
): { startDate: string; dueDate: string } {
  const base = new Date(timelineBaseDate);
  const start = addDays(base, startOffset);
  const due = addDays(start, duration);
  return {
    startDate: start.toISOString().split('T')[0],
    dueDate: due.toISOString().split('T')[0]
  };
}

export function kanbanToTimelineOffsets(
  timelineBaseDate: string,
  startDate?: string,
  dueDate?: string,
  defaultDuration = 1
): { startOffset: number; duration: number } {
  const base = new Date(timelineBaseDate);
  let start = base;
  
  if (startDate) {
    start = new Date(startDate);
  } else if (dueDate) {
    start = new Date(dueDate);
    start = addDays(start, -defaultDuration);
  }

  const startOffset = Math.max(0, differenceInDays(start, base));
  let duration = defaultDuration;

  if (dueDate) {
    const due = new Date(dueDate);
    duration = Math.max(1, differenceInDays(due, start));
  }

  return { startOffset, duration };
}

export function generateColumnsFromStatuses(tasks: TimelineTask[]): KanbanColumn[] {
  const defaultStatuses: { id: string; title: string; color: string }[] = [
    { id: 'records', title: 'Records', color: '#f3f4f6' },
    { id: 'todo', title: 'To Do', color: '#e5e7eb' },
    { id: 'in_progress', title: 'In Progress', color: '#bfdbfe' },
    { id: 'done', title: 'Done', color: '#bbf7d0' },
  ];
  
  const columns: KanbanColumn[] = [];
  defaultStatuses.forEach((status, i) => {
    columns.push({
      id: status.id,
      title: status.title,
      color: status.color,
      position: i,
      isDone: status.id === 'done',
      isCollapsed: false
    });
  });

  return columns;
}

export function mapStatusToColumn(status?: Status): string {
  if (status === 'done') return 'done';
  if (status === 'in_progress' || status === 'in_review') return 'in_progress';
  return 'todo';
}

export function mapColumnToStatus(columnId: string, isDone?: boolean): Status {
  if (isDone || columnId === 'done') return 'done';
  if (columnId === 'in_progress') return 'in_progress';
  return 'not_started';
}

export function convertKanbanToTimeline(kanbanData: KanbanData, id: string): TimelineElementData {
  const baseDate = kanbanData.cards[0]?.startDate || new Date().toISOString().split('T')[0];
  
  const tasks: TimelineTask[] = kanbanData.cards.map(c => {
    const { startOffset, duration } = kanbanToTimelineOffsets(baseDate, c.startDate, c.dueDate);
    return {
      id: c.id,
      title: c.title,
      startOffset,
      duration,
      color: c.coverColor,
      status: mapColumnToStatus(c.columnId, kanbanData.columns.find(col => col.id === c.columnId)?.isDone),
      priority: c.priority === 'none' ? null : c.priority,
      estimate: c.estimationPoints,
      description: c.description,
      isMilestone: c.isMilestone,
      dependencies: c.dependencies,
      labelIds: c.labelIds,
      assigneeIds: c.assigneeIds,
      checklists: c.checklists,
    };
  });

  return {
    id,
    type: 'timeline',
    x: kanbanData.x || 100,
    y: kanbanData.y || 100,
    width: 1000,
    height: 600,
    title: kanbanData.title,
    startDate: baseDate,
    tasks,
    lanes: [], // To be generated or populated based on kanban swimlanes
  };
}

export function convertTimelineToKanban(timelineData: TimelineElementData, id: string): KanbanData {
  const columns = generateColumnsFromStatuses(timelineData.tasks || []);
  
  const cards: KanbanCard[] = (timelineData.tasks || []).map((t, index) => {
    const { startDate, dueDate } = timelineToKanbanDates(timelineData.startDate || new Date().toISOString(), t.startOffset, t.duration);
    return {
      id: t.id,
      columnId: mapStatusToColumn(t.status),
      title: t.title || 'Untitled',
      description: t.description,
      position: index * 1000,
      number: index + 1,
      startDate,
      dueDate,
      coverColor: t.color,
      priority: t.priority || 'none',
      estimationPoints: t.estimate,
      isMilestone: t.isMilestone,
      dependencies: t.dependencies,
      labelIds: t.labelIds,
      assigneeIds: t.assigneeIds,
      checklists: t.checklists || [],
      commentCount: t.comment ? 1 : 0,
      attachmentCount: 0,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'currentUser'
    };
  });

  return {
    id,
    type: 'kanban',
    x: timelineData.x,
    y: timelineData.y,
    title: timelineData.title || 'Converted Board',
    columns,
    cards,
    labels: [], // Could be inferred
    nextCardNumber: cards.length + 1,
    settings: {
      autoSize: true,
      columnWidth: 280
    }
  };
}

// === TABLE CONVERSIONS ===

export function convertTableToKanban(tableData: any, id: string): KanbanData {
  const data = tableData.tableData;
  const columns = [
    { id: 'col-records', title: 'Records', position: 500, color: '#f3f4f6', isDone: false, isCollapsed: false },
    { id: 'col-todo', title: 'To Do', position: 1000, color: '#e5e7eb', isDone: false, isCollapsed: false },
    { id: 'col-in_progress', title: 'In Progress', position: 2000, color: '#bfdbfe', isDone: false, isCollapsed: false },
    { id: 'col-done', title: 'Done', position: 3000, color: '#bbf7d0', isDone: true, isCollapsed: false },
  ];

  const cards: KanbanCard[] = (data.rows || []).map((row: any, i: number) => {
    const statusVal = row.cells?.status?.value || 'To Do';
    let columnId = 'col-todo';
    if (statusVal.toLowerCase().includes('progress')) columnId = 'col-in_progress';
    if (statusVal.toLowerCase().includes('done')) columnId = 'col-done';

    return {
      id: row.id,
      columnId,
      title: row.cells?.title?.value || `Row ${i + 1}`,
      description: row.cells?.description?.value || '',
      position: i * 1000,
      number: i + 1,
      startDate: row.cells?.startDate?.value || new Date().toISOString(),
      dueDate: row.cells?.dueDate?.value || undefined,
      coverColor: '#ffffff',
      priority: row.cells?.priority?.value?.toLowerCase() || 'medium',
      estimationPoints: undefined,
      isMilestone: false,
      dependencies: [],
      labelIds: row.cells?.labels?.value ? [row.cells?.labels?.value] : [],
      assigneeIds: row.cells?.assignee?.value ? [row.cells?.assignee?.value] : [],
      checklists: [],
      commentCount: 0,
      attachmentCount: 0,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'currentUser'
    };
  });

  return {
    id,
    type: 'kanban',
    x: tableData.x,
    y: tableData.y,
    title: 'Converted from Table',
    columns,
    cards,
    labels: [],
    nextCardNumber: cards.length + 1,
    settings: {
      autoSize: true,
      columnWidth: 280
    }
  };
}

export function convertKanbanToTable(kanbanData: KanbanData, id: string): any {
  const rows = kanbanData.cards.map((c, i) => {
    const statusText = kanbanData.columns.find(col => col.id === c.columnId)?.title || 'To Do';
    return {
      id: c.id,
      cells: {
        title: { value: c.title },
        description: { value: c.description || '' },
        status: { value: statusText },
        priority: { value: c.priority || 'Medium' },
        assignee: { value: c.assigneeIds?.[0] || '' },
        labels: { value: c.labelIds?.[0] || '' },
        startDate: { value: c.startDate || new Date().toISOString() },
        dueDate: { value: c.dueDate || '' },
      }
    };
  });

  return {
    id,
    type: 'table',
    x: kanbanData.x,
    y: kanbanData.y,
    width: 1000,
    height: 700,
    tableData: {
      columns: [
        { id: 'title', label: 'Title', type: 'text', width: 300, visible: true, isFrozen: true },
        { id: 'description', label: 'Description', type: 'text', width: 250, visible: true },
        { id: 'status', label: 'Status', type: 'status', width: 150, options: ['To Do', 'In Progress', 'Done'], visible: true },
        { id: 'priority', label: 'Priority', type: 'status', width: 120, options: ['Low', 'Medium', 'High', 'Critical'], visible: true },
        { id: 'assignee', label: 'Assignee', type: 'assignee', width: 150, visible: true },
        { id: 'labels', label: 'Labels', type: 'text', width: 150, visible: true },
        { id: 'startDate', label: 'Start Date', type: 'date', width: 150, visible: true },
        { id: 'dueDate', label: 'Due Date', type: 'date', width: 150, visible: true },
      ],
      rows,
      sorts: [],
      filters: [],
    }
  };
}

export function convertTableToTimeline(tableData: any, id: string): TimelineElementData {
  const data = tableData.tableData;
  const baseDate = data.rows[0]?.cells?.startDate?.value || new Date().toISOString().split('T')[0];
  
  const tasks: TimelineTask[] = data.rows.map((row: any) => {
    const { startOffset, duration } = kanbanToTimelineOffsets(
      baseDate, 
      row.cells?.startDate?.value, 
      row.cells?.dueDate?.value
    );
    
    let status: Status = 'not_started';
    const statusVal = (row.cells?.status?.value || '').toLowerCase();
    if (statusVal.includes('progress')) status = 'in_progress';
    if (statusVal.includes('done')) status = 'done';

    return {
      id: row.id,
      title: row.cells?.title?.value || 'Untitled',
      startOffset,
      duration,
      color: '#bfdbfe',
      status,
      priority: (row.cells?.priority?.value?.toLowerCase() || 'none') as any,
      description: row.cells?.description?.value || '',
      isMilestone: false,
      dependencies: [],
      labelIds: row.cells?.labels?.value ? [row.cells?.labels?.value] : [],
      assigneeIds: row.cells?.assignee?.value ? [row.cells?.assignee?.value] : [],
      checklists: [],
    };
  });

  return {
    id,
    type: 'timeline',
    x: tableData.x,
    y: tableData.y,
    width: 1000,
    height: 600,
    title: 'Converted from Table',
    startDate: baseDate,
    tasks,
    lanes: [],
  };
}

export function convertTimelineToTable(timelineData: TimelineElementData, id: string): any {
  const rows = (timelineData.tasks || []).map(t => {
    const { startDate, dueDate } = timelineToKanbanDates(timelineData.startDate || new Date().toISOString(), t.startOffset, t.duration);
    let statusText = 'To Do';
    if (t.status === 'in_progress') statusText = 'In Progress';
    if (t.status === 'done') statusText = 'Done';
    
    return {
      id: t.id,
      cells: {
        title: { value: t.title || '' },
        description: { value: t.description || '' },
        status: { value: statusText },
        priority: { value: t.priority || 'Medium' },
        assignee: { value: t.assigneeIds?.[0] || '' },
        labels: { value: t.labelIds?.[0] || '' },
        startDate: { value: startDate },
        dueDate: { value: dueDate },
      }
    };
  });

  return {
    id,
    type: 'table',
    x: timelineData.x,
    y: timelineData.y,
    width: 1000,
    height: 700,
    tableData: {
      columns: [
        { id: 'title', label: 'Title', type: 'text', width: 300, visible: true, isFrozen: true },
        { id: 'description', label: 'Description', type: 'text', width: 250, visible: true },
        { id: 'status', label: 'Status', type: 'status', width: 150, options: ['To Do', 'In Progress', 'Done'], visible: true },
        { id: 'priority', label: 'Priority', type: 'status', width: 120, options: ['Low', 'Medium', 'High', 'Critical'], visible: true },
        { id: 'assignee', label: 'Assignee', type: 'assignee', width: 150, visible: true },
        { id: 'labels', label: 'Labels', type: 'text', width: 150, visible: true },
        { id: 'startDate', label: 'Start Date', type: 'date', width: 150, visible: true },
        { id: 'dueDate', label: 'Due Date', type: 'date', width: 150, visible: true },
      ],
      rows,
      sorts: [],
      filters: [],
    }
  };
}
