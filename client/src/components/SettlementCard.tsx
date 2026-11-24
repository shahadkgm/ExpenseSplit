import React from 'react';
import { ArrowRight, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { ISettlementResult, IGroup } from '../types';

interface SettlementCardProps {
  settlement: ISettlementResult | null;
  group: IGroup;
  currencySymbol: string;
}

export const SettlementCard: React.FC<SettlementCardProps> = ({
  settlement,
  group,
  currencySymbol,
}) => {
  if (!settlement) {
    return (
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
          <div className="h-8 bg-slate-100 rounded"></div>
          <div className="h-8 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  const { totalGroupSpend, totalPaidByMember, balances, settlements } = settlement;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Gradient Card: Total Spend & Overview */}
      <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl shadow-indigo-900/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-indigo-200">
            Group Spend Summary
          </span>
          <span className="text-[11px] bg-white/15 px-2 py-0.5 rounded-full text-indigo-100 font-medium truncate max-w-[140px]">
            {group.name}
          </span>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {currencySymbol}
            {totalGroupSpend.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <p className="text-[11px] sm:text-xs text-indigo-200 mt-1">
            Total expenses incurred by the group
          </p>
        </div>

        <div className="border-t border-indigo-700/60 pt-3 sm:pt-4">
          <h4 className="text-[10px] sm:text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2.5">
            Individual Contributions
          </h4>
          <div className="space-y-1.5 sm:space-y-2">
            {Object.entries(totalPaidByMember).map(([member, paid]) => {
              const balance = balances[member] || 0;
              return (
                <div
                  key={member}
                  className="flex items-center justify-between text-xs bg-white/10 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 backdrop-blur-xs gap-2"
                >
                  <span className="font-semibold truncate max-w-[110px] sm:max-w-none">{member}</span>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-[11px] sm:text-xs">
                      Paid: {currencySymbol}
                      {paid.toFixed(2)}
                    </div>
                    <div
                      className={`text-[10px] sm:text-[11px] font-bold ${
                        balance > 0.01
                          ? 'text-emerald-300'
                          : balance < -0.01
                          ? 'text-rose-300'
                          : 'text-indigo-200'
                      }`}
                    >
                      {balance > 0.01
                        ? `Gets back ${currencySymbol}${balance.toFixed(2)}`
                        : balance < -0.01
                        ? `Owes ${currencySymbol}${Math.abs(balance).toFixed(2)}`
                        : 'Settled'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* True "Who Owes Whom?" Net Debt Settlements */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Who Owes Whom?</h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Direct minimum settlement transfers
            </p>
          </div>
        </div>

        {settlements.length === 0 ? (
          <div className="py-5 sm:py-6 px-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-xs sm:text-sm font-bold text-slate-700">All Settled Up!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              No pending debts between group members.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {settlements.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm hover:border-indigo-300 transition-colors gap-2"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="font-bold text-slate-800 truncate">{s.from}</span>
                  <div className="flex items-center gap-0.5 text-slate-400 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      pays
                    </span>
                    <ArrowRight className="w-3 h-3 text-indigo-500" />
                  </div>
                  <span className="font-bold text-slate-800 truncate">{s.to}</span>
                </div>
                <div className="font-extrabold text-indigo-600 text-xs sm:text-sm shrink-0">
                  {currencySymbol}
                  {s.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
