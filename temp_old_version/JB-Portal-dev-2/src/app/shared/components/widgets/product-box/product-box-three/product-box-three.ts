import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModule, NgbRating } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';

import { IProduct, IVariation } from '../../../../interface/product.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import {
  AddToWishlistAction,
  DeleteWishlistAction,
} from '../../../../store/action/wishlist.action';
import { WishlistState } from '../../../../store/state/wishlist.state';
import { DisplayVariantAttributes } from '../../display-variant-attributes/display-variant-attributes';
import { CartButton } from '../widgets/cart-button/cart-button';
import { ProductBoxImageVariant } from '../widgets/image-variant/image-variant';

import { QuickView } from '../widgets/product-hover-action/quick-view/quick-view';
import { Wishlist } from '../widgets/product-hover-action/wishlist/wishlist';



import { Router } from '@angular/router';


@Component({
  selector: 'app-product-box-three',
  imports: [
    CommonModule,
    CurrencySymbolPipe,
    RouterModule,
    NgbRating,
    NgbModule,
    QuickView,
    DisplayVariantAttributes,
    CartButton,

    ProductBoxImageVariant,
    Wishlist,
  ],
  templateUrl: './product-box-three.html',
  styleUrl: './product-box-three.scss',
})
export class ProductBoxThree {
  private store = inject(Store);

  readonly product = input<IProduct>();


private router = inject(Router);


  public hoverImage: string;
  public selectedVariation: IVariation;

  selectedVariant(variation: IVariation) {
    if (variation) {
      this.selectedVariation = variation;
    }
  }

  ariaValueText(current: number, max: number) {
    return `${current} out of ${max} hearts`;
  }

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
      this.router.navigate(['/wishlist']);  // 🔥 AUTO REDIRECT
    }
  });
}



}
