import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, inject, PLATFORM_ID, viewChild } from '@angular/core';


import { Router } from '@angular/router';

import { SettingService } from '../../../shared/services/setting.service';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Select2Data, Select2Module, Select2UpdateEvent } from 'ng-select2-component';
import { map, Observable, of } from 'rxjs';

import { AddressBlock } from './address-block/address-block';
import { DeliveryBlock } from './delivery-block/delivery-block';
import { PaymentBlock } from './payment-block/payment-block';
import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { Button } from '../../../shared/components/widgets/button/button';
import { Loader } from '../../../shared/components/widgets/loader/loader';
import { AddressModal } from '../../../shared/components/widgets/modal/address-modal/address-modal';
import { CouponModal } from '../../../shared/components/widgets/modal/coupon-modal/coupon-modal';
import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { countryCodes } from '../../../shared/data/country-code';
import { IAccountUser } from '../../../shared/interface/account.interface';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { ICart } from '../../../shared/interface/cart.interface';
import { ICouponModel } from '../../../shared/interface/coupon.interface';
import { IOrderCheckout } from '../../../shared/interface/order.interface';
import { IDeliveryBlock, IValues } from '../../../shared/interface/setting.interface';
import { CurrencySymbolPipe } from '../../../shared/pipe/currency.pipe';
import { CartService } from '../../../shared/services/cart.service';
import { ClearCartAction } from '../../../shared/store/action/cart.action';
import { GetCouponsAction } from '../../../shared/store/action/coupon.action';
import { CheckoutAction, PlaceOrderAction } from '../../../shared/store/action/order.action';
import { GetSettingOptionAction } from '../../../shared/store/action/setting.action';
import { AccountState } from '../../../shared/store/state/account.state';
import { AuthState } from '../../../shared/store/state/auth.state';
import { CartState } from '../../../shared/store/state/cart.state';
import { CountryState } from '../../../shared/store/state/country.state';
import { CouponState } from '../../../shared/store/state/coupon.state';
import { OrderState } from '../../../shared/store/state/order.state';
import { SettingState } from '../../../shared/store/state/setting.state';
import { StateState } from '../../../shared/store/state/state.state';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    TranslateModule,
    CurrencySymbolPipe,
    FormsModule,
    ReactiveFormsModule,
    Breadcrumb,
    AddressBlock,
    DeliveryBlock,
    PaymentBlock,
    NoData,
    Loader,
    Select2Module,
    Button,
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private store = inject(Store);
  private formBuilder = inject(FormBuilder);
  cartService = inject(CartService);
  private modal = inject(NgbModal);

  private settingService = inject(SettingService);

  private router = inject(Router);

  public breadcrumb: IBreadcrumb = {
    title: 'Check-out',
    items: [{ label: 'Check-out', active: true }],
  };

  user$: Observable<IAccountUser> = inject(Store).select(
    AccountState.user,
  ) as Observable<IAccountUser>;
  accessToken$: Observable<String> = inject(Store).select(
    AuthState.accessToken,
  ) as Observable<String>;
  cartItem$: Observable<ICart[]> = inject(Store).select(CartState.cartItems);
  checkout$: Observable<IOrderCheckout> = inject(Store).select(
    OrderState.checkout,
  ) as Observable<IOrderCheckout>;
  setting$: Observable<IValues> = inject(Store).select(SettingState.setting) as Observable<IValues>;
  cartDigital$: Observable<boolean | number> = inject(Store).select(
    CartState.cartHasDigital,
  ) as Observable<boolean | number>;
  countries$: Observable<Select2Data> = inject(Store).select(CountryState.countries);
  coupon$: Observable<ICouponModel> = inject(Store).select(CouponState.coupon);

  readonly cpnRef = viewChild<ElementRef<HTMLInputElement>>('cpn');

  public form: FormGroup;
  public coupon: boolean = true;
  public couponCode: string;
  public appliedCoupon: boolean = false;
  public couponError: string | null;
  public checkoutTotal: IOrderCheckout;
  public loading: boolean = false;

  public shippingStates$: Observable<Select2Data>;
  public billingStates$: Observable<Select2Data>;

  public deliverySlots: any[] = [];
  public codes = countryCodes;
  public isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);

    this.isBrowser = isPlatformBrowser(platformId);
    this.store.dispatch(new GetSettingOptionAction());
    this.store.dispatch(new GetCouponsAction({ status: 1 }));

    this.form = this.formBuilder.group({
      products: this.formBuilder.array([], [Validators.required]),
      shipping_address_id: new FormControl('', [Validators.required]),
      billing_address_id: new FormControl('', [Validators.required]),

 // ✅ ADD HERE
  gift_wrap: new FormControl(false),
  greeting_message: new FormControl(''),

      points_amount: new FormControl(false),
      wallet_balance: new FormControl(false),
      coupon: new FormControl(),
      delivery_description: new FormControl('', [Validators.required]),
      delivery_interval: new FormControl(),
     delivery_slot_id: new FormControl(''),
      payment_method: new FormControl('', [Validators.required]),
      create_account: new FormControl(false),
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      country_code: new FormControl('91', [Validators.required]),
      phone: new FormControl('', [Validators.required]),
      password: new FormControl(),
      shipping_address: new FormGroup({
        title: new FormControl('', [Validators.required]),
        street: new FormControl('', [Validators.required]),
        city: new FormControl('', [Validators.required]),
        phone: new FormControl('', [Validators.required]),
        pincode: new FormControl('', [Validators.required]),
        country_code: new FormControl('91', [Validators.required]),
        country_id: new FormControl('', [Validators.required]),
        state_id: new FormControl('', [Validators.required]),

      
      }),
      billing_address: new FormGroup({
        same_shipping: new FormControl(false),
        title: new FormControl('', [Validators.required]),
        street: new FormControl('', [Validators.required]),
        city: new FormControl('', [Validators.required]),
        phone: new FormControl('', [Validators.required]),
        pincode: new FormControl('', [Validators.required]),
        country_code: new FormControl('91', [Validators.required]),
        country_id: new FormControl('', [Validators.required]),
        state_id: new FormControl('', [Validators.required]),
      }),
    });

    this.store.selectSnapshot(state => state.setting).setting.activation.guest_checkout = true;

    if (this.store.selectSnapshot(state => state.auth && state.auth.access_token)) {
      this.form.removeControl('create_account');
      this.form.removeControl('name');
      this.form.removeControl('email');
      this.form.removeControl('country_code');
      this.form.removeControl('phone');
      this.form.removeControl('password');
      this.form.removeControl('password_confirmation');
      this.form.removeControl('shipping_address');
      this.form.removeControl('billing_address');

      this.cartDigital$.subscribe(value => {
        if (value == 1) {
          this.form.controls['shipping_address_id'].clearValidators();
          this.form.controls['delivery_description'].clearValidators();
        } else {
          this.form.controls['shipping_address_id'].setValidators([Validators.required]);
          this.form.controls['delivery_description'].setValidators([Validators.required]);
        }
        this.form.controls['shipping_address_id'].updateValueAndValidity();
        this.form.controls['delivery_description'].updateValueAndValidity();
      });
    } else {
      if (this.store.selectSnapshot(state => state.setting).setting.activation.guest_checkout) {
        this.form.removeControl('shipping_address_id');
        this.form.removeControl('billing_address_id');
        this.form.removeControl('points_amount');
        this.form.removeControl('wallet_balance');

        this.form.controls['create_account'].valueChanges.subscribe(value => {
          if (value) {
            this.form.controls['name'].setValidators([Validators.required]);
            this.form.controls['password'].setValidators([Validators.required]);
          } else {
            this.form.controls['name'].clearValidators();
            this.form.controls['password'].clearValidators();
          }
          this.form.controls['name'].updateValueAndValidity();
          this.form.controls['password'].updateValueAndValidity();
        });

        this.form.statusChanges.subscribe(value => {
          if (value == 'VALID') {
            this.checkout();
          }
        });
      }
    }

    this.form.get('billing_address.same_shipping')?.valueChanges.subscribe(value => {
      if (value) {
        this.form
          .get('billing_address.title')
          ?.setValue(this.form.get('shipping_address.title')?.value);
        this.form
          .get('billing_address.street')
          ?.setValue(this.form.get('shipping_address.street')?.value);
        this.form
          .get('billing_address.country_id')
          ?.setValue(this.form.get('shipping_address.country_id')?.value);
        this.form
          .get('billing_address.state_id')
          ?.setValue(this.form.get('shipping_address.state_id')?.value);
        this.form
          .get('billing_address.city')
          ?.setValue(this.form.get('shipping_address.city')?.value);
        this.form
          .get('billing_address.pincode')
          ?.setValue(this.form.get('shipping_address.pincode')?.value);
        this.form
          .get('billing_address.country_code')
          ?.setValue(this.form.get('shipping_address.country_code')?.value);
        this.form
          .get('billing_address.phone')
          ?.setValue(this.form.get('shipping_address.phone')?.value);
      } else {
        this.form.get('billing_address.title')?.setValue('');
        this.form.get('billing_address.street')?.setValue('');
        this.form.get('billing_address.country_id')?.setValue('');
        this.form.get('billing_address.state_id')?.setValue('');
        this.form.get('billing_address.city')?.setValue('');
        this.form.get('billing_address.pincode')?.setValue('');
        this.form.get('billing_address.country_code')?.setValue('');
        this.form.get('billing_address.phone')?.setValue('');
      }
    });

    this.cartService.getUpdateQtyClickEvent().subscribe(() => {
      this.products();
      this.checkout();
    });
  }

  get productControl(): FormArray {
    return this.form.get('products') as FormArray;
  }

  ngOnInit() {
    this.checkout$.subscribe(data => (this.checkoutTotal = data));
    this.products();

    this.user$.subscribe(user => {
  if (user?.address?.length === 1) {
    const id = user.address[0].id;
    this.selectShippingAddress(id);
    this.selectBillingAddress(id);
  }
  
});

this.cartItem$.subscribe(items => {
  if (items && items.length > 0) {
    this.calculateLocalTotal(items);
  }
});

this.settingService.getDeliverySlots().subscribe(res => {
  
  this.deliverySlots = res;
});

  }

  products() {
    this.cartItem$.subscribe(items => {
      this.productControl.clear();
      items.forEach((item: ICart) =>
        this.productControl.push(
          this.formBuilder.group({
            product_id: new FormControl(item?.product_id, [Validators.required]),
            variation_id: new FormControl(item?.variation_id ? item?.variation_id : ''),
            quantity: new FormControl(item?.quantity),
          }),
        ),
      );
    });
  }

  //Time being bill total
  private calculateLocalTotal(items: ICart[]) {
  let subTotal = 0;

  items.forEach(item => {
    const price =
      item?.variation?.sale_price ??
      item?.product?.sale_price ??
      0;

    subTotal += price * item.quantity;
  });

  const tax = subTotal * 0.05; // 5% temporary tax
  const shipping = 99; // temporary
  const total = subTotal + tax + shipping;

  this.checkoutTotal = {
    total: {
      sub_total: subTotal,
      tax_total: tax,
      shipping_total: shipping,
      total: total,
      coupon_total_discount: 0,
      convert_point_amount: 0,
      convert_wallet_balance: 0
    }
  } as any;
}


  selectShippingAddress(id: number) {
    if (id) {
      this.form.controls['shipping_address_id'].setValue(Number(id));
      this.checkout();
    }
  }

  selectBillingAddress(id: number) {
    if (id) {
      this.form.controls['billing_address_id'].setValue(Number(id));
      this.checkout();
    }
  }

