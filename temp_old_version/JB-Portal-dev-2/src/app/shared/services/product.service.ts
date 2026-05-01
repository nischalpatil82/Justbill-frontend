import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { Params } from '../interface/core.interface';
import { IProduct, IProductModel } from '../interface/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  public skeletonLoader = false;
  public skeletonCategoryProductLoader = false;
  public productFilter = false;
  public searchSkeleton = false;

  // ===============================
  // API URLs
  // ===============================
  private readonly PRODUCT_LIST_API =
    'https://dev-api-justbill.itbycloud.com/api/Product/get_ProductList';

  private readonly PRODUCT_DETAILS_API =
    'https://dev-api-justbill.itbycloud.com/api/Product/get_ProductDetail';

  // ===============================
  // GET PRODUCT LIST
  // ===============================
  getProducts(payload?: Params): Observable<IProductModel> {
    const body = {
      messageInfo: {
        returnValue: 0,
        returnMessage: '',
      },
      userDBConnStr: '',
    };

    return this.http.post<any>(this.PRODUCT_LIST_API, body).pipe(
      map(res => {
        const products: IProduct[] = (res?.ml_product || []).map((item: any) => ({
          // -----------------------
          // CORE
          // -----------------------
          id: item.productID,
          name: item.productName,
          slug: item.sku,
          product_type: item.productType,
          type: item.productType,
          short_description: item.shortDescription,
          description: item.descriptionHTML,

          // -----------------------
          // INVENTORY
          // -----------------------
          unit: item.unit,
          weight: item.weight,
          quantity: item.quantity,
          stock_status: item.stockStatus,
          stock: item.stockStatus,

          // -----------------------
          // PRICE
          // -----------------------
          price: Number(item.costPrice),
          sale_price: Number(item.sellingPrice),
          discount: item.discount,

          // -----------------------
          // BRAND
          // -----------------------
          brand_id: null,
          brand: null,

          // -----------------------
          // CATEGORY
          // -----------------------
          categories: [],
          categories_ids: item.categoryIDs
            ? item.categoryIDs.split(',').map((id: string) => Number(id))
            : [],

          // -----------------------
          // IMAGES
          // -----------------------
          product_thumbnail: item.primaryImageUrl
            ? {
                original_url: item.primaryImageUrl,
                mime_type: 'image/png',
              }
            : null,

          product_thumbnail_id: 0,

          product_galleries: item.primaryImageUrl
            ? [
                {
                  original_url: item.primaryImageUrl,
                  mime_type: 'image/png',
                },
              ]
            : [],

          product_galleries_id: [],

          // -----------------------
          // SHIPPING & RETURN
          // -----------------------
          shipping_days: item.shippingDays,
          estimated_delivery_text: item.estimatedDeliveryDescription,
          return_policy_text: item.returnPolicyDescription,

          // -----------------------
          // FLAGS
          // -----------------------
          is_cod: item.isCOD,
          is_free_shipping: item.isFreeShipping,
          is_sale_enable: item.isSaleEnable,
          is_return: item.isReturnable,
          is_featured: item.isFeatured,
          is_external: item.isExternal,
          external_url: item.externalURL,

          // -----------------------
          // SEO
          // -----------------------
          meta_title: item.metaTitle,
          meta_description: item.metaDescription,

          // -----------------------
          // STATUS & DATES
          // -----------------------
          status: item.isActive,
          is_approved: item.isApproved,
          created_at: item.createdDateTime,
          updated_at: item.updatedDateTime,
          deleted_at: null,

          // -----------------------
          // REQUIRED DEFAULTS
          // -----------------------
          highlightedName: '',
          selected_variant: undefined,
          preview_type: null,
          preview_audio_file: null,
          preview_audio_file_id: null,
          preview_video_file: null,
          preview_video_file_id: null,
          store_id: undefined,
          size_chart_image_id: 0,
          size_chart_image: null,
          safe_checkout: true,
          secure_checkout: true,
          social_share: true,
          encourage_order: false,
          encourage_view: false,
          tax_id: 0,
          tax: null,
          tags: [],
          tag: null,
          category: null,
          store: undefined,
          store_name: '',
          orders_count: 0,
          order_amount: 0,
          attribute_values: [],
          variations: [],
          wholesale_price_type: null,
          wholesales: [],
          variants: [],
          attributes: [],
          attributes_ids: [],
          is_random_related_products: false,
          related_products: [],
          cross_sell_products: [],
          pivot: undefined,
          created_by_id: 0,
          total_in_approved_products: 0,
          published_at: '',
          reviews: [],
          reviews_count: 0,
          wishlist_name: '',
          rating_count: 0,
          review_ratings: [],
          user_review: null,
          can_review: false,
        }));

        return {
          data: products,
          total: products.length,
        };
      }),
    );
  }

  // ===============================
  // GET PRODUCT DETAILS (BACKEND BASED)
  // ===============================
// ======================================
// GET PRODUCT DETAILS (Mapped Properly)
// ======================================
// ======================================
// GET PRODUCT DETAILS (RAW BACKEND)
// ======================================
getProductDetails(id: number): Observable<any> {
  const body = {
    messageInfo: {
      returnValue: 0,
      returnMessage: '',
    },
    userDBConnStr: '',
    id: id,
  };

  return this.http.post<any>(this.PRODUCT_DETAILS_API, body);
}


private readonly ATTRIBUTE_API =
'https://dev-api-justbill.itbycloud.com/api/Product/get_AttributeList';

getAttributes(): Observable<any> {
  const body = {
    messageInfo: {
      returnValue: 0,
      returnMessage: ''
    },
    userDBConnStr: ''
  };

  return this.http.post<any>(this.ATTRIBUTE_API, body);
}



  // ===============================
  // GET PRODUCT BY SLUG (LEGACY - FRONTEND FILTER)
  // ===============================
  getProductBySlug(slug: string): Observable<IProduct> {
    return this.getProducts().pipe(
      map(result => result.data.find(product => product.slug === slug)!),
    );
  }

  // ===============================
  // SEARCH PRODUCT LIST
  // ===============================
  getProductBySearchList(payload?: Params): Observable<IProductModel> {
    return this.getProducts(payload);
  }
}
