import { Router } from 'express';
import { MusicController } from '../../controllers/music';
import { searchValidator, getTrackValidator } from '../../validators/music';
import { authMiddleware } from '../../middlewares/auth';

const musicRouter: Router = Router();

musicRouter.use(authMiddleware);

musicRouter.get('/search', searchValidator, MusicController.search);
musicRouter.get('/track/:id', getTrackValidator, MusicController.getTrackDetails);
musicRouter.get('/featured', MusicController.getFeatured);
musicRouter.get('/new-releases', MusicController.getNewReleases);

export { musicRouter };