selectDeliverySlot(slot: any) {
  this.form
    .get('shipping_address.delivery_slot_id')
    ?.setValue(slot.id);

  this.form.controls['delivery_interval']
    .setValue(slot.slotTime);

  this.checkout();
}

shippingAddresses$ = this.user$.pipe(
  map(user => {
    if (!user?.address?.length) return [];

    // If only 1 address → show it
    if (user.address.length === 1) {
      return user.address;
    }

    // If multiple → filter shipping
    return user.address.filter(a =>
      a.title?.toLowerCase() === 'shipping'
    );
  })
);

billingAddresses$ = this.user$.pipe(
  map(user => {
    if (!user?.address?.length) return [];

    // If only 1 address → show same address
    if (user.address.length === 1) {
      return user.address;
    }

    // If multiple → filter billing
    return user.address.filter(a =>
      a.title?.toLowerCase() === 'billing'
    );
  })
);

trackBySlot(index: number, item: any) {
  return item.id;
}



getFilteredAddresses(addresses: any[] | undefined, type: string) {

  if (!addresses || addresses.length === 0) return [];

  // If only one address → show in both
  if (addresses.length === 1) {
    return addresses;
  }

  return addresses.filter(a => a.title?.toLowerCase() === type);
}








selectDelivery(value: IDeliveryBlock) {

  this.form.controls['delivery_description']
      .setValue(value?.delivery_description);

  this.form.controls['delivery_interval']
      .setValue(value?.delivery_interval);

  if (value?.delivery_description?.toLowerCase().includes('express')) {
    this.form.controls['delivery_slot_id']
        .setValidators([Validators.required]);
  } else {
    this.form.controls['delivery_slot_id']
        .clearValidators();
  }

  this.form.controls['delivery_slot_id']
      .updateValueAndValidity();

  this.checkout();
}

  selectPaymentMethod(value: string) {
    this.form.controls['payment_method'].setValue(value);
    this.checkout();
  }

  togglePoint(event: Event) {
    this.form.controls['points_amount'].setValue((<HTMLInputElement>event.target)?.checked);
    this.checkout();
  }

