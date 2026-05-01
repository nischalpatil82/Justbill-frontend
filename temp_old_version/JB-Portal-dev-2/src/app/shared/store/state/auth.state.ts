
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

import {
  Action,
  Selector,
  State,
  StateContext,
  Store,
  NgxsOnInit
} from '@ngxs/store';

import {
  IAuthNumberLoginState,
  IAuthLoginResponse,
} from '../../interface/auth.interface';
import { AuthService } from '../../services/auth.service';
import { AccountClearAction, GetUserDetailsAction } from '../action/account.action';
import {
  AuthClearAction,
  ForgotPasswordAction,
  LoginAction,
  LoginWithNumberAction,
  LogoutAction,
  RegisterAction,
  UpdatePasswordAction,
  VerifyNumberOTPAction,
  VerifyOTPAction,
} from '../action/auth.action';
import { ClearCartAction } from '../action/cart.action';

/* ================= STATE MODEL ================= */

export interface AuthStateModel {
  email: string;
  number: IAuthNumberLoginState | null;
  token: string | number;
  access_token: string | null;
  permissions: any[];
}

/* ================= STATE ================= */

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    email: '',
    token: '',
    number: null,
    access_token: null,
    permissions: [],
  },
})
@Injectable()
export class AuthState implements NgxsOnInit {
  private store = inject(Store);
  private router = inject(Router);
  private authService = inject(AuthService);

  /* ================= RESTORE SESSION ON REFRESH ================= */

  ngxsOnInit(ctx: StateContext<AuthStateModel>) {
    const token = sessionStorage.getItem('access_token');
    const user = sessionStorage.getItem('account_user');

    if (token && user) {
      const parsedUser = JSON.parse(user);

      ctx.patchState({
        email: parsedUser?.m_customer?.email || '',
        token: token,
        access_token: token,
        permissions: [],
      });
    }
  }

  /* ================= SELECTORS ================= */

  @Selector()
  static accessToken(state: AuthStateModel): string | null {
    return state.access_token;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return !!state.access_token;
  }

  @Selector()
  static email(state: AuthStateModel): string {
    return state.email;
  }

  @Selector()
  static number(state: AuthStateModel): IAuthNumberLoginState | null {
    return state.number;
  }

  @Selector()
  static token(state: AuthStateModel): string | number {
    return state.token;
  }

  /* ================= ACTIONS ================= */

  @Action(RegisterAction)
  register(_ctx: StateContext<AuthStateModel>, _action: RegisterAction) {
    // future use
  }

  /* ===== LOGIN (SESSION STORED HERE) ===== */

  @Action(LoginAction)
  login(ctx: StateContext<AuthStateModel>, action: LoginAction) {
    return this.authService.login(action.payload).pipe(
      tap((response: IAuthLoginResponse) => {
        if (!response.isValidUser) {
          throw {
            message:
              response.messageInfo?.returnMessage ||
              'Invalid username or password',
          };
        }

        /* ===== UPDATE STATE ===== */
        ctx.patchState({
          email: response.m_customer.email,
          token: response.m_login_token,
          access_token: response.m_login_token,
          permissions: [],
        });

        /* ===== STORE SESSION DATA ===== */
        sessionStorage.setItem('access_token', response.m_login_token);
        sessionStorage.setItem('account_user', JSON.stringify(response));

        this.authService.isLogin = true;

        /* ===== LOAD USER DATA ===== */
        this.store.dispatch(new GetUserDetailsAction());
      })
    );
  }

  /* ===== LOGIN WITH NUMBER ===== */

  @Action(LoginWithNumberAction)
  loginWithNumber(
    ctx: StateContext<AuthStateModel>,
    action: LoginWithNumberAction
  ) {
    ctx.patchState({
      number: action.payload,
    });

    this.store.dispatch(new GetUserDetailsAction());
  }

  @Action(ForgotPasswordAction)
  forgotPassword(
    _ctx: StateContext<AuthStateModel>,
    _action: ForgotPasswordAction
  ) {
    // future use
  }

  @Action(VerifyOTPAction)
  verifyEmail(
    _ctx: StateContext<AuthStateModel>,
    _action: VerifyOTPAction
  ) {
    // future use
  }

  @Action(VerifyNumberOTPAction)
  verifyNumber(
    _ctx: StateContext<AuthStateModel>,
    _action: VerifyNumberOTPAction
  ) {
    this.store.dispatch(new GetUserDetailsAction());
  }

  @Action(UpdatePasswordAction)
  updatePassword(
    _ctx: StateContext<AuthStateModel>,
    _action: UpdatePasswordAction
  ) {
    // future use
  }

  /* ===== LOGOUT ===== */

  @Action(LogoutAction)
  logout(_ctx: StateContext<AuthStateModel>) {
    this.store.dispatch(new AuthClearAction());
    void this.router.navigate(['/']);
  }

  /* ===== CLEAR SESSION ===== */

  @Action(AuthClearAction)
  authClear(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({
      email: '',
      token: '',
      number: null,
      access_token: null,
      permissions: [],
    });

    /* ===== CLEAR SESSION STORAGE ===== */
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('account_user');

    this.authService.redirectUrl = undefined;
    this.authService.isLogin = false;

    this.store.dispatch(new AccountClearAction());
    this.store.dispatch(new ClearCartAction());
  }
}
