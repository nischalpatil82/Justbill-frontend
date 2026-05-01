import { CommonModule } from "@angular/common";

import { Component, HostListener, inject, input } from "@angular/core";

import { RouterModule } from "@angular/router";

import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { TranslateModule } from "@ngx-translate/core";

import { Store } from "@ngxs/store";

import { Observable } from "rxjs";

import { ICart, ICartAddOrUpdate } from "../../../../interface/cart.interface";

import { IOption } from "../../../../interface/theme-option.interface";

import { IValues } from "../../../../interface/setting.interface";

import { CurrencySymbolPipe } from "../../../../pipe/currency.pipe";

import { CartService } from "../../../../services/cart.service";

import {
  ClearCartAction,
  DeleteCartAction,
  ToggleSidebarCartAction,
  UpdateCartAction,
} from "../../../../store/action/cart.action";

import { CartState } from "../../../../store/state/cart.state";

import { SettingState } from "../../../../store/state/setting.state";

import { ThemeOptionState } from "../../../../store/state/theme-option.state";

import { Button } from "../../../widgets/button/button";

import { VariationModal } from "../../../widgets/modal/variation-modal/variation-modal";

@Component({
  selector: "app-cart",

  standalone: true,

  imports: [
    CommonModule,

    CurrencySymbolPipe,

    TranslateModule,

    RouterModule,

    Button,
  ],

  templateUrl: "./cart.html",

  styleUrl: "./cart.scss",
})
export class Cart {
  private store = inject(Store);

  private modal = inject(NgbModal);

  cartService = inject(CartService);

  // 🔥 Observables

  cartItem$: Observable<ICart[]> = this.store.select(CartState.cartItems);

  cartTotal$: Observable<number> = this.store.select(CartState.cartTotal);

  cartQty$: Observable<number> = this.store.select(CartState.cartTotalQuantity); // 🔥 ADD THIS

  sidebarCartOpen$: Observable<boolean> = this.store.select(
    CartState.sidebarCartOpen,
  );

  themeOption$: Observable<IOption> = this.store.select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  setting$: Observable<IValues> = this.store.select(
    SettingState.setting,
  ) as Observable<IValues>;

  readonly style = input<string>("basic");

  public cartStyle: string = "cart_sidebar";

  public cart: string = "cart_sidebar";

  // 🔥 REQUIRED FOR TEMPLATE

  public shippingFreeAmt: number = 0;

  public cartTotal: number = 0;

  public shippingCal: number = 0;

  public confetti: number = 0;

  public confettiItems = Array.from({ length: 150 }, (_, i) => i);

  constructor() {
    // Theme

    this.themeOption$.subscribe((option) => {
      this.cartStyle = option?.general?.cart_style ?? "cart_sidebar";

      this.cart = this.cartStyle;
    });

    // 🔥 FREE SHIPPING LOGIC (Amount Based)

    this.cartTotal$.subscribe((total) => {
      this.cartTotal = total;

      this.setting$.subscribe((setting) => {
        this.shippingFreeAmt = setting?.general?.min_order_free_shipping || 0;
      });

      if (this.shippingFreeAmt > 0) {
        this.shippingCal = (this.cartTotal * 100) / this.shippingFreeAmt;
      } else {
        this.shippingCal = 0;
      }

      if (this.shippingCal >= 100) {
        this.shippingCal = 100;

        if (this.confetti === 0) {
          this.confetti = 1;

          setTimeout(() => {
            this.confetti = 2;
          }, 4500);
        }
      } else {
        this.confetti = 0;
      }
    });
  }

  // Responsive

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    if (this.cartStyle === "cart_mini") {
      if (event?.target?.innerWidth <= 767) {
        this.cart = "cart_sidebar";
      } else {
        this.cart = "cart_mini";
      }
    }
  }

  cartToggle(value: boolean) {
    this.store.dispatch(new ToggleSidebarCartAction(value));
  }

  updateQuantity(item: ICart, qty: number) {
    const stock = item?.variation?.quantity ?? item?.product?.quantity ?? 0;

    const newQty = item.quantity + qty;

    // Remove item if qty becomes 0

    if (newQty <= 0) {
      this.store.dispatch(new DeleteCartAction(item.id));

      return;
    }

    // Prevent exceeding stock

    if (newQty > stock) {
      alert("Maximum stock reached");

      return;
    }

    const params: ICartAddOrUpdate = {
      id: item?.id,

      product_id: item?.product?.id,

      product: item?.product ?? null,

      variation_id: item?.variation_id ?? null,

      variation: item?.variation ?? null,

      quantity: qty,
    };

    this.store.dispatch(new UpdateCartAction(params));
  }

  delete(id: number) {
    this.store.dispatch(new DeleteCartAction(id));
  }

  clearCart() {
    this.store.dispatch(new ClearCartAction());
  }

  openVariationModal(item: ICart) {
    const modalRef = this.modal.open(VariationModal, {
      centered: true,

      windowClass: "theme-modal-2 variation-modal",
    });

    modalRef.componentInstance.variation = item;
  }
}
