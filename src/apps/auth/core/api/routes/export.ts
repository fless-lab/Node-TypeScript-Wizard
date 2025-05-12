import { Router } from 'express';
import authRoutes from './auth.routes';
import oauthRoutes from './oauth.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/auth/oauth', oauthRoutes);

export default router;
