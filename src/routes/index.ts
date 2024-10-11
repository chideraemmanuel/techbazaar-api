import { Router } from 'express';
import usersRouter from './users';
import productsRouter from './products';

const router = Router();

router.use('/users', usersRouter);
router.use('/products', productsRouter);

export default router;
