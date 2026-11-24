import React from 'react';
import { Users, Plus, ArrowRight, Trash2 } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Expense Groups
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Manage trips, shared rents, events, and group budgets.
          </p>
        </div>

        <button
          onClick={onOpenCreateGroup}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Group</span>
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="py-12 sm:py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 sm:mb-4">
            <Users className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">No Groups Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Create your first group to start recording shared expenses and calculating debt settlements.
          </p>
          <button
            onClick={onOpenCreateGroup}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Group</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {groups.map((g) => (
            <div
              key={g._id}
              onClick={() => onSelectGroup(g)}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400 p-4 sm:p-6 shadow-xs hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2.5 mb-2 sm:mb-3">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-indigo-600 transition-colors break-words">
                    {g.name}
                  </h3>
                  <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase shrink-0">
                    {g.currency || 'INR'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3 sm:mb-4">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{g.members.length} members</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4 sm:mb-6">
                  {g.members.slice(0, 4).map((m, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                    >
                      {m.name}
                    </span>
                  ))}
                  {g.members.length > 4 && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                      +{g.members.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={(e) => handleDeleteGroup(e, g._id, g.name)}
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition-colors hover:bg-red-50"
                  title="Delete group"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <span className="font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
                  View Expenses <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
