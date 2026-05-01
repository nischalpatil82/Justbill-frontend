import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { IOrder, IOrderCheckout } from '../../interface/order.interface';
import {
  CheckoutAction,
  DownloadInvoiceAction,
  GetOrdersAction,
  OrderTrackingAction,
  PlaceOrderAction,
  RePaymentAction,
  ViewOrderAction,
} from '../action/order.action';

export class OrderStateModel {
  order = {
    data: [] as IOrder[],
    total: 0,
  };
  selectedOrder: IOrder | null;
  checkout: IOrderCheckout | null;
}

@State<OrderStateModel>({
  name: 'order',
  defaults: {
    order: {
      data: [],
      total: 0,
    },
    selectedOrder: null,
    checkout: null,
  },
})
@Injectable()
export class OrderState {

  private router = inject(Router);

  /* ================= SELECTORS ================= */

  @Selector()
  static order(state: OrderStateModel) {
    return state.order;
  }

  @Selector()
  static selectedOrder(state: OrderStateModel) {
    return state.selectedOrder;
  }

  @Selector()
  static checkout(state: OrderStateModel) {
    return state.checkout;
  }

  /* ================= MOCK ACTIONS ================= */

  @Action(GetOrdersAction)
  getOrders(ctx: StateContext<OrderStateModel>) {
    ctx.patchState({
      order: {
        data: [],
        total: 0,
      },
    });
  }

  @Action(ViewOrderAction)
  viewOrder(ctx: StateContext<OrderStateModel>) {
    ctx.patchState({
      selectedOrder: null,
    });
  }

  @Action(CheckoutAction)
  checkout(ctx: StateContext<OrderStateModel>, action: CheckoutAction) {

    const payload = action.payload;

    // Simple mock calculation
    let subTotal = 0;

    if (payload?.products?.length) {
      payload.products.forEach((p: any) => {
        subTotal += 1000 * p.quantity; // dummy price
      });
    }

    const tax = subTotal * 0.05;
    const shipping = 0;
    const total = subTotal + tax + shipping;

    const mockCheckout = {
      total: {
        convert_point_amount: 0,
        convert_wallet_balance: 0,
        coupon_total_discount: 0,
        points: 0,
        points_amount: 0,
        shipping_total: shipping,
        sub_total: subTotal,
        tax_total: tax,
        total: total,
        wallet_balance: 0,
      },
    };

    ctx.patchState({
      checkout: mockCheckout,
    });
  }

  @Action(PlaceOrderAction)
  placeOrder(ctx: StateContext<OrderStateModel>, action: PlaceOrderAction) {

    console.log("Mock Order Placed:", action.payload);

    alert("Order placed successfully (Mock Mode)");

    this.router.navigate(['/']);
  }

  @Action(RePaymentAction)
  rePayment() {
    return;
  }

  @Action(OrderTrackingAction)
  orderTracking() {
    return;
  }

  @Action(DownloadInvoiceAction)
  downloadInvoice() {
    return;
  }
}