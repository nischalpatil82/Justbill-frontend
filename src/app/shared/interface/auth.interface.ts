export interface IAuthUserState {
  email: string;
  password: string;
}

export interface IAuthStateModal {
  email: string;
  token: string | number;
  access_token: string | null;
  permissions: any[];
}

/* ================= LOGIN RESPONSE MODELS ================= */

export interface IMessageInfo {
  returnValue: number;
  returnMessage: string | null;
}

export interface ICustomer {
  id: number;
  customerCode: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  customerType: string;
  companyName: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  gstno: string;
  status: number;
  createdUserID: number;
  createdDateTime: string;
  updatedUserID: number | null;
  updatedDateTime: string | null;
  isActive: boolean;
}

export interface IAuthLoginResponse {
  isValidUser: boolean;
  m_customer: ICustomer;
  m_login_token: string;
  messageInfo: IMessageInfo;
  userDBConnStr: string | null;
}

/* ================= FORGOT / OTP / REGISTER ================= */

export interface IAuthForgotPasswordState {
  email: string;
}

export interface IAuthNumberLoginState {
  phone: number;
  country_code: number;
}

export interface IAuthVerifyOTPState {
  email: string;
  token: string;
}

export interface IAuthVerifyNumberOTPState {
  phone: number;
  country_code: number;
  token: string;
}

export interface IUpdatePasswordState {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface IRegisterModal {
  name: string;
  email: string;
  phone: number;
  country_code: number;
  password: string;
  password_confirmation: string;
}
