

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { IBrand, IBrandModel } from '../interface/brand.interface';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private http = inject(HttpClient);

  public skeletonLoader = false;

  // ✅ Backend REQUIRED exact payload
  getBrands(): Observable<IBrandModel> {
    const body = {
      MessageInfo: {
        ReturnValue: 0,
        ReturnMessage: '', // ❗ MUST be empty string
      },
    };

    return this.http
      .post<any>(
        'https://dev-api-justbill.itbycloud.com/api/Product/get_BrandList',
        body,
      )
      .pipe(
        map(res => ({
          data: res?.ml_brands ?? [],
          total: res?.ml_brands?.length ?? 0,
        })),
      );
  }

  getBrandBySlug(slug: string): Observable<IBrand | undefined> {
    return this.getBrands().pipe(
      map(res => res.data.find(b => b.slug === slug)),
    );
  }
}
