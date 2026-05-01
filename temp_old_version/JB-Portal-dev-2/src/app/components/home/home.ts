import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { Store } from "@ngxs/store";
import { combineLatest, Observable } from "rxjs";

import { Vegetables4 } from "./vegetables/vegetables-4/vegetables-4";

/* ===== SERVICES & STORE ===== */
import { ThemeOptionService } from "../../shared/services/theme-option.service";
import { GetHomePageAction } from "../../shared/store/action/theme.action";
import { ThemeState } from "../../shared/store/state/theme.state";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [Vegetables4],
  templateUrl: "./home.html",
  styleUrl: "./home.scss",
})
export class Home {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private themeOptionService = inject(ThemeOptionService);

  activeTheme$: Observable<string> = this.store.select(ThemeState.activeTheme);

  public theme!: string;
  public homePage: any;

  constructor() {
    combineLatest([this.route.queryParams, this.activeTheme$]).subscribe(
      ([params, _activeTheme]) => {
        this.themeOptionService.preloader = true;

        // ✅ Vegetables-4 is DEFAULT homepage
        // Other templates load ONLY if explicitly passed in URL
        this.theme = params["theme"] ? params["theme"] : "vegetables_four";

        this.store
          .dispatch(new GetHomePageAction(this.theme))
          .subscribe((res: any) => {
            this.homePage = res?.theme?.homePage;
            this.themeOptionService.preloader = false;
          });
      },
    );
  }
}
