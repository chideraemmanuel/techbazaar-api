import { Router } from 'express';
import usersRouter from './users';
import productsRouter from './products';
import brandsRouter from './brands';

const router = Router();

router.use('/users', usersRouter);
router.use('/products', productsRouter);
router.use('/brands', brandsRouter);

export default router;
