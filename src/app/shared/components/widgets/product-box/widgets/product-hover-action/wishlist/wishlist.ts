import { Component, inject, input } from '@angular/core';
import { Store } from '@ngxs/store';

import { IProduct } from '../../../../../../interface/product.interface';
import {
  AddToWishlistAction,
  DeleteWishlistAction,
} from '../../../../../../store/action/wishlist.action';
import { WishlistState } from '../../../../../../store/state/wishlist.state';

import { Router } from '@angular/router';


@Component({
  selector: 'app-wishlist',
  imports: [],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
})
export class Wishlist {
  private store = inject(Store);

private router = inject(Router);


  readonly product = input<IProduct>();
  readonly class = input<string>('');

  /* ================= WISHLIST TOGGLE ================= */

addToWishlist(product: IProduct) {

  const user = sessionStorage.getItem('account_user');
  if (!user) return;

  const parsedUser = JSON.parse(user);
  const customerID = parsedUser?.m_customer?.id;
  if (!customerID) return;

  const wishlistState = this.store.selectSnapshot(
    state => state.wishlist.wishlist.data
  );

  const existingItem = wishlistState.find(
    (item: any) => item.productID === product.id
  );

  let action;

  if (existingItem) {
    action = new DeleteWishlistAction(
      existingItem.id,
      product.id,
      customerID
    );
  } else {
    action = new AddToWishlistAction(
      product.id,
      customerID
    );
  }

  this.store.dispatch(action).subscribe({
    complete: () => {
      this.router.navigate(['/wishlist']); // 🔥 Redirect
    }
  });
}



}
