import { authenticateRequest, authorizeRequest } from '../middlewares/auth';
import {
  addBrand,
  deleteBrand,
  getAvailableBrandById,
  getBrandById,
  getAvailableBrands,
  updateBrand,
  getAllBrands,
} from '../controllers/brands';
import { Router } from 'express';
import parseRequestFile from '../lib/parse-request-file';

const router = Router();

router.get('/', getAvailableBrands);
//? typically, this endpoint should be blocked from unauthorized users, but it's not (for demonstration purposes)
// router.get('/all', authorizeRequest, getAllBrands);
router.get('/all', authenticateRequest, getAllBrands);
router.get('/:brandId', getAvailableBrandById);
router.get('/:brandId/all', authorizeRequest, getBrandById);
router.post('/', authorizeRequest, parseRequestFile('logo'), addBrand);
router.put(
  '/:brandId',
  authorizeRequest,
  parseRequestFile('logo'),
  updateBrand
);
router.delete('/:brandId', authorizeRequest, deleteBrand);

export default router;
