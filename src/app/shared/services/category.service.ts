import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ICategory, ICategoryModel } from '../interface/category.interface';
import { Params } from '../interface/core.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {

  private http = inject(HttpClient);
  public searchSkeleton: boolean = false;

  /* =========================================
     🔥 GET CATEGORY LIST (POST API)
  ========================================= */

  getCategories(payload?: Params): Observable<ICategoryModel> {

    const body = {
      messageInfo: {
        returnValue: 0,
        returnMessage: ""
      },
      userDBConnStr: ""
    };

    return this.http.post<any>(
      'https://dev-api-justbill.itbycloud.com/api/Product/get_ProductCategoryList',
      body
    ).pipe(
      map(response => ({
        data: response?.ml_category || [],
        total: response?.ml_category?.length || 0
      }))
    );
  }

  /* =========================================
     🔥 GET CATEGORY DETAILS (POST API)
  ========================================= */

  getCategoryBySlug(id: number): Observable<ICategory> {

    const body = {
      messageInfo: {
        returnValue: 0,
        returnMessage: ""
      },
      userDBConnStr: "",
      id: id
    };

    return this.http.post<any>(
      'https://dev-api-justbill.itbycloud.com/api/Product/get_ProductCategoryDetail',
      body
    ).pipe(
      map(response => response?.m_category)
    );
  }

}
