import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { IWishlistResponse } from '../interface/wishlist.interface';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {

  private http = inject(HttpClient);

  /* =========================================
     🔥 GET CUSTOMER WISHLIST (POST API)
  ========================================= */

  getWishlist(customerID: number): Observable<IWishlistResponse> {

    const body = {
      messageInfo: {
        returnValue: 0,
        returnMessage: ""
      },
      userDBConnStr: "",
      customerID: customerID
    };

    return this.http.post<any>(
      'https://dev-api-justbill.itbycloud.com/api/Customer/get_CustomerWishList',
      body
    ).pipe(
      map(response => ({
        ml_productcustomer: response?.ml_productcustomer || [],
        messageInfo: response?.messageInfo,
        userDBConnStr: response?.userDBConnStr
      }))
    );
  }

  /* =========================================
     🔥 ADD / UPDATE / SOFT DELETE WISHLIST
  ========================================= */

  updateWishlist(body: any): Observable<any> {

    return this.http.post<any>(
      'https://dev-api-justbill.itbycloud.com/api/Customer/put_CustomerProductWish',
      body
    );
  }
}
