import { useEffect, useRef } from 'react';
import useAuthStore from '../store/authStore';
import useCollaborationStore from '../store/collaborationStore';
import collaborationService from '../services/collaborationService';
import { CURSOR_COLORS } from '../config/constants';

// Helper to deterministically pick a color based on user ID string
const getUserColor = (userId) => {
  if (!userId) return CURSOR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CURSOR_COLORS.length;
  return CURSOR_COLORS[index];
};

export default function useCollaboration(boardId, stageRef) {
  const { currentUser, userProfile } = useAuthStore();
  const user = currentUser;
  const { setOnlineUsers, setOtherCursors } = useCollaborationStore();
  const lastCursorUpdate = useRef(0);

  // Setup presence and cursor listeners
  useEffect(() => {
    if (!boardId || !user) return;

    const color = getUserColor(user.uid);
    const displayName = userProfile?.displayName || user.email?.split('@')[0] || 'Anonymous';

    // 1. Write our presence to Firebase
    collaborationService.writePresence(boardId, user.uid, displayName, color);

    // 2. Listen to other users' presence
    const unsubscribePresence = collaborationService.subscribeToPresence(boardId, (users) => {
      setOnlineUsers(users);
    });

    // 3. Listen to other users' cursors
    const unsubscribeCursors = collaborationService.subscribeToOtherCursors(boardId, user.uid, (cursorsArray) => {
      const cursorsMap: Record<string, any> = {};
      cursorsArray.forEach(c => {
        cursorsMap[c.id] = {
          uid: c.id,
          x: c.x,
          y: c.y,
          displayName: c.displayName,
          color: c.color
        };
      });
      setOtherCursors(cursorsMap);
    });

    return () => {
      unsubscribePresence();
      unsubscribeCursors();
      collaborationService.clearPresence(boardId, user.uid);
    };
  }, [boardId, user, userProfile, setOnlineUsers, setOtherCursors]);

  // Expose a function to update our cursor position (call this on mouse move)
  const updateCursorPosition = () => {
    if (!boardId || !user || !stageRef.current) return;
    
    const now = Date.now();
    // Throttle cursor updates to ~30fps
    if (now - lastCursorUpdate.current < 30) return;
    
    // Get mouse position relative to stage (canvas coordinates)
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    if (!point) return;

    // Convert screen pointer position to canvas coordinate space
    const transform = stage.getAbsoluteTransform().copy().invert();
    const pos = transform.point(point);

    const color = getUserColor(user.uid);
    const displayName = userProfile?.displayName || user.email?.split('@')[0] || 'Anonymous';

    collaborationService.writeCursor(boardId, user.uid, pos.x, pos.y, displayName, color);
    lastCursorUpdate.current = now;
  };

  return { updateCursorPosition };
}
