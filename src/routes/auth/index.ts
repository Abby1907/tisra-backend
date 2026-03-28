import { Router } from 'express';
import { AuthController } from '../../controllers/auth';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  verifyEmailValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../../validators/auth';
import { authMiddleware } from '../../middlewares/auth';

const authRouter: Router = Router();

authRouter.post('/register', registerValidator, AuthController.register);
authRouter.post('/login', loginValidator, AuthController.login);
authRouter.post('/refresh', refreshTokenValidator, AuthController.refreshToken);
authRouter.post('/logout', AuthController.logout);
authRouter.post('/verify-email', verifyEmailValidator, AuthController.verifyEmail);
authRouter.post('/forgot-password', forgotPasswordValidator, AuthController.forgotPassword);
authRouter.post('/reset-password', resetPasswordValidator, AuthController.resetPassword);
authRouter.get('/me', authMiddleware, AuthController.getMe);

export { authRouter };
