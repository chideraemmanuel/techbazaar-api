import { authorizeRequest } from '../middlewares/auth';
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

const router = Router();

router.get('/', getAvailableBrands);
router.get('/all', authorizeRequest, getAllBrands);
router.get('/:brandId', getAvailableBrandById);
router.get('/:brandId/all', authorizeRequest, getBrandById);
router.post('/', authorizeRequest, addBrand);
router.put('/:brandId', authorizeRequest, updateBrand);
router.delete('/:brandId', authorizeRequest, deleteBrand);

export default router;
