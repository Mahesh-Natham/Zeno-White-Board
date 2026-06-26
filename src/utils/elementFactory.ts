import { v4 as uuidv4 } from 'uuid';
import { TOOLS } from '../config/constants';
import { KanbanData } from '../components/canvas/elements/kanban/types';

export const createDefaultElement = (type: string, x: number, y: number, authorId: string, defaultStyles: any = {}) => {
  const base = {
    id: uuidv4(),
    type,
    x,
    y,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    locked: false,
    authorId,
    createdAt: Date.now(),
    opacity: 1,
    ...defaultStyles,
  };

  switch (type) {
    case TOOLS.RECTANGLE:
    case TOOLS.CIRCLE:
    case TOOLS.TRIANGLE:
    case TOOLS.RHOMBUS:
    case TOOLS.DIVIDER:
      return {
        ...base,
        width: 0,
        height: 0,
        fill: defaultStyles.fill || 'transparent',
        stroke: defaultStyles.stroke || '#000000',
        strokeWidth: defaultStyles.strokeWidth || 2,
      };
      
    case TOOLS.MARKER:
    case TOOLS.PEN:
    case TOOLS.SMART_DRAWING:
    case TOOLS.SMART_ARROW:
    case TOOLS.SMART_CONNECTOR:
      return {
        ...base,
        points: [0, 0],
        stroke: defaultStyles.stroke || '#000000',
        strokeWidth: type === TOOLS.MARKER ? 16 : (defaultStyles.strokeWidth || 2),
      };

    case TOOLS.LINE:
    case TOOLS.ARROW:
    case TOOLS.ELBOW_ARROW:
      return {
        ...base,
        points: [0, 0, 0, 0],
        stroke: defaultStyles.stroke || '#000000',
        strokeWidth: defaultStyles.strokeWidth || 2,
      };

    case TOOLS.BLOCK_ARROW:
      return {
        ...base,
        width: 100,
        height: 60,
        fill: defaultStyles.fill || '#e5e7eb',
        stroke: defaultStyles.stroke || '#000000',
        strokeWidth: defaultStyles.strokeWidth || 2,
      };

    case TOOLS.FRAME:
      return {
        ...base,
        width: defaultStyles.width || 800,
        height: defaultStyles.height || 600,
        text: defaultStyles.text || 'Frame',
        fill: 'transparent',
      };

    case TOOLS.TIMELINE: {
      const g1Id = uuidv4();
      const g2Id = uuidv4();
      const g3Id = uuidv4();
      
      const r1_1 = uuidv4();
      const r1_2 = uuidv4();
      const r2_1 = uuidv4();
      const r2_2 = uuidv4();
      const r3_1 = uuidv4();
      const r3_2 = uuidv4();

      const t1Id = uuidv4();
      const t2Id = uuidv4();
      const t3Id = uuidv4();
      const t4Id = uuidv4();
      const t5Id = uuidv4();
      const t6Id = uuidv4();
      return {
        ...base,
        width: 900,
        height: 600,
        viewScale: 'weeks', // 'days', 'weeks', 'months'
        startDate: new Date().toISOString(),
        sidebarWidth: 200,
        lanes: [
          {
            id: g1Id, title: 'Group 1', type: 'group', isExpanded: true, children: [
              { id: r1_1, title: 'Record 1', type: 'record' },
              { id: r1_2, title: 'Record 2', type: 'record' }
            ]
          },
          {
            id: g2Id, title: 'Group 2', type: 'group', isExpanded: true, children: [
              { id: r2_1, title: 'Record 1', type: 'record' },
              { id: r2_2, title: 'Record 2', type: 'record' }
            ]
          },
          {
            id: g3Id, title: 'Group 3', type: 'group', isExpanded: true, children: [
              { id: r3_1, title: 'Record 1', type: 'record' },
              { id: r3_2, title: 'Record 2', type: 'record' }
            ]
          }
        ],
        tasks: [
          { id: t1Id, title: 'First Task', laneId: r1_1, startOffset: 0, duration: 7, color: '#fca5a5', dependencies: [] },
          { id: t4Id, title: 'Analysis', laneId: r1_2, startOffset: 3, duration: 5, color: '#93c5fd', dependencies: [] },
          { id: t5Id, title: 'Design', laneId: r2_1, startOffset: 6, duration: 6, color: '#86efac', dependencies: [] },
          { id: t2Id, title: 'Second Task', laneId: r2_2, startOffset: 10, duration: 10, color: '#c084fc', dependencies: [t1Id] },
          { id: t3Id, title: 'Third Task', laneId: r3_1, startOffset: 24, duration: 7, color: '#fcd34d', dependencies: [t2Id] },
          { id: t6Id, title: 'Review', laneId: r3_2, startOffset: 26, duration: 5, color: '#f9a8d4', dependencies: [] }
        ],
      };
    }
    
    case TOOLS.KANBAN: {
      const kanbanData: KanbanData = {
        title: 'New Project Board',
        background: 'transparent',
        labels: [],
        settings: {
          wipLimitsEnabled: false,
          cardNumbersEnabled: true,
          columnWidth: 280,
        },
        nextCardNumber: 4,
        columns: [
          { id: 'col-records', title: 'Records', position: 500, color: '#F3F4F6', isDone: false, isCollapsed: false },
          { id: 'col-1', title: 'To Do', position: 1000, color: '#CBD5E1', isDone: false, isCollapsed: false },
          { id: 'col-2', title: 'In Progress', position: 2000, color: '#93C5FD', isDone: false, isCollapsed: false },
          { id: 'col-3', title: 'Done', position: 3000, color: '#86EFAC', isDone: true, isCollapsed: false },
        ],
        cards: [
          {
            id: 'card-1', columnId: 'col-1', number: 1, title: 'Set up project structure', description: 'Initialize the repo and install dependencies.', position: 1000,
            assigneeIds: [], labelIds: [], priority: 'high', checklists: [], commentCount: 0, attachmentCount: 0, isArchived: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: authorId
          },
          {
            id: 'card-2', columnId: 'col-1', number: 2, title: 'Design system', description: 'Create basic UI components and theme variables.', position: 2000,
            assigneeIds: [], labelIds: [], priority: 'medium', checklists: [], commentCount: 0, attachmentCount: 0, isArchived: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: authorId
          },
          {
            id: 'card-3', columnId: 'col-2', number: 3, title: 'Auth integration', description: 'Wire up Firebase authentication.', position: 1000,
            assigneeIds: [], labelIds: [], priority: 'critical', checklists: [], commentCount: 0, attachmentCount: 0, isArchived: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: authorId
          }
        ]
      };

      return {
        ...base,
        width: 1000,
        height: 700,
        kanbanData,
      };
    }

    case TOOLS.TABLE: {
      return {
        ...base,
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
          rows: Array.from({ length: 5 }).map((_, i) => ({
            id: `row-${i + 1}`,
            cells: {
              title: { value: i === 0 ? 'Implement Table' : `Task ${i + 1}` },
              description: { value: '' },
              status: { value: i === 0 ? 'In Progress' : 'To Do' },
              priority: { value: i === 0 ? 'High' : 'Medium' },
              assignee: { value: 'John Doe' },
              labels: { value: '' },
              startDate: { value: new Date().toISOString() },
              dueDate: { value: '' },
            }
          })),
          sorts: [],
          filters: [],
        }
      };
    }

    case TOOLS.STICKY_NOTE:
      return {
        ...base,
        width: 200,
        height: 200,
        fill: defaultStyles.fill || '#FFF9B1',
        stroke: 'transparent',
        strokeWidth: 1,
        text: '',
        textColor: '#000000',
        fontSize: 64,
        fontFamily: 'Inter',
        align: 'center',
        fontStyle: 'normal',
        textDecoration: 'none',
      };

    case TOOLS.TEXT:
      return {
        ...base,
        width: 200, // Initial default width
        height: 50,
        text: '',
        textColor: defaultStyles.textColor || '#000000',
        fontSize: 32,
        fontFamily: 'Inter',
        align: 'left',
        fontStyle: 'normal',
        textDecoration: 'none',
      };



    default:
      return base;
  }
};
