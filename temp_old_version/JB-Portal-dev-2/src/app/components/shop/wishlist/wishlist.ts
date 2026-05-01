import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IProduct } from 'src/app/shared/interface/product.interface';

import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { Loader } from '../../../shared/components/widgets/loader/loader';
import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { ProductCartButton } from '../../../shared/components/widgets/product-box/widgets/product-cart-button/product-cart-button';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { IOption } from '../../../shared/interface/theme-option.interface';
import { CurrencySymbolPipe } from '../../../shared/pipe/currency.pipe';
import { ProductService } from '../../../shared/services/product.service';

import {
  DeleteWishlistAction,
  GetWishlistAction,
} from '../../../shared/store/action/wishlist.action';

import { ThemeOptionState } from '../../../shared/store/state/theme-option.state';
import { WishlistState } from '../../../shared/store/state/wishlist.state';

@Component({
  selector: 'app-wishlist',
  imports: [
    CommonModule,
    RouterModule,
    CurrencySymbolPipe,
    TranslateModule,
    Breadcrumb,
    NoData,
    ProductCartButton,
    Loader,
  ],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
})
export class Wishlist {

  private store = inject(Store);
  private productService = inject(ProductService);

  themeOption$: Observable<IOption> = this.store.select(
    ThemeOptionState.themeOptions
  ) as Observable<IOption>;

  public wishlistItems: IProduct[] = [];

  public breadcrumb: IBreadcrumb = {
    title: 'Wishlist',
    items: [{ label: 'Wishlist', active: true }],
  };

  /* ================= INIT ================= */

  ngOnInit() {

    const customerID = this.getCustomerID();
    if (!customerID) return;

    // Load wishlist from API
    this.store.dispatch(new GetWishlistAction(customerID));

    // React to wishlist state changes
    this.store.select(WishlistState.wishlistItems)
      .subscribe(state => {

        const productIds = state.data.map((item: any) => item.productID);

        if (!productIds.length) {
          this.wishlistItems = [];
          return;
        }

        // Load all products and filter
        this.productService.getProducts().subscribe((res: any) => {
          const allProducts = res?.data || [];

          this.wishlistItems = allProducts.filter((product: IProduct) =>
            productIds.includes(product.id)
          );
        });

      });
  }

  /* ================= GET CUSTOMER ID ================= */

  private getCustomerID(): number {
    const user = sessionStorage.getItem('account_user');
    if (!user) return 0;

    const parsed = JSON.parse(user);
    return parsed?.m_customer?.id || 0;
  }

  /* ================= REMOVE ================= */

  removeWishlist(product: IProduct) {

    const customerID = this.getCustomerID();
    if (!customerID) return;

    const wishlistState = this.store.selectSnapshot(
      state => state.wishlist.wishlist.data
    );

    const record = wishlistState.find(
      (item: any) => item.productID === product.id
    );

    if (!record) return;

    this.store.dispatch(
      new DeleteWishlistAction(
        record.id,        // DB record id
        product.id,
        customerID
      )
    );
  }
}
