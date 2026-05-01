import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';

import { IAccountUser } from '../../interface/account.interface';
import {
  AccountClearAction,
  GetUserDetailsAction,
  CreateAddressAction
} from '../action/account.action';

export interface AccountStateModel {
  user: IAccountUser | null;
  permissions: any[];
}

@State<AccountStateModel>({
  name: 'account',
  defaults: {
    user: null,
    permissions: [],
  },
})
@Injectable()
export class AccountState {

  private baseUrl = 'https://dev-api-justbill.itbycloud.com/api/Customer';

  constructor(private http: HttpClient) {}

  /* ================= SELECTORS ================= */

  @Selector()
  static user(state: AccountStateModel) {
    return state.user;
  }

  @Selector()
  static permissions(state: AccountStateModel) {
    return state.permissions;
  }

  /* ================= GET USER + ADDRESS ================= */

  @Action(GetUserDetailsAction)
  getUserDetails(ctx: StateContext<AccountStateModel>) {


   

    const stored = sessionStorage.getItem('account_user');

    if (!stored) return;

    try {
      const apiResponse = JSON.parse(stored);
      const customer = apiResponse.m_customer;

      if (!customer || customer.id === 0) return;

     const token = sessionStorage.getItem('access_token');


      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });

     const body = {
  messageInfo: {
    returnValue: 0,
    returnMessage: ""
  },
  userDBConnStr: "",
  customerID: customer.id
};


      return this.http
        .post(`${this.baseUrl}/get_CustomerAddressList`, body, { headers })
        .pipe(
          tap((res: any) => {

            const addresses = (res?.ml_address || []).map((addr: any) => ({
              id: addr.id,
              user_id: addr.customerID,

              title: addr.addressType,
              street: addr.addressLine1,
              type: addr.addressType,

              city: addr.city,
              pincode: addr.postalCode,

              state_id: 0,
              state: { name: addr.state },

              country: { name: addr.country },

              country_code: 91,
              phone: 0,
              country_id: 0,

              is_default: addr.isDefault
            }));

            const normalizedUser: IAccountUser = {
              id: customer.id,
              name: `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim(),
              email: customer.email ?? '',
              phone: customer.mobile ?? '',
              country_code: '+91',

              status: customer.isActive ?? true,
              email_verified_at: customer.createdDateTime ?? null,
              orders_count: 0,

              address: addresses,

              wallet: null,
              point: null,
              role: null,
              payment_account: null,
            };

            ctx.patchState({
              user: normalizedUser,
              permissions: [],
            });

          })
        );

    } catch (e) {
      console.error('Invalid account_user data in localStorage', e);
      localStorage.removeItem('account_user');
    }
  }

  /* ================= CREATE ADDRESS ================= */
@Action(CreateAddressAction)
createAddress(ctx: StateContext<AccountStateModel>, action: CreateAddressAction) {
  console.log("🔥 CREATE ACTION HIT");


  const token = sessionStorage.getItem('access_token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

 const body = {
  messageInfo: {
    returnValue: 0,
    returnMessage: ""
  },
  userDBConnStr: "",
  m_address: {
    id: 0,
    customerID: action.payload.user_id,

    addressType: action.payload.title,
    addressLine1: action.payload.street,
    addressLine2: action.payload.type || "",

    city: action.payload.city,
    state: action.payload.state?.name || "",
    postalCode: action.payload.pincode,
    country: action.payload.country?.name || "",

    isDefault: action.payload.is_default || false,

    createdUserID: action.payload.user_id,
    createdDateTime: new Date().toISOString(),

    updatedUserID: null,
    updatedDateTime: null,

    isActive: true
  }
};


  return this.http
    .post(`${this.baseUrl}/put_CustomerNewAddress`, body, { headers })
    .pipe(
      tap(() => {
        // 🔥 Refresh address list after successful create
        ctx.dispatch(new GetUserDetailsAction());
      })
    );
}


  /* ================= CLEAR ================= */

  @Action(AccountClearAction)
  accountClear(ctx: StateContext<AccountStateModel>) {
    ctx.patchState({
      user: null,
      permissions: [],
    });

    localStorage.removeItem('account_user');
  }
}
