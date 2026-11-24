import { GroupModel } from '../models/group.model';
import { IGroupDocument } from '../types/group.type';
import { CreateGroupDTO } from '../dtos/group.dto';

export class GroupRepository {
  private _model = GroupModel;

  async create(data: CreateGroupDTO): Promise<IGroupDocument> {
    const group = new this._model(data);
    return (await group.save()).toObject();
  }

  async findAll(): Promise<IGroupDocument[]> {
    return await this._model.find().sort({ updatedAt: -1 }).lean();
  }

  async findById(id: string): Promise<IGroupDocument | null> {
    return await this._model.findById(id).lean();
  }

  async addMember(groupId: string, member: { name: string; email?: string }): Promise<IGroupDocument | null> {
    return await this._model.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: member } },
      { new: true }
    ).lean();
  }

  async removeMember(groupId: string, memberName: string): Promise<IGroupDocument | null> {
    return await this._model.findByIdAndUpdate(
      groupId,
      { $pull: { members: { name: memberName } } },
      { new: true }
    ).lean();
  }

  async delete(id: string): Promise<boolean> {
    const res = await this._model.findByIdAndDelete(id);
    return !!res;
  }
}

export const groupRepository = new GroupRepository();
