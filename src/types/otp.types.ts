export interface OtpRequest {
  identifier: string; // email or phone
  type: 'email' | 'phone';
}

export interface OtpVerifyInput {
  identifier: string;
  code: string;
}

export interface OtpGenerateOutput {
  id: string;
  identifier: string;
  code: string;
  expiresAt: Date;
}

export interface OtpVerifyOutput {
  success: boolean;
  message: string;
}
