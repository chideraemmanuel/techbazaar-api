import { registerUser } from '../controllers/users';
import { Router } from 'express';

const router = Router();

router.post('/register', registerUser);

export default router;
