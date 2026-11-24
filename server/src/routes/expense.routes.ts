import { Router } from 'express';
import { expenseController } from '../controllers/expense.controller';

const router = Router();

// Routes matching TripBuddy specification and standalone Group specification
router.post('/', (req, res) => expenseController.createExpense(req, res));
router.get('/trip/:tripId', (req, res) => expenseController.getExpensesByTripOrGroup(req, res));
router.get('/group/:groupId', (req, res) => expenseController.getExpensesByTripOrGroup(req, res));
router.get('/settlement/:groupId', (req, res) => expenseController.getSettlement(req, res));
router.put('/:expenseId', (req, res) => expenseController.updateExpense(req, res));
router.patch('/:expenseId', (req, res) => expenseController.updateExpense(req, res));
router.delete('/:expenseId', (req, res) => expenseController.deleteExpense(req, res));

export default router;
