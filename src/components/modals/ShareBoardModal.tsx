import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Switch from '@radix-ui/react-switch';
import { X, Copy, CheckCircle2, Globe, Lock } from 'lucide-react';
import { updateBoardPermissions } from '../../services/boardService';
import { getMembersListener } from '../../services/workspaceService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function ShareBoardModal({ isOpen, onClose, board }) {
  const { currentUser } = useAuthStore();
  const [isPublic, setIsPublic] = useState(false);
  const [collaborators, setCollaborators] = useState({});
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (board) {
      const timer = setTimeout(() => {
        setIsPublic(board.isPublic || false);
        setCollaborators(board.collaborators || {});
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [board]);

  useEffect(() => {
    if (board?.workspaceId) {
      const unsubscribe = getMembersListener(board.workspaceId, (members) => {
        setWorkspaceMembers(members);
      });
      return () => unsubscribe();
    }
  }, [board?.workspaceId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const isOwner = board?.ownerId === currentUser?.uid;

  const savePermissions = async (newIsPublic, newCollaborators) => {
    if (!isOwner) return;
    try {
      await updateBoardPermissions(board.id, newIsPublic, newCollaborators);
      toast.success('Permissions updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update permissions');
    }
  };

  const togglePublic = (checked) => {
    setIsPublic(checked);
    savePermissions(checked, collaborators);
  };

  const handleRoleChange = (memberId, newRole) => {
    const newCollaborators = { ...collaborators };
    if (newRole === 'none') {
      delete newCollaborators[memberId];
    } else {
      newCollaborators[memberId] = newRole;
    }
    setCollaborators(newCollaborators);
    savePermissions(isPublic, newCollaborators);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl z-50 p-6 animate-in fade-in zoom-in-95">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-gray-900">
              Share Board
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            {/* Public Link Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isPublic ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                  {isPublic ? <Globe size={18} /> : <Lock size={18} />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Public Link</h4>
                  <p className="text-xs text-gray-500">
                    {isPublic ? 'Anyone with link can view' : 'Only invited members can access'}
                  </p>
                </div>
              </div>
              <Switch.Root
                checked={isPublic}
                onCheckedChange={togglePublic}
                disabled={!isOwner}
                className={`w-11 h-6 bg-gray-200 rounded-full relative shadow-inner focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-colors data-[state=checked]:bg-brand ${!isOwner && 'opacity-50 cursor-not-allowed'}`}
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-md transition-transform transform translate-x-0.5 data-[state=checked]:translate-x-5" />
              </Switch.Root>
            </div>

            {/* Copy Link */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 bg-gray-50 border border-gray-300 rounded-lg text-sm px-3 py-2.5 text-gray-600 focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 bg-brand text-white font-medium text-sm rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2"
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                Copy Link
              </button>
            </div>

            <hr className="border-gray-200" />

            {/* Workspace Members */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Workspace Members</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {workspaceMembers.map(member => {
                  const currentRole = collaborators[member.id] || 'none';
                  const isBoardOwner = board?.ownerId === member.id;

                  return (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand/20 text-brand flex items-center justify-center font-bold text-xs shrink-0">
                          {member.displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.displayName} {member.id === currentUser?.uid && <span className="text-gray-400 font-normal">(You)</span>}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{member.email}</p>
                        </div>
                      </div>
                      
                      {isBoardOwner ? (
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Owner</span>
                      ) : (
                        <select
                          value={currentRole}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          disabled={!isOwner}
                          className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-700 bg-white focus:ring-brand focus:border-brand disabled:opacity-50"
                        >
                          <option value="none">No Access</option>
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
