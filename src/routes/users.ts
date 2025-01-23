import { Router } from 'express';
import { getUsers, getUserById, updateUserInfo, updateUserAvatar, getUserInfo } from '../controllers/users';

const router = Router();

router.get('/', getUsers);
router.get('/me', getUserInfo);
router.get('/:userId', getUserById);
router.patch('/me', updateUserInfo);
router.patch('/me/avatar', updateUserAvatar);

export default router;
