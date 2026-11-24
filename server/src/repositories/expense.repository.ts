import { ExpenseModel } from '../models/expense.model';
import { IExpenseDocument } from '../types/expense.type';
import { Types } from 'mongoose';

export class ExpenseRepository {
  private _model = ExpenseModel;

  async create(data: any): Promise<IExpenseDocument> {
    const expense = new this._model(data);
    return await expense.save();
  }

  async findByGroupId(groupId: string): Promise<IExpenseDocument[]> {
    return await this._model
      .find({
        $or: [
          { groupId: new Types.ObjectId(groupId) },
          { tripId: new Types.ObjectId(groupId) },
        ],
      })
      .sort({ createdAt: -1 });
  }

  async findByTripId(tripId: string): Promise<IExpenseDocument[]> {
    return this.findByGroupId(tripId);
  }

  async findById(expenseId: string): Promise<IExpenseDocument | null> {
    return await this._model.findById(expenseId);
  }

  async delete(expenseId: string): Promise<boolean> {
    const res = await this._model.findByIdAndDelete(expenseId);
    return !!res;
  }

  async deleteByGroupId(groupId: string): Promise<number> {
    const res = await this._model.deleteMany({
      $or: [
        { groupId: new Types.ObjectId(groupId) },
        { tripId: new Types.ObjectId(groupId) },
      ],
    });
    return res.deletedCount || 0;
  }
}

export const expenseRepository = new ExpenseRepository();
