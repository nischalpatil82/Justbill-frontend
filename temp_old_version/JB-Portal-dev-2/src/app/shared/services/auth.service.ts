


import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { IAuthLoginResponse, IAuthUserState } from '../interface/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  /**
   * Used only for redirect handling after login
   * (DO NOT store token here)
   */
  public redirectUrl?: string;

  /**
   * UI helper flags (modal / flow control only)
   */
  public confirmed = false;
  public isLogin = false;

  private readonly LOGIN_URL =
    'https://dev-api-justbill.itbycloud.com/api/Auth/get_CustomerLoginAccess';

  /**
   * Calls login API
   * Session handling is done in AuthState (NGXS)
   */
  login(payload: IAuthUserState): Observable<IAuthLoginResponse> {
    const body = {
      messageInfo: {
        returnValue: 0,
        returnMessage: '',
      },
      userDBConnStr: '',
      m_UserName: payload.email,
      m_Password: payload.password,
      m_EncryptionType: 0,
    };

    return this.http.post<IAuthLoginResponse>(this.LOGIN_URL, body);
  }

  logout() {
  localStorage.clear(); // or remove specific token
  this.isLogin = false;
}
}
