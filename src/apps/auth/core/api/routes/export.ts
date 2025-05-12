import { Router } from 'express';
import authRoutes from './auth.routes';
import oauthRoutes from './oauth.routes';

const router = Router();

router.use('/', authRoutes);
router.use('/oauth', oauthRoutes);

export default router;
