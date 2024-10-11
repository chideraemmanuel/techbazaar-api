import { authorizeRequest } from 'middlewares/auth';
import {
  addProduct,
  deleteProduct,
  getProductByIdOrSlug,
  getProducts,
  updateProduct,
} from '../controllers/products';
import { Router } from 'express';

const router = Router();

router.get('/', getProducts);
router.get('/:idOrSlug', getProductByIdOrSlug);
router.post('/', authorizeRequest, addProduct);
router.put('/:idOrSlug', authorizeRequest, updateProduct);
router.delete('/:idOrSlug', authorizeRequest, deleteProduct);

export default router;
