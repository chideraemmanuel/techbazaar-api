import { Router } from 'express';
import {
  authenticateRequest,
  authorizeRequest,
  verifyRequest,
} from '../middlewares/auth';
import {
  addItemToCart,
  clearCurrentUserCart,
  decrementCartItemQuantity,
  getAllUsers,
  getCurrentUser,
  getCurrentUserCart,
  getUserById,
  incrementCartItemQuantity,
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
router.get('/:id', authorizeRequest, getUserById);
// =============================================================================

/**
 * update the currently signed in user personal details (verified users only)
 */
router.put('/me', authenticateRequest, verifyRequest, updateCurrentUser);
/**
 * update user status; role or disabled (admin only)
 */
router.put('/:id', authorizeRequest, updateUserStatus);
// =============================================================================

/**
 * get the currently signed in user's cart (verified users only)
 */
router.get('/me/cart', authenticateRequest, verifyRequest, getCurrentUserCart);
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
router.get('/me/orders');
/**
 * get all of a particular user's orders (admin only)
 */
router.get('/:id/orders');
// =============================================================================

/**
 * get a particular order of the currently signed in user (verified users only)
 */
router.get('/me/orders/:orderId');
/**
 * get a particular order of a particular user (admin only)
 */
router.get('/:id/orders/:orderId');
// =============================================================================

/**
 * place an order, currently signed in user (verified users only)
 */
router.post('/me/orders');
// =============================================================================

/**
 * update (status) a particular order of a particular user (admin only)
 * ! redudant..?
 */
router.put('/:id/orders/:orderId'); //
// =============================================================================

/**
 * cancel a particular order of the currently signed in user (verified users only)
 */
router.delete('/me/orders/:orderId');
/**
 * cancel a particular order of a particular user (admin only)
 */
router.delete('/:id/orders/:orderId');

export default router;
