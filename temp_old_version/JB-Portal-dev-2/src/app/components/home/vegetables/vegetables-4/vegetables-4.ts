import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, SimpleChanges, inject, input, OnDestroy, OnInit, OnChanges } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Categories } from '../../../../shared/components/widgets/categories/categories';
import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import * as data from '../../../../shared/data/owl-carousel';
import { IBanners, IVegetablesFour } from '../../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../../shared/services/theme-option.service';
import { GetBlogsAction } from '../../../../shared/store/action/blog.action';
import { GetBrandsAction } from '../../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../../shared/store/action/product.action';
import { ThemeBlog } from '../../widgets/theme-blog/theme-blog';
import { ThemeBrand } from '../../widgets/theme-brand/theme-brand';
import { ThemeProduct } from '../../widgets/theme-product/theme-product';
import { ThemeServices } from '../../widgets/theme-services/theme-services';
import { ThemeTitle } from '../../widgets/theme-title/theme-title';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vegetables-4',
  imports: [
    CommonModule,
    ImageLink,   
    Categories,
    ThemeTitle,
    ThemeProduct,
    ThemeServices,
    ThemeBlog,
    ThemeBrand,
  ],
  templateUrl: './vegetables-4.html',
  styleUrl: './vegetables-4.scss',
})
export class Vegetables4 implements OnInit, OnChanges, OnDestroy {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);
  private router = inject(Router);

  readonly data = input<IVegetablesFour>();    
  readonly slug = input<string>();
  private platformId: boolean;
  public filteredBanners: IBanners[];
  public filteredBanners2: IBanners[];
  public productSlider6 = data.productSlider6;

  text: string = 'EXPLORE COLLECTION';
splitText: string[] = [];

  // 1. Add a Subject to manage lifecycle destruction
  private readonly destroy$ = new Subject<void>();

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);
    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnInit() {

    this.splitText = this.text.split('');

    
    const dataValue = this.data();
    if (dataValue?.slug == this.slug()) {
      // Get Products
      let getProduct$;
      if (dataValue?.content?.products_ids?.length) {
        getProduct$ = this.store.dispatch(
          new GetProductByIdsAction({
            status: 1,
            approve: 1,
            ids: dataValue?.content?.products_ids?.join(','),
            paginate: dataValue?.content?.products_ids?.length,
          }),
        );
      } else {
        getProduct$ = of(null);
      }

      // Get Category
 let getCategory$ = this.store.dispatch(new GetCategoriesAction());


      // Get Blog
      let getBlogs$;
      if (
        dataValue?.content?.featured_blogs.blog_ids.length &&
        dataValue?.content?.featured_blogs?.status
      ) {
        getBlogs$ = this.store.dispatch(
          new GetBlogsAction({
            status: 1,
            ids: dataValue?.content.featured_blogs.blog_ids?.join(','),
          }),
        );
      } else {
        getBlogs$ = of(null);
      }

      // Get Brand
      let getBrands$;
      if (dataValue?.content?.brand?.brand_ids.length && dataValue?.content?.brand?.status) {
        getBrands$ = this.store.dispatch(
          new GetBrandsAction({
            status: 1,
            ids: dataValue?.content?.brand?.brand_ids?.join(','),
          }),
        );
      } else {
        getBrands$ = of(null);
      }

      // Skeleton Loader
      if (this.platformId) {
        document.body.classList.add('skeleton-body');
        document.body.classList.add('mulish-font');

        // 2. Use pipe(takeUntil) to cancel subscription on destroy
        forkJoin([getProduct$, getBlogs$, getBrands$, getCategory$])
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            complete: () => {
              document.body.classList.remove('skeleton-body');
              this.themeOptionService.preloader = false;
            },
          });
      }
    }
  }

  
  
  goToShop() {
  this.router.navigate(['/collections']);
}

  ngOnChanges(change: SimpleChanges) {
    if (change['data'] && change['data'].currentValue) {
      this.filteredBanners = change['data']?.currentValue?.content?.offer_banner_1?.banners?.filter(
        (banner: IBanners) => {
          return banner.status;
        },
      );

      this.filteredBanners2 = change[
        'data'
      ]?.currentValue?.content?.offer_banner_2?.banners?.filter((banner: IBanners) => {
        return banner.status;
      });
    }
  }

  ngOnDestroy() {
    // 3. Trigger the destroy subject to kill pending async tasks
    this.destroy$.next();
    this.destroy$.complete();

    if (this.platformId) {
      document.body.classList.remove('mulish-font');
    }
  }
}