import React, { useState, useEffect } from 'react';
import { X, Edit3, DollarSign } from 'lucide-react';
import { expenseService } from '../services/expense.service';
import { IGroup, IExpense } from '../types';
import toast from 'react-hot-toast';

interface EditExpenseModalProps {
  isOpen: boolean;
  expense: IExpense | null;
  group: IGroup;
  onClose: () => void;
  onExpenseUpdated: (updated: IExpense) => void;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  expense,
  group,
  onClose,
  onExpenseUpdated,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<'All' | 'custom'>('All');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(String(expense.amount));
      setPaidBy(expense.paidBy);
      if (expense.splitAmong === 'All' || !Array.isArray(expense.splitAmong)) {
        setSplitType('All');
        setSelectedMembers(group.members.map((m) => m.name));
      } else {
        setSplitType('custom');
        setSelectedMembers(expense.splitAmong);
      }
    }
  }, [expense, group.members]);

  if (!isOpen || !expense) return null;

  const currencySymbol =
    group.currency === 'USD' ? '$' : group.currency === 'EUR' ? '€' : '₹';

  const handleToggleMember = (name: string) => {
    if (selectedMembers.includes(name)) {
      if (selectedMembers.length <= 1) {
        toast.error('At least one member must share the expense');
        return;
      }
      setSelectedMembers(selectedMembers.filter((m) => m !== name));
    } else {
      setSelectedMembers([...selectedMembers, name]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim()) {
      toast.error('Please enter expense title');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const splitAmong = splitType === 'All' ? 'All' : selectedMembers;
      const updated = await expenseService.updateExpense(expense._id, {
        title: title.trim(),
        amount: numAmount,
        paidBy,
        splitAmong,
      });

      toast.success(`Expense updated to ${currencySymbol}${numAmount.toFixed(2)}!`);
      onExpenseUpdated(updated);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">Edit Expense Amount</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Update expense details & share</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Highlighted Amount Field */}
          <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100">
            <label className="block text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
              Expense Amount ({currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-indigo-500 font-extrabold text-base">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-extrabold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Title / Description
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Paid By
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base sm:text-sm font-medium bg-white"
            >
              {group.members.map((m, idx) => (
                <option key={idx} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Split Option
              </label>
              <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSplitType('All')}
                  className={`px-2.5 py-1 rounded-md transition-all text-xs ${
                    splitType === 'All'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  All ({group.members.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('custom')}
                  className={`px-2.5 py-1 rounded-md transition-all text-xs ${
                    splitType === 'custom'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {splitType === 'custom' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="text-[11px] text-slate-500">
                  Select members who will share this expense:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.members.map((m, idx) => {
                    const isChecked = selectedMembers.includes(m.name);
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleToggleMember(m.name)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                          isChecked
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
