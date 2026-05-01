import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import {
  GetWishlistAction,
  AddToWishlistAction,
  DeleteWishlistAction,
} from '../action/wishlist.action';

import { WishlistService } from '../../services/wishlist.service';
import { IProductCustomer } from '../../interface/wishlist.interface';

export interface WishlistStateModel {
  wishlist: {
    data: IProductCustomer[];
    total: number;
  };
}

@State<WishlistStateModel>({
  name: 'wishlist',
  defaults: {
    wishlist: {
      data: [],
      total: 0,
    },
  },
})
@Injectable()
export class WishlistState {

  constructor(private wishlistService: WishlistService) {}

  /* ================= SELECTOR ================= */

  @Selector()
  static wishlistItems(state: WishlistStateModel) {
    return state.wishlist;
  }

  /* ================= GET ================= */

  @Action(GetWishlistAction)
  getWishlist(ctx: StateContext<WishlistStateModel>, { customerID }: GetWishlistAction) {
    return this.wishlistService.getWishlist(customerID).pipe(
      tap((res: any) => {

        const activeItems = res.ml_productcustomer?.filter(
          (item: IProductCustomer) => item.isActive
        ) || [];

        ctx.patchState({
          wishlist: {
            data: activeItems,
            total: activeItems.length,
          },
        });
      })
    );
  }

  /* ================= ADD ================= */

  @Action(AddToWishlistAction)
  add(ctx: StateContext<WishlistStateModel>, { productID, customerID }: AddToWishlistAction) {

    const body = {
      messageInfo: {
        returnValue: 0,
        returnMessage: ''
      },
      userDBConnStr: '',
      m_productcustomer: {
        id: 0,
        productID: productID,
        customerID: customerID,
        relationType: 'WISHLIST',
        notes: '',
        createdUserID: customerID,
        createdDateTime: new Date(),
        updatedUserID: customerID,
        updatedDateTime: new Date(),
        isActive: true
      }
    };

    return this.wishlistService.updateWishlist(body).pipe(
      tap(() => {
        ctx.dispatch(new GetWishlistAction(customerID));
      })
    );
  }

  /* ================= SOFT DELETE ================= */

  @Action(DeleteWishlistAction)
  delete(ctx: StateContext<WishlistStateModel>, { id, productID, customerID }: DeleteWishlistAction) {

    const body = {
      messageInfo: {
        returnValue: 0,
        returnMessage: ''
      },
      userDBConnStr: '',
      m_productcustomer: {
        id: id, // IMPORTANT: existing record ID
        productID: productID,
        customerID: customerID,
        relationType: 'WISHLIST',
        notes: '',
        createdUserID: customerID,
        createdDateTime: new Date(),
        updatedUserID: customerID,
        updatedDateTime: new Date(),
        isActive: false // 🔥 SOFT DELETE
      }
    };

    return this.wishlistService.updateWishlist(body).pipe(
      tap(() => {
        ctx.dispatch(new GetWishlistAction(customerID));
      })
    );
  }
}
