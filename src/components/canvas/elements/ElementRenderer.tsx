import { memo } from 'react';
import { TOOLS } from '../../../config/constants';
import RectangleElement from './RectangleElement';
import CircleElement from './CircleElement';
import TriangleElement from './TriangleElement';
import LineElement from './LineElement';
import ArrowElement from './ArrowElement';
import FreehandElement from './FreehandElement';
import StickyNoteElement from './StickyNoteElement';
import TextElement from './TextElement';
import RhombusElement from './RhombusElement';
import DividerElement from './DividerElement';
import MarkerElement from './MarkerElement';
import ElbowArrowElement from './ElbowArrowElement';
import BlockArrowElement from './BlockArrowElement';
import FrameElement from './FrameElement';
import ImageElement from './ImageElement';
import { TimelineElement } from './TimelineElement';
import KanbanElement from './kanban/KanbanElement';
import TableElement from './table/TableElement';
import GoogleWorkspaceElement from './GoogleWorkspaceElement';
import { CanvasElementErrorBoundary } from '../../shared/ErrorBoundary';

import { getSmartConnectorPoints } from '../../../utils/canvasUtils';
import useCanvasStore from '../../../store/canvasStore';
import useUiStore from '../../../store/uiStore';

// Connector element types that depend on allElements for smart routing
const CONNECTOR_TYPES = new Set([TOOLS.ARROW, TOOLS.ELBOW_ARROW, TOOLS.LINE]);

interface ElementRendererProps {
  id: string;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (e: any, id: string) => void;
  onChange: (id: string, newProps: any) => void;
  onDoubleClick: (element: any) => void;
  
  // For preview elements that aren't in the store
  previewElement?: any;
}

/**
 * Custom equality for React.memo:
 * We only need to check props, because Zustand handles the store subscriptions.
 */
function arePropsEqual(prev: ElementRendererProps, next: ElementRendererProps) {
  if (prev.id !== next.id) return false;
  if (prev.isSelected !== next.isSelected) return false;
  if (prev.isEditing !== next.isEditing) return false;
  if (prev.previewElement !== next.previewElement) return false;
  return true;
}

function ElementRendererInner({ 
  id, 
  isSelected, 
  isEditing, 
  onSelect, 
  onChange, 
  onDoubleClick, 
  previewElement
}: ElementRendererProps) {
  
  const storeElement = useCanvasStore(state => state.elements[id]);
  const dragOffsets = useUiStore(state => state.dragOffsets[id]);
  const element = previewElement || storeElement;
  
  // Connectors need allElements for routing
  const allElements = useCanvasStore(state => 
    element && CONNECTOR_TYPES.has(element.type) ? state.elements : null
  );

  if (!element) return null;

  let renderElement = element;
  if (dragOffsets) {
    renderElement = { ...element, x: element.x + dragOffsets.x, y: element.y + dragOffsets.y };
  }

  // Smart routing for arrows/lines
  if (CONNECTOR_TYPES.has(element.type) && allElements && (element.startElementId || element.endElementId)) {
    const points = getSmartConnectorPoints(element, allElements);
    renderElement = {
      ...element,
      x: 0,
      y: 0,
      points
    };
  }

  const commonProps = {
    element: renderElement,
    isSelected,
    isEditing,
    onSelect,
    onChange,
    onDoubleClick,
    allElements: allElements || {},
  };

  let child;
  switch (renderElement.type) {
    case TOOLS.RECTANGLE:   child = <RectangleElement {...commonProps} />; break;
    case TOOLS.CIRCLE:      child = <CircleElement {...commonProps} />; break;
    case TOOLS.TRIANGLE:    child = <TriangleElement {...commonProps} />; break;
    case TOOLS.RHOMBUS:     child = <RhombusElement {...commonProps} />; break;
    case TOOLS.DIVIDER:     child = <DividerElement {...commonProps} />; break;
    case TOOLS.LINE:        child = <LineElement {...commonProps} />; break;
    case TOOLS.ARROW:       child = <ArrowElement {...commonProps} />; break;
    case TOOLS.ELBOW_ARROW: child = <ElbowArrowElement {...commonProps} />; break;
    case TOOLS.BLOCK_ARROW: child = <BlockArrowElement {...commonProps} />; break;
    case TOOLS.FRAME:       child = <FrameElement {...commonProps} />; break;
    case TOOLS.IMAGE:       child = <ImageElement {...commonProps} />; break;
    case TOOLS.TIMELINE:
      return <TimelineElement {...commonProps} />;
    case TOOLS.KANBAN:
      return <KanbanElement {...commonProps} />;
    case TOOLS.TABLE:
      return <TableElement {...commonProps} />;
    case TOOLS.GOOGLE_WORKSPACE:
      return <GoogleWorkspaceElement {...commonProps} />;
    case TOOLS.PEN:
    case TOOLS.SMART_DRAWING:
    case TOOLS.SMART_ARROW:
    case TOOLS.SMART_CONNECTOR:
      child = <FreehandElement {...commonProps} />; break;
    case TOOLS.MARKER:      child = <MarkerElement {...commonProps} />; break;
    case TOOLS.STICKY_NOTE: child = <StickyNoteElement {...commonProps} />; break;
    case TOOLS.TEXT:        child = <TextElement {...commonProps} />; break;
    default:
      console.warn(`No renderer found for element type: ${renderElement.type}`);
      return null;
  }

  return (
    <CanvasElementErrorBoundary
      element={renderElement}
      elementId={renderElement.id}
      elementType={renderElement.type}
    >
      {child}
    </CanvasElementErrorBoundary>
  );
}

const ElementRenderer = memo(ElementRendererInner, arePropsEqual);
ElementRenderer.displayName = 'ElementRenderer';
export default ElementRenderer;

