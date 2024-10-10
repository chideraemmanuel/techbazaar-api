import {
  loginUser,
  logoutUser,
  registerUser,
  verifyEmail,
} from '../controllers/users';
import { Router } from 'express';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.delete('/logout', logoutUser);
router.post('/verify-email', verifyEmail);

export default router;
