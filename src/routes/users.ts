import { Router } from 'express';
import {
  authenticateRequest,
  authorizeRequest,
  verifyRequest,
} from '../middlewares/auth';
import {
  addItemToCart,
  cancelOrder,
  clearCurrentUserCart,
  decrementCartItemQuantity,
  getAllUsers,
  getCartItemByProductID,
  getCurrentUser,
  getCurrentUserCart,
  getCurrentUserCartSummary,
  getCurrentUserOrderById,
  getCurrentUserOrders,
  getUserById,
  getUserOrderById,
  getUserOrders,
  incrementCartItemQuantity,
  placeOrder,
  removeItemFromCart,
  updateCurrentUser,
  updateUserStatus,
} from '../controllers/users';

const router = Router();

/**
 * get all users (admin only)
 */
router.get('/', authorizeRequest, getAllUsers);
// =============================================================================

/**
 * get the currently signed in user
 */
router.get('/me', authenticateRequest, getCurrentUser);
/**
 * get user by id (admin only)
 */
router.get('/:userId', authorizeRequest, getUserById);
// =============================================================================

/**
 * update the currently signed in user personal details (verified users only)
 */
router.put('/me', authenticateRequest, verifyRequest, updateCurrentUser);
/**
 * update user status; role or disabled (admin only)
 */
router.put('/:userId', authorizeRequest, updateUserStatus);
// =============================================================================

/**
 * get the currently signed in user's cart (verified users only)
 */
router.get('/me/cart', authenticateRequest, verifyRequest, getCurrentUserCart);

/**
 * get the currently signed in user's cart summary (verified users only)
 */
router.get(
  '/me/cart/summary',
  authenticateRequest,
  verifyRequest,
  getCurrentUserCartSummary
);

/**
 * get the currently signed in user's cart (verified users only)
 */
router.get(
  '/me/cart/product',
  authenticateRequest,
  verifyRequest,
  getCartItemByProductID
);
/**
 * add to cart, currently signed in user (verified users only)
 */
router.post('/me/cart', authenticateRequest, verifyRequest, addItemToCart);
/**
 * remove from cart, currently signed in user (verified users only)
 */
router.delete(
  '/me/cart/:cartItemId',
  authenticateRequest,
  verifyRequest,
  removeItemFromCart
);
/**
 * increment item, currently signed in user (verified users only)
 */
router.put(
  '/me/cart/:cartItemId/increment',
  authenticateRequest,
  verifyRequest,
  incrementCartItemQuantity
);
/**
 * decrement item, currently signed in user (verified users only)
 */
router.put(
  '/me/cart/:cartItemId/decrement',
  authenticateRequest,
  verifyRequest,
  decrementCartItemQuantity
);
/**
 * clear cart, currently signed in user (verified users only)
 */
router.delete(
  '/me/cart',
  authenticateRequest,
  verifyRequest,
  clearCurrentUserCart
);
// =============================================================================

/**
 * get all of the currently signed in user's orders (verified users only)
 */
router.get(
  '/me/orders',
  authenticateRequest,
  verifyRequest,
  getCurrentUserOrders
);
/**
 * get all of a particular user's orders (admin only)
 */
router.get('/:userId/orders', authorizeRequest, getUserOrders);
// =============================================================================

/**
 * get a particular order of the currently signed in user (verified users only)
 */
router.get(
  '/me/orders/:orderId',
  authenticateRequest,
  verifyRequest,
  getCurrentUserOrderById
);
/**
 * get a particular order of a particular user (admin only)
 */
router.get('/:userId/orders/:orderId', authorizeRequest, getUserOrderById);
// =============================================================================

/**
 * place an order, currently signed in user (verified users only)
 */
router.post('/me/orders', authenticateRequest, placeOrder);
// =============================================================================

/**
 * update (status) a particular order of a particular user (admin only)
 * ! redudant..?
 */
router.put('/:userId/orders/:orderId'); // ! not done
// =============================================================================

/**
 * cancel a particular order of the currently signed in user (verified users only)
 */
router.delete('/me/orders/:orderId', authenticateRequest, cancelOrder);
/**
 * cancel a particular order of a particular user (admin only)
 */
router.delete('/:userId/orders/:orderId'); // ! not done

export default router;
