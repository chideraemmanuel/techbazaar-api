import { updateViews } from '../controllers/views';
import { Router } from 'express';

const router = Router();

router.post('/', updateViews);

export default router;
