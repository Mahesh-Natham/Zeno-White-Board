import useCanvasStore from '../store/canvasStore';
import useAuthStore from '../store/authStore';
import useToolStore from '../store/toolStore';
import { TOOLS } from '../config/constants';
import { createDefaultElement } from '../utils/elementFactory';

/**
 * High-level hook for programmatic management of canvas connectors.
 * Can be used by complex components (like Table, Timeline) to automatically generate
 * or manipulate links between themselves or internal nodes.
 */
export function useConnectors() {
  const { elements, addElement, removeElements, updateElement } = useCanvasStore();
  const { userProfile } = useAuthStore();
  const { defaultStyles } = useToolStore();

  /**
   * Programmatically create a connection between two elements.
   * @param sourceId The ID of the starting element
   * @param targetId The ID of the ending element
   * @param options Optional styles for the connector
   * @param arrowType The type of connector (default: TOOLS.ARROW)
   */
  const createConnection = (sourceId: string, targetId: string, options: any = {}, arrowType: string = TOOLS.ARROW) => {
    if (!elements[sourceId] || !elements[targetId]) {
      console.warn('createConnection: Source or Target element not found.');
      return null;
    }

    const userId = userProfile?.uid || 'anonymous';
    // Use center of source as fallback initialization point
    const startX = elements[sourceId].x + (elements[sourceId].width || 100) / 2;
    const startY = elements[sourceId].y + (elements[sourceId].height || 100) / 2;

    const newConnector = createDefaultElement(arrowType, startX, startY, userId, defaultStyles);
    
    // Explicitly bind the logical ends
    newConnector.startElementId = sourceId;
    newConnector.endElementId = targetId;
    newConnector.points = [0, 0, 0, 0]; // Points are auto-calculated by ElementRenderer

    // Apply any custom styles (e.g. strokeColor, dash)
    Object.assign(newConnector, options);

    addElement(newConnector);
    return newConnector.id;
  };

  /**
   * Returns all connector elements attached to the given element.
   * @param elementId The ID of the element to check
   */
  const getConnectionsForElement = (elementId: string) => {
    return Object.values(elements).filter(el => 
      ['arrow', 'line', 'elbow_arrow'].includes(el.type) && 
      (el.startElementId === elementId || el.endElementId === elementId)
    );
  };

  /**
   * Remove all connections attached to a specific element.
   * Useful when an element is deleted or transformed into a format that doesn't support links.
   * @param elementId The ID of the element whose connections should be removed
   */
  const removeConnectionsForElement = (elementId: string) => {
    const connections = getConnectionsForElement(elementId);
    if (connections.length > 0) {
      removeElements(connections.map(c => c.id));
    }
  };

  /**
   * Retargets an existing connection to a new element.
   */
  const updateConnectionTarget = (connectionId: string, newTargetId: string, isStart: boolean = false) => {
    const connection = elements[connectionId];
    if (!connection) return;

    if (isStart) {
      updateElement(connectionId, { startElementId: newTargetId });
    } else {
      updateElement(connectionId, { endElementId: newTargetId });
    }
  };

  return {
    createConnection,
    getConnectionsForElement,
    removeConnectionsForElement,
    updateConnectionTarget
  };
}

export default useConnectors;
