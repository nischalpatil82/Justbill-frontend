
import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { of, tap } from 'rxjs';

import { ICart, ICartModel } from '../../interface/cart.interface';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import {
  AddToCartAction,
  AddToCartLocalStorageAction,
  ClearCartAction,
  CloseStickyCartAction,
  DeleteCartAction,
  GetCartItemsAction,
  ReplaceCartAction,
  SyncCartAction,
  ToggleSidebarCartAction,
  UpdateCartAction,
} from '../action/cart.action';

export interface CartStateModel {
  items: ICart[];
  total: number;
  is_digital_only: boolean | number | null;
  stickyCartOpen: boolean;
  sidebarCartOpen: boolean;
}

@State<CartStateModel>({
  name: 'cart',
  defaults: {
    items: [],
    total: 0,
    is_digital_only: null,
    stickyCartOpen: false,
    sidebarCartOpen: false,
  },
})
@Injectable()
export class CartState {
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private store = inject(Store);

  ngxsOnInit(ctx: StateContext<CartStateModel>) {
    ctx.dispatch(new ToggleSidebarCartAction(false));
    ctx.dispatch(new CloseStickyCartAction());
  }

  /* ================================
     SELECTORS
  ================================ */
  @Selector()
  static cartItems(state: CartStateModel) {
    return state.items;
  }

@Selector()
static cartTotalQuantity(state: CartStateModel): number {
  if (!state.items || state.items.length === 0) {
    return 0; // ✅ always return 0
  }

  return state.items.reduce((total, item) => {
    return total + (item?.quantity ?? 0);
  }, 0);
}



@Selector()
static cartTotal(state: CartStateModel): number {
  return state.total ?? 0; // ✅ fallback
}

  @Selector()
  static cartHasDigital(state: CartStateModel) {
    return state.is_digital_only;
  }

  @Selector()
  static stickyCart(state: CartStateModel) {
    return state.stickyCartOpen;
  }

  @Selector()
  static sidebarCartOpen(state: CartStateModel) {
    return state.sidebarCartOpen;
  }

  /* ================================
     GET CART ITEMS (SAFE)
  ================================ */
  @Action(GetCartItemsAction)
  getCartItems(ctx: StateContext<CartStateModel>) {
    return this.cartService.getCartItems().pipe(
      tap({
        next: result => {
          // ✅ HANDLE EMPTY / REMOVED CART JSON
          if (!result || !result.items) {
            ctx.patchState({
              items: [],
              total: 0,
              is_digital_only: null,
            });
            return;
          }

          result.items.forEach((item: ICart) => {
            if (item?.variation) {
              item.variation.selected_variation = item?.variation?.attribute_values
                ?.map(values => values.value)
                ?.join('/');
            }
          });

          ctx.patchState({
            items: result.items || [],
            total: result.total || 0,
            is_digital_only: result.is_digital_only ?? null,
          });
        },
        error: err => {
          console.error('GetCartItems error', err);
          ctx.patchState({
            items: [],
            total: 0,
          });
        },
      }),
    );
  }

  /* ================================
     ADD TO CART (FIXED LOGIC)
  ================================ */
  @Action(AddToCartAction)
  add(ctx: StateContext<CartStateModel>, action: AddToCartAction) {
    const state = ctx.getState();

    const exists = state.items.find(
      item =>
        item.product_id === action.payload.product_id &&
        item.variation_id === action.payload.variation_id,
    );

    // ✅ If item exists → update
    if (exists) {
      return this.store.dispatch(new UpdateCartAction(action.payload));
    }

    // ✅ Otherwise → add new item
    return this.store.dispatch(new AddToCartLocalStorageAction(action.payload));
  }

