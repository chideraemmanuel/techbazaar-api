import { Router } from 'express';
import authRouter from './auth';
import productsRouter from './products';
import brandsRouter from './brands';
import usersRouter from './users';
import ordersRouter from './orders';

const router = Router();

router.use('/auth', authRouter);
router.use('/products', productsRouter);
router.use('/brands', brandsRouter);
router.use('/users', usersRouter);
router.use('/orders', ordersRouter);

export default router;
