import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, CheckCircle2 } from 'lucide-react';
import { createInviteLink } from '../../services/workspaceService';
import toast from 'react-hot-toast';

export default function InviteMembersModal({ isOpen, onClose, workspaceId }) {
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      const inviteId = await createInviteLink(workspaceId, role);
      // Generate full URL
      const link = `${window.location.origin}/join?invite=${inviteId}`;
      setInviteLink(link);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl z-50 p-6 animate-in fade-in zoom-in-95">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-gray-900">
              Invite to Workspace
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role for invited members
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-brand focus:border-brand"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </div>

            {!inviteLink ? (
              <button
                onClick={handleGenerateLink}
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Invite Link'}
              </button>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Share this link</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="flex-1 bg-white border border-gray-300 rounded text-sm px-3 py-2 text-gray-600 focus:outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} className="text-gray-600" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Anyone with this link can join your workspace as a {role}. The link can only be used once.
                </p>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
