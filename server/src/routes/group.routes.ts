import { Router } from 'express';
import { groupController } from '../controllers/group.controller';

const router = Router();

router.post('/', (req, res) => groupController.createGroup(req, res));
router.get('/', (req, res) => groupController.getAllGroups(req, res));
router.get('/:id', (req, res) => groupController.getGroupById(req, res));
router.post('/:id/members', (req, res) => groupController.addMember(req, res));
router.delete('/:id/members/:name', (req, res) => groupController.removeMember(req, res));
router.delete('/:id', (req, res) => groupController.deleteGroup(req, res));

export default router;
