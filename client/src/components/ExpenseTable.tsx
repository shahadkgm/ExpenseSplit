import React from 'react';
import { Trash2, Calendar, User, Users, Receipt } from 'lucide-react';
import { IExpense, IGroup } from '../types';

interface ExpenseTableProps {
  expenses: IExpense[];
  group: IGroup;
  onDeleteExpense: (id: string) => void;
  currencySymbol: string;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  group,
  onDeleteExpense,
  currencySymbol,
}) => {
  const totalSpend = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-base text-slate-900">Group Expenses</h3>
          <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
            {expenses.length} records
          </span>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No expenses recorded yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Click "Add New Expense" above to record your group spendings.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Expense Title & Date</th>
                <th className="py-3.5 px-6">Paid By</th>
                <th className="py-3.5 px-6">Split (Share)</th>
                <th className="py-3.5 px-6 text-right">Amount</th>
                <th className="py-3.5 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => {
                const isAll = exp.splitAmong === 'All' || !Array.isArray(exp.splitAmong);
                const splitCount = isAll
                  ? group.members.length
                  : exp.splitAmong.length;
                const perPersonCost = exp.amount / Math.max(splitCount, 1);

                return (
                  <tr key={exp._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{exp.title}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(exp.createdAt)}
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <User className="w-3 h-3" />
                        {exp.paidBy}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="text-xs font-semibold text-slate-700">
                        {currencySymbol}
                        {perPersonCost.toFixed(2)} / person
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {isAll
                          ? `Split equally among all (${splitCount})`
                          : `Split with: ${Array.isArray(exp.splitAmong) ? exp.splitAmong.join(', ') : exp.splitAmong}`}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="font-bold text-slate-900 text-base">
                        {currencySymbol}
                        {exp.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        onClick={() => onDeleteExpense(exp._id)}
                        title="Delete expense"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200">
              <tr>
                <td colSpan={3} className="py-3.5 px-6 text-slate-700">
                  Total Group Spend
                </td>
                <td className="py-3.5 px-6 text-right text-indigo-700 text-base">
                  {currencySymbol}
                  {totalSpend.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
