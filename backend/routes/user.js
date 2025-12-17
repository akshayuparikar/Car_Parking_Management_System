import express from 'express';
import { getUsers, updateUser, deleteUser } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth,  getUsers);
router.put('/:id', auth,  updateUser);
router.delete('/:id', auth,  deleteUser);

export default router;
