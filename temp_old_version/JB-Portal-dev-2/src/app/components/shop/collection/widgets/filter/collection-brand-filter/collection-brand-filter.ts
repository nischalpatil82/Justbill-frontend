import { Component, inject, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { TranslateModule } from "@ngx-translate/core";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";

import { NoData } from "../../../../../../shared/components/widgets/no-data/no-data";
import {
  IBrand,
  IBrandModel,
} from "../../../../../../shared/interface/brand.interface";
import { Params } from "../../../../../../shared/interface/core.interface";
import { SearchFilterPipe } from "../../../../../../shared/pipe/search-filter.pipe";
import { GetBrandsAction } from "../../../../../../shared/store/action/brand.action";
import { BrandState } from "../../../../../../shared/store/state/brand.state";

@Component({
  selector: "app-collection-brand-filter",
  standalone: true,
  imports: [TranslateModule, FormsModule, SearchFilterPipe, NoData],
  templateUrl: "./collection-brand-filter.html",
  styleUrl: "./collection-brand-filter.scss",
})
export class CollectionBrandFilter {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);

  brand$: Observable<IBrandModel> = this.store.select(BrandState.brand);

  @Input() filter!: Params;

  public brands: IBrand[] = [];
  public selectedBrands: string[] = [];
  public searchText: string = "";

  ngOnInit() {
    // ✅ Load brands (NO payload)
    this.store.dispatch(new GetBrandsAction());

    this.brand$.subscribe((res) => {
      this.brands = res?.data || [];
    });
  }

  ngOnChanges() {
    // ✅ Read correct query param
    this.selectedBrands = this.filter?.["brandSlug"]
      ? this.filter["brandSlug"].split(",")
      : [];
  }

  applyFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const index = this.selectedBrands.indexOf(value);

    if (input.checked && index === -1) {
      this.selectedBrands.push(value);
    }

    if (!input.checked && index !== -1) {
      this.selectedBrands.splice(index, 1);
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        // ✅ MATCH BACKEND
        brandSlug: this.selectedBrands.length
          ? this.selectedBrands.join(",")
          : null,
        page: 1,
      },
      queryParamsHandling: "merge",
      skipLocationChange: false,
    });
  }

  // ✅ Checkbox checked state
  checked(slug: string): boolean {
    return this.selectedBrands.includes(slug);
  }
}
