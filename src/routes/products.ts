import { authorizeRequest } from 'middlewares/auth';
import {
  addProduct,
  getProductByIdOrSlug,
  getProducts,
} from '../controllers/products';
import { Router } from 'express';

const router = Router();

router.get('/', getProducts);
router.get('/:idOrSlug', getProductByIdOrSlug);
router.post('/', authorizeRequest, addProduct);

export default router;
