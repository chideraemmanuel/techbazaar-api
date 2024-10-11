import { authorizeRequest } from '../middlewares/auth';
import {
  addProduct,
  deleteProduct,
  getAvailableProductByIdOrSlug,
  getProductByIdOrSlug,
  getAvailableProducts,
  getRandomAvailableProducts,
  getAllProducts,
  updateProduct,
} from '../controllers/products';
import { Router } from 'express';

const router = Router();

router.get('/', getAvailableProducts);
router.get('/random', getRandomAvailableProducts);
router.get('/all', authorizeRequest, getAllProducts);
router.get('/:idOrSlug', getAvailableProductByIdOrSlug);
router.get('/:idOrSlug/all', authorizeRequest, getProductByIdOrSlug);
router.post('/', authorizeRequest, addProduct);
router.put('/:idOrSlug', authorizeRequest, updateProduct);
router.delete('/:idOrSlug', authorizeRequest, deleteProduct);

export default router;
