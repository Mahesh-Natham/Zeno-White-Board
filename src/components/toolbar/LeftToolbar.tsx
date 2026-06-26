import { useState, useRef, useEffect } from 'react';
import { 
  MousePointer2, 
  Hand,
  Square, 
  Circle, 
  Triangle,
  Pen, 
  StickyNote, 
  Type, 
  MessageSquare,
  ChevronRight,
  Frame,
  LayoutTemplate,
  Columns,
  SmilePlus,
  Plus,
  GripHorizontal,
  GripVertical,
  Blocks,
  Eraser,
  Edit3,
  Wand2,
  SquareDashed,
  ArrowUpRight,
  Spline
} from 'lucide-react';
import useToolStore from '../../store/toolStore';
import { TOOLS } from '../../config/constants';
import ToolButton from './ToolButton';

// Import Custom Flyouts
import ShapeFlyout from './flyouts/ShapeFlyout';
import MoreToolsFlyout from './flyouts/MoreToolsFlyout';
import ColorFlyout from './flyouts/ColorFlyout';
import FrameFlyout from './flyouts/FrameFlyout';
import PenFlyout from './flyouts/PenFlyout';
import CreationFlyout from './flyouts/CreationFlyout';

const TOOL_GROUPS = [
  { id: 'select_group', icon: MousePointer2, label: 'Select / Pan', shortcut: 'V/H', subTools: [
    { id: TOOLS.SELECT, icon: MousePointer2, label: 'Select', shortcut: 'V' },
    { id: TOOLS.HAND, icon: Hand, label: 'Pan', shortcut: 'H', iconClass: 'fill-white stroke-[2.5px]' },
  ]},
  { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
  { id: 'layouts', icon: Columns, label: 'Layouts' },
  { id: TOOLS.STICKY_NOTE, icon: StickyNote, label: 'Sticky Note', shortcut: 'N', hasFlyout: true },
  { id: TOOLS.TEXT, icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'shape_group', icon: Square, label: 'Shape', shortcut: 'S', hasFlyout: true, defaultSubTool: TOOLS.RECTANGLE },
  { id: 'pen_group', icon: Pen, label: 'Pen', shortcut: 'P', hasFlyout: true, defaultSubTool: TOOLS.PEN },
  { id: 'frames_group', icon: Frame, label: 'Frames', shortcut: 'F', hasFlyout: true },
  { id: 'reactions', icon: SmilePlus, label: 'Reactions' },
  { id: TOOLS.COMMENT, icon: MessageSquare, label: 'Comment', shortcut: 'C' },
  { id: 'creation_group', icon: Blocks, label: 'Creation tools', hasFlyout: true },
  { id: 'more_apps', icon: Plus, label: 'More Tools', hasFlyout: true, customClass: 'bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] hover:text-[#1D4ED8]' },
];

export default function LeftToolbar() {
  const { activeTool, setActiveTool, defaultStyles, setDefaultStyle } = useToolStore();
  const [openFlyout, setOpenFlyout] = useState(null);

  // Dragging and layout state
  const [position, setPosition] = useState({ x: 16, y: window.innerHeight / 2 - 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [orientation, setOrientation] = useState('vertical');
  const dragRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      // Keep it within bounds roughly if window resizes
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, initX: position.x, initY: position.y };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({ x: dragRef.current.initX + dx, y: dragRef.current.initY + dy });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    dragRef.current = null;
    e.target.releasePointerCapture(e.pointerId);
  };

  const handleGroupClick = (group) => {
    if (group.subTools || group.hasFlyout) {
      // Toggle flyout
      const isOpening = openFlyout !== group.id;
      setOpenFlyout(isOpening ? group.id : null);
      
      if (isOpening) {
        if (group.subTools && !group.subTools.some(t => t.id === activeTool)) {
          setActiveTool(group.subTools[0].id);
        } else if (!group.subTools && group.defaultSubTool) {
          setActiveTool(group.defaultSubTool);
        } else if (group.id === TOOLS.STICKY_NOTE) {
          setActiveTool(TOOLS.STICKY_NOTE);
        }
      }
    } else {
      setOpenFlyout(null);
      setActiveTool(group.id);
    }
  };

  const handleSubToolClick = (toolId) => {
    setActiveTool(toolId);
    setOpenFlyout(null); // Close flyout on selection
  };

  // Find which group contains the active tool
  const getActiveGroup = () => {
    return TOOL_GROUPS.find(group => {
      if (group.id === activeTool) return true;
      if (group.subTools && group.subTools.some(t => t.id === activeTool)) return true;
      if (group.id === 'shape_group' && [TOOLS.RECTANGLE, TOOLS.CIRCLE, TOOLS.TRIANGLE, TOOLS.RHOMBUS, TOOLS.LINE, TOOLS.ARROW, TOOLS.ELBOW_ARROW, TOOLS.BLOCK_ARROW, TOOLS.DIVIDER].includes(activeTool)) return true;
      if (group.id === 'pen_group' && [TOOLS.PEN, TOOLS.MARKER, TOOLS.SMART_DRAWING, TOOLS.SMART_ARROW, TOOLS.SMART_CONNECTOR, TOOLS.ERASER, TOOLS.AREA_ERASER, TOOLS.LASSO].includes(activeTool)) return true;
      return false;
    });
  };

  const activeGroup = getActiveGroup();

  const handleFrameSelect = (item) => {
    setActiveTool(TOOLS.FRAME);
    if (item.isCustom) {
      setDefaultStyle('width', 800);
      setDefaultStyle('height', 600);
      setDefaultStyle('text', 'Custom Frame');
    } else {
      setDefaultStyle('width', item.width);
      setDefaultStyle('height', item.height);
      setDefaultStyle('text', item.label);
    }
    setOpenFlyout(null);
  };

  return (
    <div 
      className={`absolute flex z-10 pointer-events-auto ${orientation === 'vertical' ? 'flex-row items-start' : 'flex-col items-start'}`}
      style={{ left: position.x, top: position.y }}
    >
      {/* Main Toolbar */}
      <div className={`flex gap-1 p-1.5 bg-white/90 backdrop-blur-md rounded-md shadow-floating border border-gray-100 ${orientation === 'vertical' ? 'flex-col' : 'flex-row items-center'}`}>
        
        {/* Drag Handle */}
        <div 
          className={`flex justify-center items-center text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing ${orientation === 'vertical' ? 'w-full py-1 mb-1' : 'h-full px-1 mr-1'}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={() => setOrientation(o => o === 'vertical' ? 'horizontal' : 'vertical')}
          title="Double-click to rotate toolbar"
        >
          {orientation === 'vertical' ? <GripHorizontal className="w-4 h-4" /> : <GripVertical className="w-4 h-4" />}
        </div>
        {TOOL_GROUPS.map((group) => {
          const isActive = activeGroup?.id === group.id;
          let Icon = group.icon;
          
          if (group.subTools && isActive) {
            const activeSub = group.subTools.find(t => t.id === activeTool);
            if (activeSub) Icon = activeSub.icon;
          } else if (group.id === 'shape_group' && isActive) {
            if (activeTool === TOOLS.CIRCLE) Icon = Circle;
            if (activeTool === TOOLS.TRIANGLE) Icon = Triangle;
            if (activeTool === TOOLS.RHOMBUS) Icon = Square; // placeholder icon
          } else if (group.id === 'pen_group' && isActive) {
            if (activeTool === TOOLS.MARKER) Icon = Edit3;
            if (activeTool === TOOLS.SMART_DRAWING) Icon = Wand2;
            if (activeTool === TOOLS.SMART_ARROW) Icon = ArrowUpRight;
            if (activeTool === TOOLS.SMART_CONNECTOR) Icon = Spline;
            if (activeTool === TOOLS.ERASER || activeTool === TOOLS.AREA_ERASER) Icon = Eraser;
            if (activeTool === TOOLS.LASSO) Icon = SquareDashed;
          }

          return (
            <div key={group.id} className="relative group">
              <ToolButton
                icon={Icon}
                label={group.label}
                shortcut={group.shortcut}
                isActive={isActive}
                onClick={() => handleGroupClick(group)}
                customClass={group.customClass}
                iconClass={group.iconClass}
              />
              {/* Small arrow indicator for sub-tools */}
              {(group.subTools || group.hasFlyout) && (
                <div className="absolute bottom-0.5 right-0.5 pointer-events-none opacity-50">
                   <ChevronRight size={10} className="transform rotate-45" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Flyout Panel */}
      {openFlyout && (
        <div className={`${orientation === 'vertical' ? 'ml-2 slide-in-from-left-2' : 'mt-2 slide-in-from-top-2'} flex items-start animate-in fade-in`}>
          {openFlyout === 'shape_group' && <ShapeFlyout activeTool={activeTool} onSelect={handleSubToolClick} />}
          {openFlyout === 'pen_group' && <PenFlyout activeTool={activeTool} onSelect={handleSubToolClick} activeColor={defaultStyles.stroke} onSelectColor={(c) => { setDefaultStyle('stroke', c); }} activeWidth={defaultStyles.strokeWidth} onSelectWidth={(w) => { setDefaultStyle('strokeWidth', w); }} />}
          {openFlyout === TOOLS.STICKY_NOTE && <ColorFlyout activeColor={defaultStyles.fill} onSelectColor={(c) => { setDefaultStyle('fill', c); setOpenFlyout(null); }} />}
          {openFlyout === 'frames_group' && <FrameFlyout onSelect={handleFrameSelect} />}
          {openFlyout === 'creation_group' && <CreationFlyout onSelect={(toolId) => { setActiveTool(toolId); setOpenFlyout(null); }} />}
          {openFlyout === 'more_apps' && <MoreToolsFlyout onSelect={(toolId) => { setActiveTool(toolId); setOpenFlyout(null); }} />}
          
          {/* Legacy Horizontal Flyouts for Select and Connections */}
          {(openFlyout === 'select_group' || openFlyout === 'connection_group') && (
            <div className="flex flex-row gap-2 p-2 bg-white/90 backdrop-blur-md rounded-md shadow-floating border border-gray-100">
              {TOOL_GROUPS.find(g => g.id === openFlyout)?.subTools.map(sub => (
                <ToolButton
                  key={sub.id}
                  icon={sub.icon}
                  label={sub.label}
                  shortcut={sub.shortcut}
                  isActive={activeTool === sub.id}
                  onClick={() => handleSubToolClick(sub.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
