import { Group, Unlock, Lock, Trash2, ArrowUpToLine, ArrowDownToLine } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';
import { v4 as uuidv4 } from 'uuid';

export default function ContextMenu({ position, onClose }) {
  const { 
    elements, 
    selectedIds, 
    removeElements, 
    moveToFront, 
    moveToBack, 
    performAction 
  } = useCanvasStore();

  if (!position) return null;

  const handleGroup = () => {
    const groupId = uuidv4();
    const updates = selectedIds.map(id => ({
      id,
      oldProps: { groupId: elements[id]?.groupId || null },
      newProps: { groupId }
    }));
    performAction({ type: 'UPDATE', updates });
    onClose();
  };

  const handleUngroup = () => {
    const updates = selectedIds.map(id => ({
      id,
      oldProps: { groupId: elements[id]?.groupId || null },
      newProps: { groupId: null }
    }));
    performAction({ type: 'UPDATE', updates });
    onClose();
  };

  const handleLock = () => {
    const updates = selectedIds.map(id => ({
      id,
      oldProps: { locked: elements[id]?.locked || false },
      newProps: { locked: true }
    }));
    performAction({ type: 'UPDATE', updates });
    onClose();
  };

  const handleUnlock = () => {
    const updates = selectedIds.map(id => ({
      id,
      oldProps: { locked: elements[id]?.locked || false },
      newProps: { locked: false }
    }));
    performAction({ type: 'UPDATE', updates });
    onClose();
  };

  const handleDelete = () => {
    removeElements(selectedIds);
    onClose();
  };

  const handleToFront = () => {
    selectedIds.forEach(id => moveToFront(id));
    onClose();
  };

  const handleToBack = () => {
    selectedIds.forEach(id => moveToBack(id));
    onClose();
  };

  // Determine context state
  const hasMultiple = selectedIds.length > 1;
  const isGrouped = selectedIds.length > 0 && selectedIds.every(id => elements[id]?.groupId);
  const isLocked = selectedIds.length > 0 && selectedIds.every(id => elements[id]?.locked);

  return (
    <>
      {/* Invisible backdrop to catch clicks outside the menu */}
      <div 
        className="fixed inset-0 z-40" 
        onContextMenu={(e) => { e.preventDefault(); onClose(); }}
        onClick={onClose} 
      />
      <div 
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 w-48 animate-in fade-in zoom-in-95 duration-100"
        style={{ left: position.x, top: position.y }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {hasMultiple && !isGrouped && (
          <button onClick={handleGroup} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left">
            <Group size={16} /> Group
          </button>
        )}
        {isGrouped && (
          <button onClick={handleUngroup} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left">
            <Unlock size={16} /> Ungroup
          </button>
        )}

        <hr className="my-1 border-gray-100" />

        <button onClick={handleToFront} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left">
          <ArrowUpToLine size={16} /> Bring to Front
        </button>
        <button onClick={handleToBack} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left">
          <ArrowDownToLine size={16} /> Send to Back
        </button>

        <hr className="my-1 border-gray-100" />

        {isLocked ? (
          <button onClick={handleUnlock} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left">
            <Unlock size={16} /> Unlock
          </button>
        ) : (
          <button onClick={handleLock} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left">
            <Lock size={16} /> Lock
          </button>
        )}

        <hr className="my-1 border-gray-100" />

        <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left">
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </>
  );
}
