import { useState, useEffect } from 'react';
import { getMembersListener, removeMember, updateMemberRole } from '../../services/workspaceService';
import toast from 'react-hot-toast';

export default function MemberList({ workspaceId, isOwner, currentUser }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = getMembersListener(workspaceId, (data) => {
      setMembers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [workspaceId]);

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await updateMemberRole(workspaceId, memberId, newRole);
      toast.success('Role updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update role');
    }
  };

  const handleRemove = async (memberId, memberName) => {
    const confirm = window.confirm(`Remove ${memberName} from workspace?`);
    if (!confirm) return;
    try {
      await removeMember(workspaceId, memberId);
      toast.success('Member removed');
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove member');
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading members...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
      {members.map(member => (
        <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand/20 text-brand flex items-center justify-center font-bold">
              {member.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {member.displayName} {member.id === currentUser?.uid && <span className="text-gray-400 font-normal">(You)</span>}
              </p>
              <p className="text-sm text-gray-500">{member.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isOwner && member.id !== currentUser?.uid ? (
              <select
                value={member.role}
                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                className="text-sm border-gray-300 rounded-md text-gray-700 focus:ring-brand focus:border-brand"
              >
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                {member.role}
              </span>
            )}
            
            {isOwner && member.id !== currentUser?.uid && (
              <button
                onClick={() => handleRemove(member.id, member.displayName)}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
      {members.length === 0 && (
        <div className="p-4 text-sm text-gray-500">No members found.</div>
      )}
    </div>
  );
}
