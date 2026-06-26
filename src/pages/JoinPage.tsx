import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getInvite, acceptInviteLink } from '../services/workspaceService';
import toast from 'react-hot-toast';

export default function JoinPage() {
  const [searchParams] = useSearchParams();
  const inviteId = searchParams.get('invite');
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteData, setInviteData] = useState(null);

  useEffect(() => {
    if (!inviteId) {
      const timer = setTimeout(() => {
        setError('Invalid invite link');
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const fetchInvite = async () => {
      try {
        const invite = await getInvite(inviteId);
        if (!invite) {
          setError('Invite not found');
        } else if (invite.status !== 'pending') {
          setError('This invite link has already been used or expired');
        } else {
          setInviteData(invite);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load invite');
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [inviteId]);

  const handleAccept = async () => {
    try {
      setLoading(true);
      await acceptInviteLink(inviteId, currentUser);
      toast.success('Successfully joined the workspace!');
      // Assuming workspace selection logic is handled in Dashboard
      // or we just navigate to dashboard and it loads their workspaces
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to accept invite');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
        {error ? (
          <div>
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div>
            <div className="text-brand text-5xl mb-4">👋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You've been invited!</h2>
            <p className="text-gray-600 mb-6">
              You have been invited to join a workspace as a <strong>{inviteData?.role}</strong>.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
              >
                Accept Invite
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
