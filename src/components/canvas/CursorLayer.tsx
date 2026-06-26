/* eslint-disable react-hooks/refs */
import useCollaborationStore from '../../store/collaborationStore';
import RemoteCursor from './RemoteCursor';

export default function CursorLayer({ stageRef }) {
  const { otherCursors } = useCollaborationStore();

  if (!stageRef.current) return null;

  return (
    <>
      {Object.values(otherCursors).map((cursor: any) => {
        // The coordinates in Firebase are canvas space coordinates.
        // We need to convert them to screen space coordinates to position the HTML element over the canvas container.
        const stage = stageRef.current;
        const transform = stage.getAbsoluteTransform();
        
        // Transform the canvas coordinate to screen coordinate
        const screenPos = transform.point({ x: cursor.x, y: cursor.y });

        return (
          <RemoteCursor
            key={cursor.uid}
            x={screenPos.x}
            y={screenPos.y}
            displayName={cursor.displayName}
            color={cursor.color}
          />
        );
      })}
    </>
  );
}
