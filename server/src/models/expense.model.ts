import { Schema, model } from 'mongoose';
import { IExpenseDocument } from '../types/expense.type';

const expenseSchema = new Schema<IExpenseDocument>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    // Also store tripId pointing to same reference for backward-compatibility with TripBuddy endpoints
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be greater than 0'],
    },
    paidBy: {
      type: String,
      required: true,
      trim: true,
    },
    splitAmong: {
      type: Schema.Types.Mixed,
      default: 'All',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to populate tripId if groupId is present, or vice-versa
expenseSchema.pre('save', function (next) {
  if (this.groupId && !this.tripId) {
    this.tripId = this.groupId;
  } else if (this.tripId && !this.groupId) {
    this.groupId = this.tripId;
  }
  next();
});

export const ExpenseModel = model<IExpenseDocument>('Expense', expenseSchema);
