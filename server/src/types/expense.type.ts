import { Document, Types } from 'mongoose';

export interface IExpenseDocument extends Document {
  groupId: Types.ObjectId;
  tripId?: Types.ObjectId; // Kept for backward compatibility / trip context
  title: string;
  amount: number;
  paidBy: string;
  splitAmong: 'All' | string[];
  createdAt: Date;
  updatedAt: Date;
}
