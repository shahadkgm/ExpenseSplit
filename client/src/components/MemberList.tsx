import React, { useState } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { groupService } from '../services/group.service';
import { IGroup } from '../types';
import toast from 'react-hot-toast';

interface MemberListProps {
  group: IGroup;
  onMemberUpdated: (updatedGroup: IGroup) => void;
}

export const MemberList: React.FC<MemberListProps> = ({ group, onMemberUpdated }) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingMember, setDeletingMember] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMemberName.trim();
    if (!trimmed) return;

    if (group.members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Member already exists in this group');
      return;
    }

    try {
      setLoading(true);
      const updated = await groupService.addMember(group._id, { name: trimmed });
      toast.success(`Added ${trimmed} to group`);
      setNewMemberName('');
      onMemberUpdated(updated);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberName: string) => {
    if (group.members.length <= 1) {
      toast.error('Group must have at least one member');
      return;
    }

    if (!confirm(`Are you sure you want to remove "${memberName}" from this group?`)) {
      return;
    }

    try {
      setDeletingMember(memberName);
      const updated = await groupService.removeMember(group._id, memberName);
      toast.success(`Removed "${memberName}" from group`);
      onMemberUpdated(updated);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setDeletingMember(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          <h4 className="font-bold text-sm text-slate-900">
            Group Members ({group.members.length})
          </h4>
        </div>
        <span className="text-[11px] text-slate-400">Click ✕ to remove</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {group.members.map((m, idx) => (
          <span
            key={idx}
            className="group/item inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <span>{m.name}</span>
            <button
              type="button"
              onClick={() => handleDeleteMember(m.name)}
              disabled={deletingMember === m.name}
              className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors hover:bg-red-50 disabled:opacity-40"
              title={`Remove ${m.name}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          placeholder="New member name..."
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !newMemberName.trim()}
          className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 disabled:opacity-50 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </form>
    </div>
  );
};
