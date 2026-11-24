import { api } from './api';
import { IExpense, ISettlementResult } from '../types';

export const expenseService = {
  async addExpense(data: {
    groupId?: string;
    tripId?: string;
    title: string;
    amount: number;
    paidBy: string;
    splitAmong?: 'All' | string[];
  }): Promise<IExpense> {
    const payload = {
      ...data,
      groupId: data.groupId || data.tripId,
      tripId: data.tripId || data.groupId,
    };
    const response = await api.post('/api/expenses', payload);
    return response.data.data;
  },

  async getTripExpenses(tripIdOrGroupId: string): Promise<IExpense[]> {
    const response = await api.get(`/api/expenses/trip/${tripIdOrGroupId}`);
    return response.data.data;
  },

  async getSettlement(groupId: string): Promise<ISettlementResult> {
    const response = await api.get(`/api/expenses/settlement/${groupId}`);
    return response.data.data;
  },

  async deleteExpense(expenseId: string) {
    const response = await api.delete(`/api/expenses/${expenseId}`);
    return response.data;
  },
};
