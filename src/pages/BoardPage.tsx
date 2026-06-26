import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useBoardStore from '../store/boardStore';
import BoardLayout from '../components/layout/BoardLayout';

import AccessDeniedPage from './AccessDeniedPage';
import useAuthStore from '../store/authStore';

function canUserEditBoard(board, userId) {
  if (!board || !userId) return false;
  if (board.ownerId === userId) return true;
  const role = board.collaborators?.[userId];
  return role === 'editor' || role === 'owner';
}

function canUserViewBoard(board, userId) {
  if (!board) return false;
  if (board.isPublic) return true;
  if (!userId) return false;
  if (board.ownerId === userId) return true;
  return !!board.collaborators?.[userId];
}

export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { fetchBoard, activeBoard } = useBoardStore();
  const { currentUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBoard() {
      try {
        setLoading(true);
        setError(null);
        await fetchBoard(boardId);
      } catch (err) {
        console.error("Failed to load board:", err);
        setError("Board not found.");
      } finally {
        setLoading(false);
      }
    }
    
    if (boardId) {
      loadBoard();
    }
  }, [boardId, fetchBoard]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-canvas-bg text-gray-500 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p>Loading board...</p>
      </div>
    );
  }

  if (error || !activeBoard) {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-canvas-bg gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Oops!</h2>
        <p className="text-gray-600">{error || "Board could not be loaded."}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const canView = canUserViewBoard(activeBoard, currentUser?.uid);
  const canEdit = canUserEditBoard(activeBoard, currentUser?.uid);

  if (!canView) {
    return <AccessDeniedPage />;
  }

  return <BoardLayout board={activeBoard} isReadOnly={!canEdit} />;
}
