import { groupRepository, GroupRepository } from '../repositories/group.repository';
import { expenseRepository } from '../repositories/expense.repository';
import { CreateGroupDTO } from '../dtos/group.dto';
import { IGroupDocument } from '../types/group.type';

export class GroupService {
  constructor(private repo: GroupRepository = groupRepository) {}

  async createGroup(data: CreateGroupDTO): Promise<IGroupDocument> {
    console.log(`[GroupService] Creating group: ${data.name}`);
    return await this.repo.create(data);
  }

  async getAllGroups(): Promise<IGroupDocument[]> {
    return await this.repo.findAll();
  }

  async getGroupById(id: string): Promise<IGroupDocument | null> {
    return await this.repo.findById(id);
  }

  async addMember(groupId: string, member: { name: string; email?: string }): Promise<IGroupDocument | null> {
    console.log(`[GroupService] Adding member ${member.name} to group ${groupId}`);
    return await this.repo.addMember(groupId, member);
  }

  async removeMember(groupId: string, memberName: string): Promise<IGroupDocument | null> {
    console.log(`[GroupService] Removing member ${memberName} from group ${groupId}`);
    return await this.repo.removeMember(groupId, memberName);
  }

  async deleteGroup(id: string): Promise<boolean> {
    console.log(`[GroupService] Deleting group ${id} and associated expenses`);
    await expenseRepository.deleteByGroupId(id);
    return await this.repo.delete(id);
  }
}

export const groupService = new GroupService();
