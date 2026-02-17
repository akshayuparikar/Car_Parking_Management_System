import express from 'express';
import { getUsers, updateUser, deleteUser, createUser, getAssignedSecurities, removeSecurityAssignment, addOrUpdateUPI } from '../controllers/userController.js';
import { auth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, authorizeRoles('ADMIN'), createUser);
router.get('/', auth,  getUsers);
router.put('/:id', auth,  updateUser);
router.delete('/:id', auth,  deleteUser);

// Admin only routes
router.get('/assigned-securities', auth, authorizeRoles('ADMIN'), getAssignedSecurities);
router.delete('/:securityId/assignment', auth, authorizeRoles('ADMIN'), removeSecurityAssignment);

// Security only routes
router.post('/upi', auth, authorizeRoles('SECURITY'), addOrUpdateUPI);

export default router;
