import { authorizeRequest } from '../middlewares/auth';
import {
  addBrand,
  deleteBrand,
  getBrandById,
  getBrands,
  updateBrand,
} from '../controllers/brands';
import { Router } from 'express';

const router = Router();

router.get('/', getBrands);
router.get('/:id', getBrandById);
router.post('/', authorizeRequest, addBrand);
router.put('/:id', authorizeRequest, updateBrand);
router.delete('/:id', authorizeRequest, deleteBrand);

export default router;
