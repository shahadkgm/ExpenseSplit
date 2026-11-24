export interface IGroupMember {
  name: string;
  email?: string;
  userId?: string;
}

export interface IGroupDocument {
  _id: string;
  name: string;
  currency: 'INR' | 'USD' | 'EUR';
  members: IGroupMember[];
  createdAt: Date;
  updatedAt: Date;
}
