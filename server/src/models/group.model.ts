import { Schema, model } from 'mongoose';
import { IGroupDocument } from '../types/group.type';

const groupMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: '' },
    userId: { type: String, default: null },
  },
  { _id: false }
);

const groupSchema = new Schema<IGroupDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    currency: {
      type: String,
      enum: ['INR', 'USD', 'EUR'],
      default: 'INR',
    },
    members: {
      type: [groupMemberSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const GroupModel = model<IGroupDocument>('Group', groupSchema);
