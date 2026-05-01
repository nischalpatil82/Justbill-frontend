import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  input,
  Input,
  output,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CarouselComponent } from 'ngx-owl-carousel-o';
import { Observable } from 'rxjs';

import { Button } from '../../../../../../shared/components/widgets/button/button';
import { SaleTimer } from '../../../../../../shared/components/widgets/sale-timer/sale-timer';
import { VariantAttributes } from '../../../../../../shared/components/widgets/variant-attributes/variant-attributes';
import { ICart, ICartAddOrUpdate } from '../../../../../../shared/interface/cart.interface';
import { IProduct, IVariation } from '../../../../../../shared/interface/product.interface';
import { IValues } from '../../../../../../shared/interface/setting.interface';
import { IOption } from '../../../../../../shared/interface/theme-option.interface';
import { CurrencySymbolPipe } from '../../../../../../shared/pipe/currency.pipe';
import { AddToCartAction } from '../../../../../../shared/store/action/cart.action';
import { AddToCompareAction } from '../../../../../../shared/store/action/compare.action';
import {
  AddToWishlistAction,
  DeleteWishlistAction,
} from '../../../../../../shared/store/action/wishlist.action';
import { CartState } from '../../../../../../shared/store/state/cart.state';
import { SettingState } from '../../../../../../shared/store/state/setting.state';
import { WishlistState } from '../../../../../../shared/store/state/wishlist.state';
import { ProductSocialShare } from '../product-social-share/product-social-share';
import { ProductWholesales } from '../product-wholesales/product-wholesales';

@Component({
  selector: 'app-product-content',
  imports: [
    CommonModule,
    NgbModule,
    CurrencySymbolPipe,
    VariantAttributes,
    TranslateModule,
    SaleTimer,
    ProductWholesales,
    Button,
  ],
  templateUrl: './product-content.html',
  styleUrl: './product-content.scss',
})
export class ProductContent {
  private store = inject(Store);
  private router = inject(Router);
  private modal = inject(NgbModal);

  cartItem$: Observable<ICart[]> = inject(Store).select(CartState.cartItems);
  setting$: Observable<IValues> = inject(Store).select(
    SettingState.setting,
  ) as Observable<IValues>;

wishlistItems$ = this.store.select(WishlistState.wishlistItems);


  @Input() product: IProduct;
  readonly option = input<IOption | null>();
  readonly owlCar = input<CarouselComponent>();
  readonly product_variation = input<boolean>(false);
  readonly variant_hover = input<boolean>(true);

  readonly selectedVariant = output<IVariation>();

  public selectedVariation: IVariation | null;
  public productQty: number = 1;
  public shippingFreeAmt: number = 0;
  public totalPrice: number = 0;
  public cartItem: ICart | null;
  public isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);

    this.setting$.subscribe(
      setting => (this.shippingFreeAmt = setting?.general?.min_order_free_shipping),
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product'] && changes['product'].currentValue) {
      this.selectedVariation = null;
      this.product = changes['product']?.currentValue;
    }

    this.productQty = 1;

    this.cartItem$.subscribe(items => {
      this.cartItem = items.find(item => {
        if (
          item.variation &&
          item.variation != null &&
          item.variation_id &&
          item.variation_id != null
        ) {
          return item.variation_id == this.selectedVariation?.id;
        } else {
          return item.product.id == this.product.id;
        }
      })!;
    });
  }

  ngOnInit() {
    this.wholesalePriceCal();
  }

  /* ================= WISHLIST TOGGLE ================= */

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

  // 🔥 IMPORTANT: wait for API then navigate
  this.store.dispatch(action).subscribe({
    complete: () => {
      this.router.navigate(['/wishlist']);
    }
  });
}



  /* ================= CART ================= */

  addToCart(product: IProduct, buyNow?: boolean) {
    if (!product) return;

    const params: ICartAddOrUpdate = {
      id:
        this.cartItem &&
        this.selectedVariation &&
        this.cartItem?.variation &&
        this.selectedVariation?.id == this.cartItem?.variation?.id
          ? this.cartItem.id
          : null,
      product_id: product?.id,
      product: product,
      variation: this.selectedVariation || null,
      variation_id: this.selectedVariation?.id || null,
      quantity: this.productQty,
    };

    this.store.dispatch(new AddToCartAction(params)).subscribe({
      complete: () => {
        this.modal.dismissAll();
        if (buyNow) {
          void this.router.navigate(['/checkout']);
        }
      },
    });
  }


private getCustomerID(): number {
  const user = sessionStorage.getItem('account_user');
  if (!user) return 0;

  const parsed = JSON.parse(user);
  return parsed?.m_customer?.id || 0;
}



  /* ================= COMPARE ================= */

  addToCompare(product: IProduct) {
    this.store.dispatch(new AddToCompareAction({ product: product }));
  }

  /* ================= VARIATION ================= */

  selectVariation(variation: IVariation) {
    if (variation) {
      this.selectedVariation = variation;
      this.selectedVariant.emit(this.selectedVariation);
      this.wholesalePriceCal();
    }
  }

  updateQuantity(qty: number) {
    if (1 > this.productQty + qty) return;
    this.productQty = this.productQty + qty;
    this.wholesalePriceCal();
  }


  externalProductLink(link: string) {
  if (this.isBrowser && link) {
    window.open(link, '_blank');
  }
}


  /* ================= WHOLESALE PRICE ================= */

  wholesalePriceCal() {
    let wholesale =
      this.product.wholesales.find(
        value => value.min_qty <= this.productQty && value.max_qty >= this.productQty,
      ) || null;

    const product = this.product;

    if (wholesale && product.wholesale_price_type == 'fixed') {
      this.totalPrice = this.productQty * wholesale.value;
    } else if (wholesale && product.wholesale_price_type == 'percentage') {
      this.totalPrice =
        this.productQty *
        (this.selectedVariation ? this.selectedVariation.sale_price : product.sale_price);

      this.totalPrice = this.totalPrice - this.totalPrice * (wholesale.value / 100);
    } else {
      this.totalPrice =
        this.productQty *
        (this.selectedVariation ? this.selectedVariation.sale_price : product.sale_price);
    }
  }

  /* ================= SHARE ================= */

  openModal(product: IProduct) {
    const modal = this.modal.open(ProductSocialShare, {
      centered: true,
      windowClass: 'theme-modal-2',
    });

    modal.componentInstance.product = product;
  }
}
