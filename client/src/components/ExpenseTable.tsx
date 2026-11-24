import React, { useState, useEffect } from 'react';
import { Trash2, Calendar, User, Receipt, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { IExpense, IGroup } from '../types';

interface ExpenseTableProps {
  expenses: IExpense[];
  group: IGroup;
  onDeleteExpense: (id: string) => void;
  onEditExpense?: (expense: IExpense) => void;
  currencySymbol: string;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  group,
  onDeleteExpense,
  onEditExpense,
  currencySymbol,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const totalSpend = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Calculate pagination limits
  const isAll = pageSize === 0;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(expenses.length / pageSize));

  // Reset to valid page when expenses list changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [expenses.length, totalPages, currentPage]);

  const startIndex = isAll ? 0 : (currentPage - 1) * pageSize;
  const endIndex = isAll ? expenses.length : Math.min(startIndex + pageSize, expenses.length);
  const currentExpenses = expenses.slice(startIndex, endIndex);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      {/* Header with Title and Records info */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Receipt className="w-5 h-5 text-indigo-600 shrink-0" />
          <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
            Group Expenses
          </h3>
          <span className="text-[11px] sm:text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full shrink-0">
            {expenses.length}
          </span>
        </div>

        {/* Rows per page selector */}
        {expenses.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 shrink-0">
            <span className="hidden sm:inline">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={0}>All</option>
            </select>
          </div>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="py-10 sm:py-12 px-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No expenses recorded yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Use the form above or tap "Add Expense" to record spending.
          </p>
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* MOBILE VIEW (< md): Touch-first Card List                  */}
          {/* ======================================================== */}
          <div className="md:hidden divide-y divide-slate-100">
            {currentExpenses.map((exp) => {
              const isSplitAll = exp.splitAmong === 'All' || !Array.isArray(exp.splitAmong);
              const splitCount = isSplitAll
                ? group.members.length
                : exp.splitAmong.length;
              const perPersonCost = exp.amount / Math.max(splitCount, 1);

              return (
                <div key={exp._id} className="p-3.5 hover:bg-slate-50/70 transition-colors">
                  {/* Top row: Title and Amount */}
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="font-bold text-slate-900 text-sm leading-snug break-words flex-1">
                      {exp.title}
                    </div>
                    <div className="font-extrabold text-indigo-600 text-base shrink-0">
                      {currencySymbol}
                      {exp.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  {/* Middle row: Paid by, Date, and Share */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                      <User className="w-3 h-3" />
                      {exp.paidBy}
                    </span>
                    <span>&bull;</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {formatDate(exp.createdAt)}
                    </span>
                    <span>&bull;</span>
                    <span className="text-[11px] font-semibold text-slate-700">
                      {currencySymbol}{perPersonCost.toFixed(2)}/person
                    </span>
                  </div>

                  {/* Bottom row: Split target & Actions */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100/60">
                    <span className="truncate max-w-[200px]">
                      {isSplitAll
                        ? `Split equally (${splitCount} members)`
                        : `Split: ${Array.isArray(exp.splitAmong) ? exp.splitAmong.join(', ') : exp.splitAmong}`}
                    </span>
                    <div className="flex items-center gap-1">
                      {onEditExpense && (
                        <button
                          onClick={() => onEditExpense(exp)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 active:scale-90 rounded-lg hover:bg-indigo-50 transition-colors"
                          title="Edit expense amount"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteExpense(exp._id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 active:scale-90 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Mobile Footer with Total Spend */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between font-bold text-xs">
              <span className="text-slate-600 uppercase tracking-wider">Total Spend</span>
              <span className="text-indigo-600 text-base">
                {currencySymbol}
                {totalSpend.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* DESKTOP/TABLET VIEW (>= md): Classic Full Table          */}
          {/* ======================================================== */}
          <div className="hidden md:block overflow-x-auto">
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
                {currentExpenses.map((exp) => {
                  const isSplitAll = exp.splitAmong === 'All' || !Array.isArray(exp.splitAmong);
                  const splitCount = isSplitAll
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
                          {isSplitAll
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
                        <div className="flex items-center justify-center gap-1">
                          {onEditExpense && (
                            <button
                              onClick={() => onEditExpense(exp)}
                              title="Edit expense amount"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteExpense(exp._id)}
                            title="Delete expense"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

          {/* Pagination Controls */}
          {expenses.length > 0 && !isAll && totalPages > 1 && (
            <div className="px-4 sm:px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex flex-col xs:flex-row items-center justify-between gap-2.5 text-xs">
              <div className="text-slate-500 font-medium text-[11px] sm:text-xs">
                Showing <span className="font-bold text-slate-700">{startIndex + 1}</span>-
                <span className="font-bold text-slate-700">{endIndex}</span> of{' '}
                <span className="font-bold text-slate-700">{expenses.length}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[28px] h-[28px] rounded-lg font-bold text-xs transition-all ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
