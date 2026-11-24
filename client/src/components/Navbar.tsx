import React from 'react';
import { Plus, Calculator, LogOut, UserCheck } from 'lucide-react';
import { IGroup } from '../types';
import { IAuthUser } from '../services/auth.service';

interface NavbarProps {
  groups: IGroup[];
  activeGroup: IGroup | null;
  onSelectGroup: (group: IGroup) => void;
  onOpenCreateGroup: () => void;
  currentTab: 'expenses' | 'dashboard';
  onChangeTab: (tab: 'expenses' | 'dashboard') => void;
  currentUser: IAuthUser | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  groups,
  activeGroup,
  onSelectGroup,
  onOpenCreateGroup,
  currentTab,
  onChangeTab,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Split<span className="text-indigo-600">Easy</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200/60">
                  Expense Master
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Fair & effortless group expense splitting
              </p>
            </div>
          </div>

          {/* Navigation & Group Selector & User Profile */}
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => onChangeTab('expenses')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentTab === 'expenses'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                Expenses
              </button>
              <button
                onClick={() => onChangeTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentTab === 'dashboard'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                Groups
              </button>
            </div>

            {/* Active Group Selector */}
            {groups.length > 0 && (
              <div className="relative hidden sm:block">
                <select
                  value={activeGroup?._id || ''}
                  onChange={(e) => {
                    const found = groups.find((g) => g._id === e.target.value);
                    if (found) onSelectGroup(found);
                  }}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-medium border border-slate-300 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
                >
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name} ({g.currency || 'INR'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Create Group Button */}
            <button
              onClick={onOpenCreateGroup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Group</span>
            </button>

            {/* User Profile Badge & Logout */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="capitalize">{currentUser.displayName || currentUser.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
