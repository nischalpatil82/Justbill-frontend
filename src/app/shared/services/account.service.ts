import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IAccountUser } from '../interface/account.interface';

@Injectable({
  providedIn: 'root',
})
export class AccountService {

  public isOpenMenu: boolean = false;

  /**
   * Read FULL login response from localStorage
   * and normalize it to IAccountUser
   */
  getUserDetails(): Observable<IAccountUser | null> {

    const stored = localStorage.getItem('account_user');

    if (!stored) {
      return of(null);
    }

    try {

      const apiResponse = JSON.parse(stored);
      const customer = apiResponse.m_customer;

      if (!customer || customer.id === 0) {
        return of(null);
      }

      const user: IAccountUser = {
        id: customer.id,
        name: `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim(),
        email: customer.email ?? '',
        phone: customer.mobile ?? '',
        country_code: '+91',

        status: customer.isActive ?? true,
        email_verified_at: customer.createdDateTime ?? null,
        orders_count: 0,

        // 🔥 IMPORTANT: Start with empty address list
        // We will fetch address list separately using get_CustomerAddressList API
        address: [],

        wallet: null,
        point: null,
        role: null,
        payment_account: null,
      };

      return of(user);

    } catch (e) {
      console.error('Invalid account_user data in localStorage', e);
      localStorage.removeItem('account_user');
      return of(null);
    }
  }
}