  /* ================================
     ADD TO CART (LOCAL STORAGE)
  ================================ */
  @Action(AddToCartLocalStorageAction)
  addToLocalStorage(ctx: StateContext<CartStateModel>, action: AddToCartLocalStorageAction) {
    const salePrice = action.payload.variation
      ? action.payload.variation.sale_price
      : action.payload.product?.sale_price;

    const result: ICartModel = {
      is_digital_only: false,
      items: [
        {
          id: Number(Math.floor(Math.random() * 10000).toString().padStart(4, '0')),
          quantity: action.payload.quantity,
          sub_total: salePrice ? salePrice * action.payload.quantity : 0,
          product: action.payload.product!,
          product_id: action.payload.product_id,
          wholesale_price: null,
          variation: action.payload.variation!,
          variation_id: action.payload.variation_id,
        },
      ],
    };

    const state = ctx.getState();
    const output = { ...state };

    output.items = [...state.items, ...result.items];

    output.items.forEach(item => {
      if (item?.variation) {
        item.variation.selected_variation = item?.variation?.attribute_values
          ?.map(values => values.value)
          ?.join('/');
      }
    });

    output.total = output.items.reduce((prev, curr) => prev + Number(curr.sub_total), 0);

    output.stickyCartOpen = true;
    output.sidebarCartOpen = true;
    output.is_digital_only = output.items
      .map(item => item.product?.product_type)
      .every(type => type === 'digital');

    ctx.patchState(output);

    setTimeout(() => {
      this.store.dispatch(new CloseStickyCartAction());
    }, 1500);
  }

  /* ================================
     UPDATE CART (SAFE)
  ================================ */
 @Action(UpdateCartAction)
update(ctx: StateContext<CartStateModel>, action: UpdateCartAction) {
  const state = ctx.getState();
  const cart = [...state.items];
  const index = cart.findIndex(item =>
  item.product_id === action.payload.product_id &&
  item.variation_id === action.payload.variation_id
);

  // If item not found → add
  if (index === -1) {
    return this.store.dispatch(new AddToCartLocalStorageAction(action.payload));
  }

  const newQty = cart[index].quantity + action.payload.quantity;

  //  REMOVE ITEM IF QTY <= 0
  if (newQty <= 0) {
    const updatedCart = cart.filter(item => item.id !== action.payload.id);

    ctx.patchState({
      items: updatedCart,
      total: updatedCart.reduce((prev, curr) => prev + Number(curr.sub_total), 0),
    });
    return;
  }

  // ✅ UPDATE ITEM
  cart[index].quantity = newQty;
  cart[index].sub_total =
    newQty *
    (cart[index]?.variation
      ? cart[index]?.variation?.sale_price
      : cart[index].product.sale_price);

  ctx.patchState({
    items: cart,
    total: cart.reduce((prev, curr) => prev + Number(curr.sub_total), 0),
  });
}


  /* ================================
     DELETE CART ITEM
  ================================ */
  @Action(DeleteCartAction)
  delete(ctx: StateContext<CartStateModel>, { id }: DeleteCartAction) {
    const cart = ctx.getState().items.filter(item => item.id !== id);

    ctx.patchState({
      items: cart,
      total: cart.reduce((prev, curr) => prev + Number(curr.sub_total), 0),
    });
  }

  /* ================================
     UI ACTIONS
  ================================ */
  @Action(CloseStickyCartAction)
  closeStickyCart(ctx: StateContext<CartStateModel>) {
    ctx.patchState({ stickyCartOpen: false });
  }

  @Action(ToggleSidebarCartAction)
  toggleSidebarCart(ctx: StateContext<CartStateModel>, { value }: ToggleSidebarCartAction) {
    ctx.patchState({ sidebarCartOpen: value });
  }

  /* ================================
     CLEAR CART
  ================================ */
  @Action(ClearCartAction)
  clearCart(ctx: StateContext<CartStateModel>) {
    ctx.patchState({
      items: [],
      total: 0,
      is_digital_only: null,
    });
  }

  @Action(SyncCartAction)
  syncCart() {
    // future sync logic
  }
}
