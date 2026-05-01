import {
  IUpdatePasswordState,
  IAuthForgotPasswordState,
  IAuthUserState,
  IAuthVerifyOTPState,
  IRegisterModal,
  IAuthNumberLoginState,
  IAuthVerifyNumberOTPState,
  IAuthLoginResponse,
} from '../../interface/auth.interface';

/* ================= REGISTER ================= */

export class RegisterAction {
  static readonly type = '[Auth] Register';
  constructor(public payload: IRegisterModal) {}
}

/* ================= LOGIN ================= */

export class LoginAction {
  static readonly type = '[Auth] Login';
  constructor(public payload: IAuthUserState) {}
}

/* Optional: success & failure (future-proof, not mandatory) */
export class LoginSuccessAction {
  static readonly type = '[Auth] Login Success';
  constructor(public payload: IAuthLoginResponse) {}
}

export class LoginFailureAction {
  static readonly type = '[Auth] Login Failure';
  constructor(public error: any) {}
}

/* ================= LOGIN WITH NUMBER ================= */

export class LoginWithNumberAction {
  static readonly type = '[Auth] Login With Number';
  constructor(public payload: IAuthNumberLoginState) {}
}

/* ================= FORGOT PASSWORD ================= */

export class ForgotPasswordAction {
  static readonly type = '[Auth] ForgotPassword';
  constructor(public payload: IAuthForgotPasswordState) {}
}

/* ================= VERIFY EMAIL OTP ================= */

export class VerifyOTPAction {
  static readonly type = '[Auth] VerifyOTP';
  constructor(public payload: IAuthVerifyOTPState) {}
}

/* ================= VERIFY MOBILE OTP ================= */

export class VerifyNumberOTPAction {
  static readonly type = '[Auth] VerifyNumberOTP';
  constructor(public payload: IAuthVerifyNumberOTPState) {}
}

/* ================= UPDATE PASSWORD ================= */

export class UpdatePasswordAction {
  static readonly type = '[Auth] UpdatePassword';
  constructor(public payload: IUpdatePasswordState) {}
}

/* ================= LOGOUT & CLEAR ================= */

export class LogoutAction {
  static readonly type = '[Auth] Logout';
}

export class AuthClearAction {
  static readonly type = '[Auth] Clear';
}