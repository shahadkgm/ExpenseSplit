import React, { useState, useEffect } from 'react';
import { Plus, Users, Receipt, Calendar, ArrowRightLeft, Sparkles, Trash2 } from 'lucide-react';
import { IGroup, IExpense, ISettlementResult } from '../types';
import { expenseService } from '../services/expense.service';
import { groupService } from '../services/group.service';
import { ExpenseTable } from '../components/ExpenseTable';
import { SettlementCard } from '../components/SettlementCard';
import { AddExpenseModal } from '../components/AddExpenseModal';
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

  // Quick Inline Add Expense state for the "Add New Expense" card
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
      // Calls user specification: expenseService.getTripExpenses(tripId)
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

  // Calculation Logic Inside the Page (matching prompt specification)
  const calculateBalances = () => {
    const totals: Record<string, number> = {};
    expenses.forEach((exp) => {
      totals[exp.paidBy] = (totals[exp.paidBy] || 0) + exp.amount;
    });
    return totals;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* 1. Header & Group Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              Active Group / Event
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeGroup.name}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
              {currencySymbol} {activeGroup.currency}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {activeGroup.members.length} members &bull; Total spend: {currencySymbol}
            {totalGroupSpend.toFixed(2)} &bull; Approx. {currencySymbol}
            {totalPerPerson.toFixed(2)}/person
          </p>
        </div>

        {/* Group Selector Dropdown & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={activeGroup._id}
            onChange={(e) => {
              const selected = groups.find((g) => g._id === e.target.value);
              if (selected) onSelectGroup(selected);
            }}
            className="bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-xs"
          >
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteCurrentGroup}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 border border-rose-200/80 rounded-xl transition-all"
            title="Delete this group and all its expenses"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete Group</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left side Expenses, Right side Summary & Settlement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Add New Expense Card + Expenses Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* 2. "Add New Expense" Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Add New Expense</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Advanced / Custom Split &rarr;
              </button>
            </div>

            <form
              onSubmit={handleQuickAddExpense}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3"
            >
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Expense Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dinner, Taxi, Groceries"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Paid By
                </label>
                <select
                  value={quickPaidBy}
                  onChange={(e) => setQuickPaidBy(e.target.value)}
                  className="w-full px-2 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
                >
                  {activeGroup.members.map((m, idx) => (
                    <option key={idx} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={addingExpense}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>{addingExpense ? 'Adding...' : 'Add'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 3. Group Expenses Table */}
          <ExpenseTable
            expenses={expenses}
            group={activeGroup}
            onDeleteExpense={handleDeleteExpense}
            currencySymbol={currencySymbol}
          />
        </div>

        {/* Right Column (4 cols): Who Owes Whom Sidebar + Members */}
        <div className="lg:col-span-4 space-y-6">
          {/* 4. "Who Owes Whom?" Summary Sidebar */}
          <SettlementCard
            settlement={settlement}
            group={activeGroup}
            currencySymbol={currencySymbol}
          />

          {/* Manage Members */}
          <MemberList group={activeGroup} onMemberUpdated={onUpdateGroup} />
        </div>
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
    </div>
  );
};
