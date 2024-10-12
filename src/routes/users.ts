import { blockRequestIfActiveSession } from '../middlewares/auth';
import {
  completePasswordReset,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resendOTP,
  verifyEmail,
} from '../controllers/users';
import { Router } from 'express';

const router = Router();

router.post('/register', blockRequestIfActiveSession, registerUser);
router.post('/login', blockRequestIfActiveSession, loginUser);
// TODO: add Google sign in
router.delete('/logout', logoutUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post(
  '/request-password-reset',
  blockRequestIfActiveSession,
  requestPasswordReset
);
router.post(
  '/reset-password',
  blockRequestIfActiveSession,
  completePasswordReset
);

export default router;
