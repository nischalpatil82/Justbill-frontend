import { isPlatformBrowser } from "@angular/common";
import { Component, inject, PLATFORM_ID } from "@angular/core";

import { Store } from "@ngxs/store";
import { Observable } from "rxjs";

import {
  ICurrency,
  ICurrencyModel,
} from "../../../../interface/currency.interface";
import { IValues } from "../../../../interface/setting.interface";
import { SelectedCurrencyAction } from "../../../../store/action/setting.action";
import { CurrencyState } from "../../../../store/state/currency.state";
import { SettingState } from "../../../../store/state/setting.state";

@Component({
  selector: "app-currency",
  imports: [],
  templateUrl: "./currency.html",
  styleUrl: "./currency.scss",
})
export class Currency {
  private store = inject(Store);

  // ✅ keep only required observables
  setting$: Observable<IValues | null> = this.store.select(
    SettingState.setting,
  );
  selectedCurrency$: Observable<ICurrency | null> = this.store.select(
    SettingState.selectedCurrency,
  );
  currency$: Observable<ICurrencyModel | null> = this.store.select(
    CurrencyState.currency,
  );

  public open: boolean = false;
  public selectedCurrency!: ICurrency;
  public isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);

    this.selectedCurrency$.subscribe((setting) => {
      if (setting) {
        this.selectedCurrency = setting;
      }
    });
  }

  openDropDown() {
    this.open = !this.open;
  }

  selectCurrency(currency: ICurrency) {
    this.selectedCurrency = currency;
    this.open = false;

    this.store.dispatch(new SelectedCurrencyAction(currency)).subscribe({
      complete: () => {
        if (this.isBrowser) {
          window.location.reload();
        }
      },
    });
  }

  hideDropdown() {
    this.open = false;
  }
}
