import { Router } from 'express';
import authRouter from './auth';
import productsRouter from './products';
import brandsRouter from './brands';

const router = Router();

router.use('/auth', authRouter);
router.use('/products', productsRouter);
router.use('/brands', brandsRouter);

export default router;
