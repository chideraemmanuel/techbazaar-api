import {
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resendOTP,
  verifyEmail,
} from '../controllers/users';
import { Router } from 'express';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.delete('/logout', logoutUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/request-password-reset', requestPasswordReset);

export default router;
