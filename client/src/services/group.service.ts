import { api } from './api';
import { IGroup } from '../types';

export const groupService = {
  async getGroups(): Promise<IGroup[]> {
    const res = await api.get('/api/groups');
    return res.data.data;
  },

  async getGroupById(id: string): Promise<IGroup> {
    const res = await api.get(`/api/groups/${id}`);
    return res.data.data;
  },

  async createGroup(data: { name: string; currency?: string; members?: { name: string; email?: string }[] }): Promise<IGroup> {
    const res = await api.post('/api/groups', data);
    return res.data.data;
  },

  async addMember(groupId: string, member: { name: string; email?: string }): Promise<IGroup> {
    const res = await api.post(`/api/groups/${groupId}/members`, member);
    return res.data.data;
  },

  async removeMember(groupId: string, memberName: string): Promise<IGroup> {
    const res = await api.delete(`/api/groups/${groupId}/members/${encodeURIComponent(memberName)}`);
    return res.data.data;
  },

  async deleteGroup(id: string): Promise<boolean> {
    const res = await api.delete(`/api/groups/${id}`);
    return res.data.success;
  },
};
