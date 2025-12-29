
import { Router } from 'express';
import { toggleWishlist, getWishlist } from '../controllers/wishlist.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Protected routes
router.use(requireAuth);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

export default router;
