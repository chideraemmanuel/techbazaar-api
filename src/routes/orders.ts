import { authorizeRequest } from 'middlewares/auth';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orders';
import { Router } from 'express';

const router = Router();

router.get('/', authorizeRequest, getAllOrders);
router.get('/:orderId', authorizeRequest, getOrderById);
router.put('/:orderId', authorizeRequest, updateOrderStatus);

export default router;
