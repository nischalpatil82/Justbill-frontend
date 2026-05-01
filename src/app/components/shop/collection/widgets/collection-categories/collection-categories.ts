import { Component, inject, input, OnInit, Input } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { Store } from "@ngxs/store";
import { OwlOptions } from "ngx-owl-carousel-o";

import { Categories } from "../../../../../shared/components/widgets/categories/categories";
import { GetCategoriesAction } from "../../../../../shared/store/action/category.action";

@Component({
  selector: "app-collection-categories",
  standalone: true,
  imports: [Categories],
  templateUrl: "./collection-categories.html",
  styleUrl: "./collection-categories.scss",
})
export class CollectionCategories implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ✅ INPUTS
  readonly style = input<string>("vertical");
  readonly image = input<string>();
  readonly theme = input<string>();
  readonly title = input<string>();
  readonly sliderOption = input<OwlOptions>();

  @Input() filter: any; // ✅ FIX FOR ERROR

  // ✅ ACTIVE CATEGORY
  selectedCategorySlug: string = "";

  constructor() {
    // 🔥 Load categories
    this.store.dispatch(
      new GetCategoriesAction({
        status: 1,
      }),
    );
  }

  ngOnInit() {
    // ✅ Sync with URL
    this.route.queryParams.subscribe((params) => {
      this.selectedCategorySlug = params["category"] || "";
    });
  }

  // ✅ HANDLE CLICK FROM CHILD
  redirectToCollection(slug: string) {
    this.selectedCategorySlug = slug;

    this.router.navigate(["/collections"], {
      queryParams: {
        ...this.filter,
        category: slug,
        page: 1,
      },
      queryParamsHandling: "merge",
    });
  }
}
