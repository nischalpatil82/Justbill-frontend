import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { filter, map, take } from 'rxjs/operators';

import { GetProductBySlugAction } from '../store/action/product.action';
import { ProductState } from '../store/state/product.state';

export const ProductResolver: ResolveFn<boolean> = (route) => {
  const store = inject(Store);
  const sku = route.paramMap.get('slug'); // slug = SKU

  if (!sku) {
    return true;
  }

  store.dispatch(new GetProductBySlugAction(sku));

  return store.select(ProductState.selectedProduct).pipe(
    filter(product => !!product),
    take(1),
    map(() => true) // 🔥 THIS IS REQUIRED
  );
};
