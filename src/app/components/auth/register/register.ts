import { Component, inject } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";

import { TranslateModule } from "@ngx-translate/core";
import { Store } from "@ngxs/store";
import { Select2Module } from "ng-select2-component";
import { Observable } from "rxjs";

import { Alert } from "../../../shared/components/widgets/alert/alert";
import { Button } from "../../../shared/components/widgets/button/button";
import { countryCodes } from "../../../shared/data/country-code";
import { IBreadcrumb } from "../../../shared/interface/breadcrumb.interface";
import { IValues } from "../../../shared/interface/setting.interface";
import { IOption } from "../../../shared/interface/theme-option.interface";
import { RegisterAction } from "../../../shared/store/action/auth.action";
import { SettingState } from "../../../shared/store/state/setting.state";
import { ThemeOptionState } from "../../../shared/store/state/theme-option.state";
import { CustomValidators } from "../../../shared/validator/password-match";
import { Breadcrumb } from "../../../shared/components/widgets/breadcrumb/breadcrumb";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    Select2Module,
    Button,
    Alert,
    Breadcrumb,
  ],
  templateUrl: "./register.html",
  styleUrl: "./register.scss",
})
export class Register {
  private store = inject(Store);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  setting$: Observable<IValues | null> = this.store.select(
    SettingState.setting,
  );
  themeOption$: Observable<IOption> = this.store.select(
    ThemeOptionState.themeOptions,
  );

  public form: FormGroup;
  public codes = countryCodes;
  public tnc = new FormControl(false, [Validators.requiredTrue]);
  public showPassword = false;
  public showConfirmPassword = false;

  public breadcrumb = {
    title: "Register",
    items: [
      {
        label: "Home",
        url: "/",
      },
      {
        label: "Register Account",
        active: true,
      },
    ],
  };

  constructor() {
    this.form = this.formBuilder.group(
      {
        name: new FormControl("", [Validators.required]),
        email: new FormControl("", [Validators.required, Validators.email]),
        phone: new FormControl("", [
          Validators.required,
          Validators.pattern(/^[0-9]*$/),
        ]),
        country_code: new FormControl("91", [Validators.required]),
        password: new FormControl("", [Validators.required]),
        password_confirmation: new FormControl("", [Validators.required]),
      },
      {
        validator: CustomValidators.MatchValidator(
          "password",
          "password_confirmation",
        ),
      },
    );
  }

  get passwordMatchError() {
    return (
      this.form.getError("mismatch") &&
      this.form.get("password_confirmation")?.touched
    );
  }

  togglePasswordVisibility(type: string): void {
    if (type === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  submit() {
    this.form.markAllAsTouched();

    if (this.tnc.invalid) return;

    if (this.form.valid) {
      this.store.dispatch(new RegisterAction(this.form.value)).subscribe({
        complete: () => {
          // ✅ Redirect to login after register
          this.router.navigate(["/login"]);
        },
      });
    }
  }

  goToLogin() {
    this.router.navigate(["/login"]);
  }
}
