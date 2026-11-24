export interface IGroupMember {
  name: string;
  email?: string;
  userId?: string;
}

export interface IGroup {
  _id: string;
  name: string;
  currency: 'INR' | 'USD' | 'EUR';
  members: IGroupMember[];
  createdAt: string;
  updatedAt: string;
}

export interface IExpense {
  _id: string;
  groupId: string;
  tripId?: string; // For backward compatibility with TripBuddy
  title: string;
  amount: number;
  paidBy: string;
  splitAmong: 'All' | string[];
  createdAt: string;
  updatedAt?: string;
}

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
