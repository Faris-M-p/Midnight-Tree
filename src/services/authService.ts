/**
 * Password recovery uses Firebase Auth. MidnightApi account endpoints are gone.
 */

import { sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseAuth } from "../firebase/config/firebase";
import { FirebaseClientError, runFirebase } from "../firebase/errors/firebaseErrorHandler";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  OtpChallengeResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  VerifyForgotPasswordOtpRequest,
  VerifyForgotPasswordOtpResponse
} from "../types/auth";

function unavailable(): never {
  throw new FirebaseClientError("This action uses Firebase sign-in only.", "failed-precondition");
}

export function registerAccount(_payload: RegisterRequest): Promise<RegisterResponse> {
  unavailable();
}

export function verifyEmail(_payload: VerifyEmailRequest): Promise<LoginResponse> {
  unavailable();
}

export async function verifyEmailAndPersistSession(_payload: VerifyEmailRequest): Promise<LoginResponse> {
  unavailable();
}

export function resendVerification(_payload: ResendVerificationRequest): Promise<OtpChallengeResponse> {
  unavailable();
}

export function loginAccount(_payload: LoginRequest): Promise<LoginResponse> {
  unavailable();
}

export async function loginAndPersistSession(_payload: LoginRequest): Promise<LoginResponse> {
  unavailable();
}

export function requestForgotPassword(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  return runFirebase("firebase.auth.resetEmail", async () => {
    await sendPasswordResetEmail(getFirebaseAuth(), payload.email.trim());
    return {
      message: "If an account exists for this email, a reset link has been sent."
    };
  });
}

export function verifyForgotPasswordOtp(
  _payload: VerifyForgotPasswordOtpRequest
): Promise<VerifyForgotPasswordOtpResponse> {
  unavailable();
}

export function resetPassword(_payload: ResetPasswordRequest): Promise<void> {
  unavailable();
}
