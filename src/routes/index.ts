import { Router } from 'express';
import authRouter from './auth';
import productsRouter from './products';
import brandsRouter from './brands';
import usersRouter from './users';

const router = Router();

router.use('/auth', authRouter);
router.use('/products', productsRouter);
router.use('/brands', brandsRouter);
router.use('/users', usersRouter);

export default router;
