import { CommonModule } from '@angular/common';
import { Component, inject, Input, input, OnChanges, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router'; // ✅ FIX

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { categorySlider } from '../../../data/owl-carousel';
import { ICategory, ICategoryModel } from '../../../interface/category.interface';
import { AttributeService } from '../../../services/attribute.service';
import { CategoryState } from '../../../store/state/category.state';
import { Button } from '../button/button';
import { NoData } from '../no-data/no-data';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    TranslateModule,
    RouterModule,   // ✅🔥 IMPORTANT FIX
    Button,
    NoData
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnChanges {

  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private attributeService = inject(AttributeService);

  category$: Observable<ICategoryModel> =
    this.store.select(CategoryState.category);

  readonly categoryIds = input<number[]>([]);
  readonly style = input<string>('vertical');
  readonly image = input<string>();
  readonly slider = input<boolean>();

  @Input() options: OwlOptions = categorySlider;

  // ✅ ACTIVE CATEGORY FROM PARENT
  @Input() selectedCategory: string = '';

  // ✅ CLICK EVENT
  @Output() categoryClick = new EventEmitter<string>();

  public categories: ICategory[] = [];
  public StorageURL = environment.storageURL;

  constructor() {
    // ✅ Load categories
    this.category$.subscribe(res => {
      if (!res?.data) return;

      const allCategories = res.data;
      const ids = this.categoryIds();

      if (ids && ids.length) {
        this.categories = allCategories.filter(category =>
          ids.includes(category.id)
        );
      } else {
        this.categories = allCategories.filter(category => category.id <= 7);
      }
    });
  }

  ngOnChanges() {
    if (this.style() === 'vegetable') {
      this.options = {
        ...this.options,
        responsive: {
          ...this.options.responsive,
          768: { items: 4 },
          900: { items: 5 },
          1300: { items: 7 },
        },
      };
    }
  }

  // ✅ EMIT ONLY (NO ROUTING HERE)
  onCategoryClick(slug: string) {
    this.categoryClick.emit(slug);
  }

  closeCanvasMenu() {
    this.attributeService.offCanvasMenu = false;
  }

  getCategoryImage(category: any): string {
    return `assets/images/categories/${category.slug}.png`;
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/categories/default.png';
  }
}