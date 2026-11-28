import { Request, Response } from 'express';
import { groupService } from '../services/group.service';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateGroupDTO } from '../dtos/group.dto';
import { groupsCreated } from '../middleware/metrics.middleware';

export class GroupController {
  async createGroup(req: Request, res: Response) {
    try {
      const dto = plainToInstance(CreateGroupDTO, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
        });
      }

      const group = await groupService.createGroup(dto);
      groupsCreated.inc();
      return res.status(201).json({
        success: true,
        message: 'Group created successfully',
        data: group,
      });
    } catch (err: any) {
      console.error('[GroupController] createGroup error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  async getAllGroups(_req: Request, res: Response) {
    try {
      const groups = await groupService.getAllGroups();
      return res.status(200).json({
        success: true,
        data: groups,
      });
    } catch (err: any) {
      console.error('[GroupController] getAllGroups error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  async getGroupById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const group = await groupService.getGroupById(id);
      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }
      return res.status(200).json({
        success: true,
        data: group,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  async addMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Member name is required' });
      }
      const updated = await groupService.addMember(id, { name, email });
      return res.status(200).json({
        success: true,
        message: 'Member added successfully',
        data: updated,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  async removeMember(req: Request, res: Response) {
    try {
      const { id, name } = req.params;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Member name is required' });
      }
      const updated = await groupService.removeMember(id, decodeURIComponent(name));
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }
      return res.status(200).json({
        success: true,
        message: `Member ${name} removed successfully`,
        data: updated,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  async deleteGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await groupService.deleteGroup(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }
      return res.status(200).json({
        success: true,
        message: 'Group deleted successfully',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }
}

export const groupController = new GroupController();
