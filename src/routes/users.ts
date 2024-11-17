import { Router } from 'express';
import {
  authenticateRequest,
  authorizeRequest,
  verifyRequest,
} from '../middlewares/auth';
import {
  addItemToCart,
  addItemToWishlist,
  cancelOrder,
  clearCurrentUserCart,
  decrementCartItemQuantity,
  getAllUsers,
  getCartItemByProductID,
  getCurrentUser,
  getCurrentUserBillingInformation,
  getCurrentUserCart,
  getCurrentUserCartSummary,
  getCurrentUserOrderById,
  getCurrentUserOrders,
  getCurrentUserWishlist,
  getUserById,
  getUserOrderById,
  getUserOrders,
  getWishlistItemByProductID,
  incrementCartItemQuantity,
  placeOrder,
  removeItemFromCart,
  removeItemFromWishlist,
  updateCurrentUser,
  updateUserStatus,
} from '../controllers/users';

const router = Router();

router.get('/', authorizeRequest, getAllUsers);

router.get('/me', authenticateRequest, getCurrentUser);
router.get('/:userId', authorizeRequest, getUserById);

router.put('/me', authenticateRequest, verifyRequest, updateCurrentUser);
router.put('/:userId', authorizeRequest, updateUserStatus);

router.get(
  '/me/wishlist',
  authenticateRequest,
  verifyRequest,
  getCurrentUserWishlist
);
router.get(
  '/me/wishlist/product',
  authenticateRequest,
  verifyRequest,
  getWishlistItemByProductID
);
router.post(
  '/me/wishlist',
  authenticateRequest,
  verifyRequest,
  addItemToWishlist
);
router.delete(
  '/me/wishlist/:wishlistItemId',
  authenticateRequest,
  verifyRequest,
  removeItemFromWishlist
);

router.get('/me/cart', authenticateRequest, verifyRequest, getCurrentUserCart);
router.get(
  '/me/cart/summary',
  authenticateRequest,
  verifyRequest,
  getCurrentUserCartSummary
);
router.get(
  '/me/cart/product',
  authenticateRequest,
  verifyRequest,
  getCartItemByProductID
);
router.post('/me/cart', authenticateRequest, verifyRequest, addItemToCart);
router.delete(
  '/me/cart/:cartItemId',
  authenticateRequest,
  verifyRequest,
  removeItemFromCart
);
router.put(
  '/me/cart/:cartItemId/increment',
  authenticateRequest,
  verifyRequest,
  incrementCartItemQuantity
);
router.put(
  '/me/cart/:cartItemId/decrement',
  authenticateRequest,
  verifyRequest,
  decrementCartItemQuantity
);
router.delete(
  '/me/cart',
  authenticateRequest,
  verifyRequest,
  clearCurrentUserCart
);

router.get(
  '/me/orders',
  authenticateRequest,
  verifyRequest,
  getCurrentUserOrders
);
router.get('/:userId/orders', authorizeRequest, getUserOrders);

router.get(
  '/me/orders/:orderId',
  authenticateRequest,
  verifyRequest,
  getCurrentUserOrderById
);
router.get('/:userId/orders/:orderId', authorizeRequest, getUserOrderById);
router.post('/me/orders', authenticateRequest, verifyRequest, placeOrder);

/**
 * update (status) a particular order of a particular user (admin only)
 * ! redudant..?
 */
router.put('/:userId/orders/:orderId'); // ! not done
// =============================================================================

router.delete(
  '/me/orders/:orderId',
  authenticateRequest,
  verifyRequest,
  cancelOrder
);
/**
 * cancel a particular order of a particular user (admin only)
 */
router.delete('/:userId/orders/:orderId'); // ! not done

// =============================================================================

router.get(
  '/me/billing',
  authenticateRequest,
  verifyRequest,
  getCurrentUserBillingInformation
);

export default router;
