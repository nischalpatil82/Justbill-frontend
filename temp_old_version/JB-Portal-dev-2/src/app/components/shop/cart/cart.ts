import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { Button } from '../../../shared/components/widgets/button/button';
import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { ICart, ICartAddOrUpdate } from '../../../shared/interface/cart.interface';
import { CurrencySymbolPipe } from '../../../shared/pipe/currency.pipe';
import { DeleteCartAction, UpdateCartAction } from '../../../shared/store/action/cart.action';
import { CartState } from '../../../shared/store/state/cart.state';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    RouterModule,
    CurrencySymbolPipe,
    TranslateModule,
    Breadcrumb,
    Button,
    NoData,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  private store = inject(Store);

  // ✅ Clean Observables
  cartItem$: Observable<ICart[]> = this.store.select(CartState.cartItems);

  cartTotal$: Observable<number> = this.store.select(CartState.cartTotal).pipe(
    map(total => total ?? 0)
  );

  public breadcrumb: IBreadcrumb = {
    title: 'Cart',
    items: [{ label: 'Cart', active: true }],
  };

  // ✅ Quantity update
  updateQuantity(item: ICart, change: number) {
    const newQty = (item.quantity ?? 0) + change;

    if (newQty <= 0) {
      this.store.dispatch(new DeleteCartAction(item.id));
      return;
    }

    const params: ICartAddOrUpdate = {
      id: item.id,
      product: item.product,
      product_id: item.product?.id,
      variation: item.variation,
      variation_id: item.variation_id ?? null,
      quantity: change,
    };

    this.store.dispatch(new UpdateCartAction(params));
  }

  // ✅ Delete item
  delete(id: number) {
    this.store.dispatch(new DeleteCartAction(id));
  }
}