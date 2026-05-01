import { Routes } from '@angular/router';

import { AuthGuard } from '../../core/guard/auth.guard';
import { CheckoutGuard } from '../../core/guard/checkout.guard';
import { BrandResolver } from '../../shared/resolver/brand.resolver';
import { CategoryResolver } from '../../shared/resolver/category.resolver';
import { ProductResolver } from '../../shared/resolver/product.resolver';
import { StoreResolver } from '../../shared/resolver/store.resolver';

/* 🔥 IMPORT SMALL COMPONENTS DIRECTLY (NO CHUNKS) */
import { Cart } from './cart/cart';
import { Wishlist } from './wishlist/wishlist';
import { Compare } from './compare/compare';
import { OrderTracking } from './order-tracking/order-tracking';
import { OrderDetails } from './order-details/order-details';

export const shop: Routes = [

  /* ✅ NO LAZY LOADING → REDUCES REQUESTS */
  {
    path: 'cart',
    component: Cart,
  },

  {
    path: 'wishlist',
    component: Wishlist,
    canActivate: [AuthGuard],
  },

  {
    path: 'compare',
    component: Compare,
    canActivate: [AuthGuard],
  },

  {
    path: 'order/tracking',
    component: OrderTracking,
  },

  {
    path: 'order/details',
    component: OrderDetails,
  },

  /* 🔥 KEEP LAZY LOADING ONLY FOR HEAVY PAGES */

  {
    path: 'collections',
    loadComponent: () => import('./collection/collection').then(m => m.Collection),
  },

  {
    path: 'shopping',
    loadComponent: () => import('./collection/collection').then(m => m.Collection),
  },

  {
    path: 'product/:id',
    loadComponent: () => import('./product/product').then(m => m.Product),
  },

  {
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout').then(m => m.Checkout),
    canActivate: [AuthGuard],
  },

  {
    path: 'seller/become-seller',
    loadComponent: () => import('./seller/seller').then(m => m.Seller),
  },

  {
    path: 'seller/stores',
    loadComponent: () => import('./seller/seller-store/seller-store').then(m => m.SellerStore),
  },

  {
    path: 'seller/store/:slug',
    loadComponent: () =>
      import('./seller/seller-details/seller-details').then(m => m.SellerDetails),
    resolve: {
      data: StoreResolver,
    },
  },

  {
    path: 'brand/:slug',
    loadComponent: () => import('./brand/brand').then(m => m.Brand),
    resolve: {
      data: BrandResolver,
    },
  },

  {
    path: 'category/:slug',
    redirectTo: 'collections',
    pathMatch: 'full'
  }
];