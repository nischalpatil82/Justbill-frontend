import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { mergeMap, switchMap, takeUntil } from 'rxjs/operators';

import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { ICountry, ICountryModel } from '../../../shared/interface/country.interface';
import { IOrderStatusModel } from '../../../shared/interface/order-status.interface';
import { IOrder } from '../../../shared/interface/order.interface';
import { IStates, IStatesModel } from '../../../shared/interface/state.interface';
import { CurrencySymbolPipe } from '../../../shared/pipe/currency.pipe';
import { GetOrderStatusAction } from '../../../shared/store/action/order-status.action';
import { OrderTrackingAction } from '../../../shared/store/action/order.action';
import { CountryState } from '../../../shared/store/state/country.state';
import { OrderStatusState } from '../../../shared/store/state/order-status.state';
import { OrderState } from '../../../shared/store/state/order.state';
import { StateState } from '../../../shared/store/state/state.state';

@Component({
  selector: 'app-order-details',
  imports: [TranslateModule, CurrencySymbolPipe, CommonModule, RouterModule, Breadcrumb, NoData],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss',
})
export class OrderDetails {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  orderStatus$: Observable<IOrderStatusModel> = inject(Store).select(OrderStatusState.orderStatus);
  country$: Observable<ICountryModel> = inject(Store).select(
    CountryState.country,
  ) as Observable<ICountryModel>;
  state$: Observable<IStatesModel> = inject(Store).select(
    StateState.state,
  ) as Observable<IStatesModel>;

  private destroy$ = new Subject<void>();

  public order: IOrder | null = null;
  public email_or_phone: string = '';
  public countries: ICountry[] = [];
  public states: IStates[] = [];

  public breadcrumb: IBreadcrumb = {
    title: 'Order Details',
    items: [{ label: 'Order Details', active: false }],
  };

  constructor() {
    this.store.dispatch(new GetOrderStatusAction());
    this.country$.subscribe(country => (this.countries = country.data));
    this.state$.subscribe(state => (this.states = state.data));
  }

ngOnInit() {

  const nav = history.state;

  // ✅ CASE 1: Coming from checkout (STATE)
  if (nav && nav.orderId) {
    this.order = {
      id: nav.orderId,
      order_number: nav.orderId,
      order_status: { name: 'Processing', sequence: 1 },
      consumer: { name: 'Guest User' },

      products: [
        {
          id: 1,
          name: 'Gold Ring',
          product_thumbnail: {
            original_url: 'assets/images/product_box/rose_gold_pendant_1.png'
          },
          pivot: {
            quantity: 1,
            single_price: nav.total,
            subtotal: nav.total
          }
        }
      ],

      billing_address: {
        street: 'Flat 305, 6th Cross',
        city: 'Bangalore',
        state_id: 1,
        country_id: 1,
        pincode: '560037',
        country_code: '91',
        phone: '9876543210'
      },

      shipping_address: {
        street: 'Flat 305, 6th Cross',
        city: 'Bangalore',
        state_id: 1,
        country_id: 1,
        pincode: '560037',
        country_code: '91',
        phone: '9876543210'
      },

      payment_method: 'cod',
      payment_status: 'pending',
      delivery_description: 'Express Delivery',

      sub_orders: [],

      amount: nav.total,
      shipping_total: 99,
      tax_total: nav.total * 0.05,
      total: nav.total
    } as any;

    return; // ✅ STOP HERE
  }

  // ✅ CASE 2: Coming from My Orders (URL PARAM)
  const orderNumber = this.route.snapshot.paramMap.get('id');

  if (orderNumber) {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');

    const foundOrder = storedOrders.find(
      (o: any) => o.order_number === orderNumber
    );

    if (foundOrder) {
      this.order = {
        id: foundOrder.order_number,
        order_number: foundOrder.order_number,
        order_status: { name: 'Processing', sequence: 1 },
        consumer: { name: 'Guest User' },

        products: [
          {
            id: 1,
            name: 'Gold Ring',
            product_thumbnail: {
              original_url: 'assets/images/product_box/ring.png'
            },
            pivot: {
              quantity: 1,
              single_price: foundOrder.total,
              subtotal: foundOrder.total
            }
          }
        ],

        billing_address: {
          street: 'Flat 305, 6th Cross',
          city: 'Bangalore',
          state_id: 1,
          country_id: 1,
          pincode: '560037',
          country_code: '91',
          phone: '9876543210'
        },

        shipping_address: {
          street: 'Flat 305, 6th Cross',
          city: 'Bangalore',
          state_id: 1,
          country_id: 1,
          pincode: '560037',
          country_code: '91',
          phone: '9876543210'
        },

        payment_method: foundOrder.payment_method,
        payment_status: foundOrder.payment_status,
        delivery_description: 'Express Delivery',

        sub_orders: [],

        amount: foundOrder.total,
        shipping_total: 99,
        tax_total: foundOrder.total * 0.05,
        total: foundOrder.total
      } as any;

      return; // ✅ STOP HERE
    }
  }

  // ✅ CASE 3: API (future)
}

  getCountryName(id: number) {
    return this.countries.find(country => country.id == id)?.name;
  }

  getStateName(id: number) {
    return this.states.find(state => state.id == id)?.name;
  }

  back() {
    this.location.back();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}