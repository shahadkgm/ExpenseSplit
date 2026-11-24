import React, { useState, useEffect } from 'react';
import { Plus, Users, Receipt, Calendar, ArrowRightLeft, Sparkles, Trash2, Wallet } from 'lucide-react';
import { IGroup, IExpense, ISettlementResult } from '../types';
import { expenseService } from '../services/expense.service';
import { groupService } from '../services/group.service';
import { ExpenseTable } from '../components/ExpenseTable';
import { SettlementCard } from '../components/SettlementCard';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { EditExpenseModal } from '../components/EditExpenseModal';
import { MemberList } from '../components/MemberList';
import toast from 'react-hot-toast';

interface ExpenseSplitPageProps {
  activeGroup: IGroup;
  groups: IGroup[];
  onSelectGroup: (group: IGroup) => void;
  onUpdateGroup: (updated: IGroup) => void;
  onOpenCreateGroup: () => void;
  onDeleteGroup: (groupId: string) => void;
}

export const ExpenseSplitPage: React.FC<ExpenseSplitPageProps> = ({
  activeGroup,
  groups,
  onSelectGroup,
  onUpdateGroup,
  onOpenCreateGroup,
  onDeleteGroup,
}) => {
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [settlement, setSettlement] = useState<ISettlementResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<IExpense | null>(null);
  const [mobileSection, setMobileSection] = useState<'expenses' | 'settlement'>('expenses');

  // Quick Inline Add Expense state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickPaidBy, setQuickPaidBy] = useState(activeGroup.members[0]?.name || '');
  const [addingExpense, setAddingExpense] = useState(false);

  const currencySymbol =
    activeGroup.currency === 'USD' ? '$' : activeGroup.currency === 'EUR' ? '€' : '₹';

  // Ensure quickPaidBy updates when group changes
  useEffect(() => {
    if (activeGroup.members.length > 0) {
      setQuickPaidBy(activeGroup.members[0].name);
    }
    loadData();
  }, [activeGroup._id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expenseList, settlementData] = await Promise.all([
        expenseService.getTripExpenses(activeGroup._id),
        expenseService.getSettlement(activeGroup._id),
      ]);
      setExpenses(expenseList);
      setSettlement(settlementData);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      toast.error('Failed to load group expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(quickAmount);
    if (!quickTitle.trim()) {
      toast.error('Please enter expense title');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setAddingExpense(true);
      await expenseService.addExpense({
        groupId: activeGroup._id,
        tripId: activeGroup._id,
        title: quickTitle.trim(),
        amount: numAmount,
        paidBy: quickPaidBy || activeGroup.members[0]?.name || 'Member',
        splitAmong: 'All',
      });

      toast.success(`Expense "${quickTitle}" added!`);
      setQuickTitle('');
      setQuickAmount('');
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setAddingExpense(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseService.deleteExpense(expenseId);
      toast.success('Expense removed');
      await loadData();
    } catch (err: any) {
      toast.error('Failed to delete expense');
    }
  };

  const handleDeleteCurrentGroup = async () => {
    if (
      !confirm(
        `Are you sure you want to delete group "${activeGroup.name}" and all its expenses? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await groupService.deleteGroup(activeGroup._id);
      toast.success(`Group "${activeGroup.name}" deleted`);
      onDeleteGroup(activeGroup._id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete group');
    }
  };

  const totalGroupSpend = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const totalPerPerson = expenses.reduce(
    (acc, exp) =>
      acc +
      exp.amount /
        Math.max(
          Array.isArray(exp.splitAmong) ? exp.splitAmong.length : activeGroup.members.length,
          1
        ),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 animate-fade-in relative pb-20 sm:pb-8">
      {/* 1. Header & Group Info */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Active Group
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                {currencySymbol} {activeGroup.currency}
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
              {activeGroup.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>{activeGroup.members.length} members</span>
              <span>&bull;</span>
              <span>Spend: <strong className="text-slate-800">{currencySymbol}{totalGroupSpend.toFixed(2)}</strong></span>
              <span>&bull;</span>
              <span>~{currencySymbol}{totalPerPerson.toFixed(2)}/person</span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteCurrentGroup}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 border border-rose-200/80 rounded-xl transition-all"
              title="Delete group"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Delete Group</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE TAB TOGGLE: Expenses vs Settlements (< 1024px)     */}
      {/* ======================================================== */}
      <div className="lg:hidden flex bg-slate-200/80 p-1 rounded-2xl text-xs font-bold text-slate-600">
        <button
          type="button"
          onClick={() => setMobileSection('expenses')}
          className={`flex-1 py-2 sm:py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileSection === 'expenses'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Expenses ({expenses.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileSection('settlement')}
          className={`flex-1 py-2 sm:py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileSection === 'settlement'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Who Owes Whom ({settlement?.settlements.length || 0})</span>
        </button>
      </div>

      {/* Main Grid: Left side Expenses, Right side Summary & Settlement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column (8 cols): Add New Expense Card + Expenses Table */}
        <div
          className={`lg:col-span-8 space-y-5 sm:space-y-6 ${
            mobileSection === 'expenses' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Quick Add Expense Card */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">Quick Add Expense</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Custom Split &rarr;
              </button>
            </div>

            <form onSubmit={handleQuickAddExpense} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dinner, Taxi, Hotel"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    className="w-full px-3 py-2 text-base sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 sm:contents gap-2.5">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Amount ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={quickAmount}
                      onChange={(e) => setQuickAmount(e.target.value)}
                      className="w-full px-3 py-2 text-base sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Paid By
                    </label>
                    <select
                      value={quickPaidBy}
                      onChange={(e) => setQuickPaidBy(e.target.value)}
                      className="w-full px-2.5 py-2 text-base sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                    >
                      {activeGroup.members.map((m, idx) => (
                        <option key={idx} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={addingExpense}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{addingExpense ? 'Adding...' : 'Add Expense (Split with all)'}</span>
              </button>
            </form>
          </div>

          {/* Group Expenses Table / Mobile Cards */}
          <ExpenseTable
            expenses={expenses}
            group={activeGroup}
            onDeleteExpense={handleDeleteExpense}
            onEditExpense={(exp) => setEditingExpense(exp)}
            currencySymbol={currencySymbol}
          />
        </div>

        {/* Right Column (4 cols): Who Owes Whom Sidebar + Members */}
        <div
          className={`lg:col-span-4 space-y-5 sm:space-y-6 ${
            mobileSection === 'settlement' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Who Owes Whom & Summary */}
          <SettlementCard
            settlement={settlement}
            group={activeGroup}
            currencySymbol={currencySymbol}
          />

          {/* Manage Members */}
          <MemberList group={activeGroup} onMemberUpdated={onUpdateGroup} />
        </div>
      </div>

      {/* Floating Action Button on Mobile (Only visible when scrolled on phones) */}
      <div className="lg:hidden fixed bottom-5 right-5 z-20">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-13 h-13 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/40 flex items-center justify-center active:scale-95 transition-all"
          title="Add expense"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Advanced Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        group={activeGroup}
        onExpenseAdded={async () => {
          await loadData();
        }}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={!!editingExpense}
        expense={editingExpense}
        group={activeGroup}
        onClose={() => setEditingExpense(null)}
        onExpenseUpdated={async () => {
          await loadData();
        }}
      />
    </div>
  );
};
