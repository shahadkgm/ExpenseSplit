import { expenseRepository, ExpenseRepository } from '../repositories/expense.repository';
import { groupRepository, GroupRepository } from '../repositories/group.repository';
import { settlementService, SettlementService, ISettlementResult } from './settlement.service';
import { CreateExpenseDTO } from '../dtos/expense.dto';
import { IExpenseDocument } from '../types/expense.type';

export class ExpenseService {
  constructor(
    private expenseRepo: ExpenseRepository = expenseRepository,
    private groupRepo: GroupRepository = groupRepository,
    private settlementServ: SettlementService = settlementService
  ) {}

  async createExpense(data: CreateExpenseDTO): Promise<IExpenseDocument> {
    const groupId = data.groupId || data.tripId;
    if (!groupId) {
      throw new Error('groupId or tripId is required');
    }

    console.log(`[ExpenseService] Creating expense "${data.title}" of ${data.amount} for group/trip ${groupId}`);
    
    // Auto add payer to group members if not already there
    const group = await this.groupRepo.findById(groupId);
    if (group) {
      const memberNames = group.members.map((m) => m.name.toLowerCase());
      if (!memberNames.includes(data.paidBy.toLowerCase())) {
        await this.groupRepo.addMember(groupId, { name: data.paidBy });
      }
    }

    return await this.expenseRepo.create({
      ...data,
      groupId,
      tripId: groupId,
      splitAmong: data.splitAmong || 'All',
    });
  }

  async getExpensesByGroupId(groupId: string): Promise<IExpenseDocument[]> {
    console.log(`[ExpenseService] Fetching expenses for group/trip ${groupId}`);
    return await this.expenseRepo.findByGroupId(groupId);
  }

  async getSettlementByGroupId(groupId: string): Promise<ISettlementResult> {
    const expenses = await this.expenseRepo.findByGroupId(groupId);
    const group = await this.groupRepo.findById(groupId);

    // Extract all member names
    const memberSet = new Set<string>();
    if (group && group.members) {
      group.members.forEach((m) => memberSet.add(m.name));
    }
    expenses.forEach((e) => {
      memberSet.add(e.paidBy);
      if (Array.isArray(e.splitAmong)) {
        e.splitAmong.forEach((m) => memberSet.add(m));
      }
    });

    const members = Array.from(memberSet);
    return this.settlementServ.calculate(expenses, members);
  }

  async deleteExpense(expenseId: string): Promise<boolean> {
    console.log(`[ExpenseService] Deleting expense ${expenseId}`);
    return await this.expenseRepo.delete(expenseId);
  }
}

export const expenseService = new ExpenseService();
