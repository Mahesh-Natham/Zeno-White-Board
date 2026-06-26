import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getWorkspace, updateWorkspace, deleteWorkspace } from '../services/workspaceService';
import MemberList from '../components/dashboard/MemberList';
import InviteMembersModal from '../components/modals/InviteMembersModal';
import { ArrowLeft, Settings, Users, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkspaceSettingsPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const [workspaceName, setWorkspaceName] = useState('');

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const data = await getWorkspace(workspaceId);
        if (data) {
          setWorkspace(data);
          setWorkspaceName(data.name);
        } else {
          toast.error('Workspace not found');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load workspace');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [workspaceId, navigate]);

  const isOwner = workspace?.ownerId === currentUser?.uid;

  const handleSaveName = async () => {
    if (!workspaceName.trim() || !isOwner) return;
    try {
      await updateWorkspace(workspaceId, { name: workspaceName });
      setWorkspace(prev => ({ ...prev, name: workspaceName }));
      toast.success('Workspace updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update workspace');
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this workspace? This action cannot be undone.');
    if (!confirmDelete) return;
    
    try {
      await deleteWorkspace(workspaceId);
      toast.success('Workspace deleted');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete workspace');
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center">
        <button 
          onClick={() => navigate('/dashboard')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Workspace Settings</h1>
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto p-6 flex gap-8">
        {/* Sidebar Nav */}
        <aside className="w-64 shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'general' ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Settings size={18} />
              General
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'members' ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Users size={18} />
              Members
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveTab('danger')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'danger' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100 hover:text-red-600'}`}
              >
                <AlertTriangle size={18} />
                Danger Zone
              </button>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-lg">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Workspace Details</h2>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workspace Name
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    disabled={!isOwner}
                    className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm px-4 border"
                  />
                  {isOwner && (
                    <button
                      onClick={handleSaveName}
                      disabled={workspaceName === workspace?.name}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-dark focus:outline-none disabled:opacity-50"
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Workspace Members</h2>
                {isOwner && (
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-brand bg-brand/10 hover:bg-brand/20 focus:outline-none"
                  >
                    Invite Members
                  </button>
                )}
              </div>
              <MemberList workspaceId={workspaceId} isOwner={isOwner} currentUser={currentUser} />
            </div>
          )}

          {activeTab === 'danger' && isOwner && (
            <div>
              <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <h3 className="text-sm font-medium text-red-800 mb-2">Delete Workspace</h3>
                <p className="text-sm text-red-600 mb-4">
                  Once you delete a workspace, there is no going back. Please be certain.
                </p>
                <button
                  onClick={handleDelete}
                  className="inline-flex justify-center py-2 px-4 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none"
                >
                  Delete this workspace
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <InviteMembersModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        workspaceId={workspaceId} 
      />
    </div>
  );
}
