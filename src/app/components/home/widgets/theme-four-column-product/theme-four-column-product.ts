import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

import { NoData } from '../../../../shared/components/widgets/no-data/no-data';
import { ISliderProduct } from '../../../../shared/interface/theme.interface';
import { ThemeProduct } from '../theme-product/theme-product';

@Component({
  selector: 'app-theme-four-column-product',
  imports: [CommonModule, ThemeProduct, NoData],
  templateUrl: './theme-four-column-product.html',
  styleUrl: './theme-four-column-product.scss',
})
export class ThemeFourColumnProduct {
  readonly data = input<ISliderProduct>();
  readonly style = input<string>();
}
