import { Request, Response } from 'express';
import { expenseService } from '../services/expense.service';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateExpenseDTO } from '../dtos/expense.dto';

export class ExpenseController {
  async createExpense(req: Request, res: Response) {
    try {
      const dto = plainToInstance(CreateExpenseDTO, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
        });
      }

      const expense = await expenseService.createExpense(dto);
      return res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        data: expense,
      });
    } catch (err: any) {
      console.error('[ExpenseController] createExpense error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  async getExpensesByTripOrGroup(req: Request, res: Response) {
    try {
      const id = req.params.tripId || req.params.groupId;
      if (!id) {
        return res.status(400).json({ success: false, message: 'tripId or groupId required' });
      }

      const pageQuery = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limitQuery = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      if (pageQuery !== undefined && limitQuery !== undefined && !isNaN(pageQuery) && !isNaN(limitQuery)) {
        const result = await expenseService.getExpensesByGroupIdPaginated(id, pageQuery, limitQuery);
        return res.status(200).json({
          success: true,
          data: result.expenses,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        });
      }

      const expenses = await expenseService.getExpensesByGroupId(id);
      return res.status(200).json({
        success: true,
        data: expenses,
      });
    } catch (err: any) {
      console.error('[ExpenseController] getExpenses error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  async getSettlement(req: Request, res: Response) {
    try {
      const id = req.params.tripId || req.params.groupId;
      if (!id) {
        return res.status(400).json({ success: false, message: 'tripId or groupId required' });
      }
      const settlement = await expenseService.getSettlementByGroupId(id);
      return res.status(200).json({
        success: true,
        data: settlement,
      });
    } catch (err: any) {
      console.error('[ExpenseController] getSettlement error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  async deleteExpense(req: Request, res: Response) {
    try {
      const { expenseId } = req.params;
      const success = await expenseService.deleteExpense(expenseId);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Expense not found' });
      }
      return res.status(200).json({
        success: true,
        message: 'Expense deleted successfully',
      });
    } catch (err: any) {
      console.error('[ExpenseController] deleteExpense error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }
}

export const expenseController = new ExpenseController();
