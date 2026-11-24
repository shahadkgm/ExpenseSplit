import React, { useState } from 'react';
import { X, Users, Plus, Trash2 } from 'lucide-react';
import { groupService } from '../services/group.service';
import { IGroup } from '../types';
import toast from 'react-hot-toast';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (group: IGroup) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupCreated,
}) => {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');
  const [members, setMembers] = useState<string[]>(['Alice', 'Bob', 'Charlie']);
  const [newMember, setNewMember] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddMember = () => {
    const trimmed = newMember.trim();
    if (!trimmed) return;
    if (members.map((m) => m.toLowerCase()).includes(trimmed.toLowerCase())) {
      toast.error('Member already added');
      return;
    }
    setMembers([...members, trimmed]);
    setNewMember('');
  };

  const handleRemoveMember = (index: number) => {
    if (members.length <= 1) {
      toast.error('Group must have at least one member');
      return;
    }
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    if (members.length === 0) {
      toast.error('Please add at least one member');
      return;
    }

    try {
      setLoading(true);
      const created = await groupService.createGroup({
        name: name.trim(),
        currency,
        members: members.map((m) => ({ name: m })),
      });
      toast.success(`Group "${created.name}" created!`);
      onGroupCreated(created);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">Create New Group</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Group / Event Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Goa Trip, Flat 402, Birthday Dinner"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Currency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'INR', symbol: '₹', label: 'INR (₹)' },
                { code: 'USD', symbol: '$', label: 'USD ($)' },
                { code: 'EUR', symbol: '€', label: 'EUR (€)' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.code}
                  onClick={() => setCurrency(c.code as any)}
                  className={`py-2 px-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                    currency === c.code
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Group Members ({members.length})
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Member name..."
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200">
              {members.map((member, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-white text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
                >
                  {member}
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="text-slate-400 hover:text-red-500 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