toggleGiftCard() {
  const current = this.form.value.gift_wrap;
  this.form.controls['gift_wrap'].setValue(!current);

  // Instead of manual total calculation
  this.checkout();
}

  toggleWallet(event: Event) {
    this.form.controls['wallet_balance'].setValue((<HTMLInputElement>event.target)?.checked);
    this.checkout();
  }

  showCoupon() {
    this.coupon = true;
  }

setCoupon(value?: string) {

  this.couponError = null;

  if (!value) {
    this.appliedCoupon = false;
    return;
  }

  const code = value.toUpperCase();

  this.cartItem$.subscribe(items => {

    let subTotal = 0;

    items.forEach(item => {
      const price =
        item?.variation?.sale_price ??
        item?.product?.sale_price ??
        0;

      subTotal += price * item.quantity;
    });

    let discount = 0;

    // 🎯 Dummy coupon logic
    if (code === 'HOLIDAY40') {
      discount = subTotal * 0.40; // 40% off
    } 
    else if (code === 'FREESHIP50') {
      discount = 50; // ₹50 off
    } 
    else {
      this.couponError = "Invalid coupon";
      return;
    }

    const shipping = 99;
    const tax = subTotal * 0.05;

    const total = subTotal + tax + shipping - discount;

    this.checkoutTotal = {
      total: {
        sub_total: subTotal,
        tax_total: tax,
        shipping_total: shipping,
        total: total,
        coupon_total_discount: discount,
        convert_point_amount: 0,
        convert_wallet_balance: 0
      }
    } as any;

    this.appliedCoupon = true;

  }).unsubscribe();
}

  couponRemove() {
    this.setCoupon();
  }

  shippingCountryChange(data: Select2UpdateEvent) {
    if (data && data?.value) {
      this.shippingStates$ = this.store
        .select(StateState.states)
        .pipe(map(filterFn => filterFn(+data?.value)));
    } else {
      this.form.get('shipping_address.state_id')?.setValue('');
      this.shippingStates$ = of();
    }
  }

  billingCountryChange(data: Select2UpdateEvent) {
    if (data && data?.value) {
      this.billingStates$ = this.store
        .select(StateState.states)
        .pipe(map(filterFn => filterFn(+data?.value)));
      if (this.form.get('billing_address.same_shipping')?.value) {
        setTimeout(() => {
          this.form
            .get('billing_address.state_id')
            ?.setValue(this.form.get('shipping_address.state_id')?.value);
        }, 200);
      }
    } else {
      this.form.get('billing_address.state_id')?.setValue('');
      this.billingStates$ = of();
    }
  }

