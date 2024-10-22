import { blockRequestIfActiveSession } from '../middlewares/auth';
import {
  authenticateUserWithGoogle,
  completePasswordReset,
  getGoogleOAuthURI,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resendOTP,
  verifyEmail,
} from '../controllers/auth';
import { Router } from 'express';

const router = Router();

router.post('/register', blockRequestIfActiveSession, registerUser);
router.post('/login', blockRequestIfActiveSession, loginUser);
router.get('/google/url', getGoogleOAuthURI);
router.get('/google', authenticateUserWithGoogle);
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
