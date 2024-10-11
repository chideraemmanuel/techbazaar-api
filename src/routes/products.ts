import { getProducts } from '../controllers/products';
import { Router } from 'express';

const router = Router();

router.get('/', getProducts);

export default router;
