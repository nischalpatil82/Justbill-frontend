import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { IProduct, IVariation } from '../../../../interface/product.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import { CartButton } from '../widgets/cart-button/cart-button';
import { ProductBoxImageVariant } from '../widgets/image-variant/image-variant';
import { ProductBoxVariantAttributes } from '../widgets/product-box-variant-attributes/product-box-variant-attributes';
import { ProductHoverAction } from '../widgets/product-hover-action/product-hover-action';

@Component({
  selector: 'app-product-box-twelve',
  imports: [
    CommonModule,
    RouterModule,
    NgbModule,
    CurrencySymbolPipe,
    ProductHoverAction,
    TranslateModule,
    ProductBoxVariantAttributes,
    ProductBoxImageVariant,
    CartButton,
  ],
  templateUrl: './product-box-twelve.html',
  styleUrl: './product-box-twelve.scss',
})
export class ProductBoxTwelve {
  readonly product = input<IProduct>();

  public selectedVariation: IVariation;

  selectedVariant(variation: IVariation) {
    if (variation) {
      this.selectedVariation = variation;
    }
  }

  getRating(product: IProduct | undefined): number {
  if (!product) return 4; // fallback

  if (product.rating_count && product.rating_count > 0) {
    return product.rating_count;
  }

  const id = product.id ?? 1;
  return 3 + (id % 3);
}


getSafeRating(): number {
  const p = this.product();

  if (!p) return 4;

  if (p.rating_count && p.rating_count > 0) {
    return p.rating_count;
  }

  return 4; // simple fallback
}
}