checkout() {

  if (this.productControl.length === 0) return;

// ❗ Allow calculation even if form invalid (dummy mode)
if (this.form.invalid) {
  console.log("Form invalid - but calculating total anyway");
}

  this.cartItem$.subscribe(items => {
    this.calculateLocalTotal(items);
  });
} 
placeorder() {

  // ✅ Generate Order ID
  const orderId = 'ORD' + Math.floor(100000 + Math.random() * 900000);

  // ✅ Get total
  const total = this.checkoutTotal?.total?.total || 0;

  // ✅ Get existing orders safely
  let existingOrders = [];
  try {
    existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  } catch (e) {
    existingOrders = [];
  }

  // ✅ Create new order object
  const newOrder = {
    order_number: orderId,
    created_at: new Date().toISOString(), // ✅ important fix
    total: total,
    payment_status: 'pending',
    payment_method: this.form.value.payment_method || 'cod'
  };

  // ✅ Push & save
  existingOrders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(existingOrders));

  // ✅ Debug (VERY IMPORTANT)
  console.log("Saved Orders:", existingOrders);

  // ✅ Clear cart
  this.clearCart();

  // ✅ Navigate to order details
  this.router.navigate(['/order/details'], {
    state: {
      orderId: orderId,
      total: total
    }
  });
}

  clearCart() {
    this.store.dispatch(new ClearCartAction());
  }

  openModal() {
    this.modal.open(AddressModal, { centered: true, windowClass: 'theme-modal-2' });
  }

  couponModal() {
    this.modal.open(CouponModal, {
      centered: true,
      windowClass: 'theme-modal-2 coupon-modal',
      size: 'lg',
    });
  }

  copyFunction(txt: string) {
    void navigator.clipboard.writeText(txt);
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      this.store.dispatch(new ClearCartAction());
      this.form.reset();
    }

    
  }
}
