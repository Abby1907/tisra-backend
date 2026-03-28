import { Router } from 'express';
import { OtpController } from '../../controllers/otp';
import { requestOtpValidator, verifyOtpValidator } from '../../validators/otp';

const otpRouter: Router = Router();

otpRouter.post('/request', requestOtpValidator, OtpController.requestOtp);
otpRouter.post('/verify', verifyOtpValidator, OtpController.verifyOtp);

export { otpRouter };
