import { Component, inject, Input } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";

import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from "@ngx-translate/core";
import { Store } from "@ngxs/store";
import {
  Select2Data,
  Select2Module,
  Select2UpdateEvent,
} from "ng-select2-component";
import { map, Observable } from "rxjs";

import { countryCodes } from "../../../../data/country-code";
import { IUserAddress } from "../../../../interface/user.interface";
import {
  CreateAddressAction,
  UpdateAddressAction,
} from "../../../../store/action/account.action";
import { CountryState } from "../../../../store/state/country.state";
import { StateState } from "../../../../store/state/state.state";
import { Button } from "../../button/button";

@Component({
  selector: "app-address-modal",
  imports: [TranslateModule, FormsModule, ReactiveFormsModule, Select2Module],
  templateUrl: "./address-modal.html",
  styleUrl: "./address-modal.scss",
})
export class AddressModal {
  public modal = inject(NgbActiveModal);
  private store = inject(Store);
  private formBuilder = inject(FormBuilder);

  @Input() userAddress: any;

  public form: FormGroup;
  public address: any | null;

  constructor() {
    this.form = this.formBuilder.group({
      title: ["Home"],
      street: [""],
      city: [""],
      pincode: [""],
      state: [""],
      country: [""],
      is_default: [false],
    });
  }

  ngOnInit() {
    if (this.userAddress) {
      this.patchForm(this.userAddress);
    }
  }

  patchForm(value: any) {
    this.address = value;

    this.form.patchValue({
      title: value?.title,
      street: value?.street,
      city: value?.city,
      pincode: value?.pincode,
      state: value?.state?.name,
      country: value?.country?.name,
      is_default: value?.is_default,
    });
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const stored = sessionStorage.getItem("account_user");
    if (!stored) return;

    const parsed = JSON.parse(stored);
    const customerID = parsed?.m_customer?.id;

    const payload = {
      user_id: customerID,
      title: this.form.value.title,
      street: this.form.value.street,
      type: "",
      city: this.form.value.city,
      pincode: this.form.value.pincode,
      state: { name: this.form.value.state },
      country: { name: this.form.value.country },
      is_default: false,
    };

    console.log("🔥 CREATE DISPATCH", payload);

    this.store.dispatch(new CreateAddressAction(payload)).subscribe({
      next: () => {},
      error: (err) => console.error("CREATE ERROR", err),
      complete: () => {
        console.log("✅ CREATE SUCCESS");
        this.modal.close();
      },
    });
  }
}
