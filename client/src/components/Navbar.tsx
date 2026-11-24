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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                  Split<span className="text-indigo-600">Easy</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full border border-indigo-200/60 hidden xs:inline-block">
                  Master
                </span>
              </div>
            </div>
          </div>

          {/* Center: Tabs (Expenses / Groups) */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => onChangeTab('expenses')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all ${
                currentTab === 'expenses'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => onChangeTab('dashboard')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Groups
            </button>
          </div>

          {/* Right Section: Desktop Group Selector + New Group + User Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop Group Dropdown */}
            {groups.length > 0 && (
              <div className="relative hidden md:block">
                <select
                  value={activeGroup?._id || ''}
                  onChange={(e) => {
                    const found = groups.find((g) => g._id === e.target.value);
                    if (found) onSelectGroup(found);
                  }}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300 rounded-xl px-2.5 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* New Group Button */}
            <button
              onClick={onOpenCreateGroup}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all"
              title="Create new group"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Group</span>
            </button>

            {/* User Profile Badge & Logout */}
            {currentUser && (
              <div className="flex items-center gap-1 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
                <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold" title={currentUser.displayName || currentUser.username}>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="capitalize hidden sm:inline">{currentUser.displayName || currentUser.username}</span>
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

        {/* Mobile Group Quick Bar (Shown only on small screens <768px when on Expenses tab) */}
        {groups.length > 0 && currentTab === 'expenses' && (
          <div className="md:hidden py-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Active:
            </span>
            <select
              value={activeGroup?._id || ''}
              onChange={(e) => {
                const found = groups.find((g) => g._id === e.target.value);
                if (found) onSelectGroup(found);
              }}
              className="flex-1 min-w-0 bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer truncate"
            >
              {groups.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name} ({g.currency || 'INR'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </header>
  );
};
