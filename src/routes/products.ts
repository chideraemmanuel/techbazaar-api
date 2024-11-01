import { authenticateRequest, authorizeRequest } from '../middlewares/auth';
import {
  addProduct,
  deleteProduct,
  getAvailableProductByIdOrSlug,
  getProductByIdOrSlug,
  getAvailableProducts,
  getRandomAvailableProducts,
  getRelatedProducts,
  getAllProducts,
  updateProduct,
} from '../controllers/products';
import { Router } from 'express';
import parseRequestFile from 'lib/parse-request-file';

const router = Router();

router.get('/', getAvailableProducts);
router.get('/random', getRandomAvailableProducts);
//? typically, this endpoint should be blocked from unauthorized users, but it's not (for demonstration purposes)
// router.get('/all', authorizeRequest, getAllProducts);
router.get('/all', authenticateRequest, getAllProducts);
router.get('/:idOrSlug', getAvailableProductByIdOrSlug);
router.get('/:idOrSlug/all', authorizeRequest, getProductByIdOrSlug);
router.get('/:idOrSlug/related', getRelatedProducts);
router.post('/', authorizeRequest, parseRequestFile('image'), addProduct);
router.put(
  '/:idOrSlug',
  authorizeRequest,
  parseRequestFile('image'),
  updateProduct
);
router.delete('/:idOrSlug', authorizeRequest, deleteProduct);

export default router;
