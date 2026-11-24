export interface ISettlement {
  from: string;
  to: string;
  amount: number;
}

export interface ISettlementResult {
  totalGroupSpend: number;
  totalPaidByMember: Record<string, number>;
  totalShareByMember: Record<string, number>;
  balances: Record<string, number>;
  settlements: ISettlement[];
}

export class SettlementService {
  /**
   * Calculates net balances and debt-simplified settlements
   */
  calculate(
    expenses: { amount: number; paidBy: string; splitAmong: 'All' | string[] }[],
    members: string[]
  ): ISettlementResult {
    const balances: Record<string, number> = {};
    const totalPaidByMember: Record<string, number> = {};
    const totalShareByMember: Record<string, number> = {};
    let totalGroupSpend = 0;

    // Initialize all members with 0 balance
    members.forEach((m) => {
      balances[m] = 0;
      totalPaidByMember[m] = 0;
      totalShareByMember[m] = 0;
    });

    expenses.forEach((exp) => {
      totalGroupSpend += exp.amount;

      // Payer tracking
      totalPaidByMember[exp.paidBy] = (totalPaidByMember[exp.paidBy] || 0) + exp.amount;
      balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;

      // Determine who shares this expense
      const beneficiaries =
        Array.isArray(exp.splitAmong) && exp.splitAmong.length > 0
          ? exp.splitAmong
          : members;

      const splitCount = Math.max(beneficiaries.length, 1);
      const share = exp.amount / splitCount;

      beneficiaries.forEach((m) => {
        totalShareByMember[m] = (totalShareByMember[m] || 0) + share;
        balances[m] = (balances[m] || 0) - share;
      });
    });

    // Round balances to 2 decimal places to avoid floating point precision quirks
    Object.keys(balances).forEach((m) => {
      balances[m] = Math.round(balances[m] * 100) / 100;
    });

    // Debt Simplification Algorithm (greedy match between debtors and creditors)
    // Debtors have negative balance, Creditors have positive balance
    const debtors: [string, number][] = Object.entries(balances)
      .filter(([_, b]) => b < -0.01)
      .map(([k, v]) => [k, v]);

    const creditors: [string, number][] = Object.entries(balances)
      .filter(([_, b]) => b > 0.01)
      .map(([k, v]) => [k, v]);

    const settlements: ISettlement[] = [];
    let d = 0;
    let c = 0;

    while (d < debtors.length && c < creditors.length) {
      const debtor = debtors[d];
      const creditor = creditors[c];

      const settleAmount = Math.min(-debtor[1], creditor[1]);
      if (settleAmount > 0.01) {
        settlements.push({
          from: debtor[0],
          to: creditor[0],
          amount: Math.round(settleAmount * 100) / 100,
        });
      }

      debtor[1] += settleAmount;
      creditor[1] -= settleAmount;

      if (Math.abs(debtor[1]) < 0.01) d++;
      if (Math.abs(creditor[1]) < 0.01) c++;
    }

    return {
      totalGroupSpend: Math.round(totalGroupSpend * 100) / 100,
      totalPaidByMember,
      totalShareByMember,
      balances,
      settlements,
    };
  }
}

export const settlementService = new SettlementService();
