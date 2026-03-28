import { Router } from 'express';
import { UserController } from '../../controllers/user';
import { updateProfileValidator } from '../../validators/user';
import { authMiddleware } from '../../middlewares/auth';

const userRouter: Router = Router();

userRouter.use(authMiddleware);

userRouter.get('/profile', UserController.getProfile);
userRouter.patch('/profile', updateProfileValidator, UserController.updateProfile);

export { userRouter };
