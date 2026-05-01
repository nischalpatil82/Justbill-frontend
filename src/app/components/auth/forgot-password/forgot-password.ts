import { Component, inject, output } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";

import { TranslateModule } from "@ngx-translate/core";
import { Store } from "@ngxs/store";

import { Alert } from "../../../shared/components/widgets/alert/alert";
import { Button } from "../../../shared/components/widgets/button/button";
import { Breadcrumb } from "../../../shared/components/widgets/breadcrumb/breadcrumb"; // ✅ IMPORT ADDED
import { ForgotPasswordAction } from "../../../shared/store/action/auth.action";

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    Alert,
    Button,
    Breadcrumb,
  ],
  templateUrl: "./forgot-password.html",
  styleUrl: "./forgot-password.scss",
})
export class ForgotPassword {
  private store = inject(Store);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  readonly activeForm = output<string>();

  public form: FormGroup;
  public validate: boolean = false;

  // ✅ BREADCRUMB
  public breadcrumb = {
    title: "Forgot Password",
    items: [
      {
        label: "Home",
        url: "/",
      },
      {
        label: "Forgot Password",
        active: true,
      },
    ],
  };

  constructor() {
    this.form = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
    });
  }

  submit() {
    this.form.markAllAsTouched();

    if (this.form.valid) {
      this.store.dispatch(new ForgotPasswordAction(this.form.value)).subscribe({
        complete: () => {
          this.activeForm.emit("otp");
        },
      });
    }
  }

  get email() {
    return this.form.get("email");
  }

  // ✅ BACK TO LOGIN FIXED
  backForm() {
    this.router.navigate(["/login"]);
  }
}
