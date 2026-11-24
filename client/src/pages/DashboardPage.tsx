import React from 'react';
import { Users, Plus, ArrowRight, Layers, Trash2, Calendar } from 'lucide-react';
import { IGroup } from '../types';
import { groupService } from '../services/group.service';
import toast from 'react-hot-toast';

interface DashboardPageProps {
  groups: IGroup[];
  onSelectGroup: (group: IGroup) => void;
  onOpenCreateGroup: () => void;
  onRefreshGroups: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  groups,
  onSelectGroup,
  onOpenCreateGroup,
  onRefreshGroups,
}) => {
  const handleDeleteGroup = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await groupService.deleteGroup(id);
      toast.success(`Group "${name}" deleted`);
      onRefreshGroups();
    } catch {
      toast.error('Failed to delete group');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Expense Groups
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your trips, shared apartments, events, and family budgets.
          </p>
        </div>

        <button
          onClick={onOpenCreateGroup}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Group</span>
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Groups Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Create your first group to start recording shared expenses and calculating debt settlements.
          </p>
          <button
            onClick={onOpenCreateGroup}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Group</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((g) => (
            <div
              key={g._id}
              onClick={() => onSelectGroup(g)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {g.name}
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                    {g.currency || 'INR'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{g.members.length} members</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {g.members.slice(0, 5).map((m, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-600"
                    >
                      {m.name}
                    </span>
                  ))}
                  {g.members.length > 5 && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-500">
                      +{g.members.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={(e) => handleDeleteGroup(e, g._id, g.name)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                  title="Delete group"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <span className="font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Open Expenses <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
