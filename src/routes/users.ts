import { Router } from 'express';
import { createUser, getUsers, getUserById, updateUserInfo, updateUserAvatar } from '../controllers/users';

const router = Router();

router.get('/', getUsers);
router.get('/:userId', getUserById);
router.post('/', createUser);
router.patch('/me', updateUserInfo);
router.patch('/me/avatar', updateUserAvatar);

export default router;
