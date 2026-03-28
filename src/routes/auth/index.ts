import { Router } from 'express';
import { AuthController } from '../../controllers/auth';
import { registerValidator, loginValidator, refreshTokenValidator } from '../../validators/auth';

const authRouter: Router = Router();

authRouter.post('/register', registerValidator, AuthController.register);
authRouter.post('/login', loginValidator, AuthController.login);
authRouter.post('/refresh', refreshTokenValidator, AuthController.refreshToken);
authRouter.post('/logout', AuthController.logout);

export { authRouter };
