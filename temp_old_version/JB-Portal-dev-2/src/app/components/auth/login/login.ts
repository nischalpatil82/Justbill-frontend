import { Component, inject, output } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";

import { TranslateModule } from "@ngx-translate/core";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { Button } from "../../../shared/components/widgets/button/button";
import { IBreadcrumb } from "../../../shared/interface/breadcrumb.interface";
import {
  ICart,
  ICartAddOrUpdate,
} from "../../../shared/interface/cart.interface";
import { IValues } from "../../../shared/interface/setting.interface";
import { IOption } from "../../../shared/interface/theme-option.interface";
import { AuthService } from "../../../shared/services/auth.service";
import { LoginAction } from "../../../shared/store/action/auth.action";
import {
  GetCartItemsAction,
  SyncCartAction,
} from "../../../shared/store/action/cart.action";
import { CartState } from "../../../shared/store/state/cart.state";
import { SettingState } from "../../../shared/store/state/setting.state";
import { ThemeOptionState } from "../../../shared/store/state/theme-option.state";
import { Breadcrumb } from "../../../shared/components/widgets/breadcrumb/breadcrumb";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    Button,
    Breadcrumb,
  ],
  templateUrl: "./login.html",
  styleUrl: "./login.scss",
})
export class Login {
  private store = inject(Store);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  public loginError: string | null = null;

  cartItem$: Observable<ICart[]> = this.store.select(CartState.cartItems);
  setting$: Observable<IValues | null> = this.store.select(
    SettingState.setting,
  );
  themeOption$: Observable<IOption> = this.store.select(
    ThemeOptionState.themeOptions,
  );

  readonly activeForm = output<string>();

  public validate: boolean = false;
  public loginForm!: FormGroup;
  public showPassword = false;

  public breadcrumb: IBreadcrumb = {
    title: "Login",
    items: [
      { label: "Home", url: "/" },
      { label: "Login", active: true },
    ],
  };

  constructor() {
    this.loginForm = this.formBuilder.group({
      username: new FormControl("", [Validators.required]),
      password: new FormControl("", Validators.required),
      rememberMe: new FormControl(false),
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // ✅ LOGIN SUBMIT
  submit(): void {
    this.validate = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const payload = {
      email: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };

    this.store.dispatch(new LoginAction(payload)).subscribe({
      next: (res: any) => {
        // 🔥 STORE USER FROM API RESPONSE
        if (res?.isValidUser && res?.m_customer) {
          const user = res.m_customer;

          localStorage.setItem(
            "user",
            JSON.stringify({
              id: user.id,
              name: user.firstName, // ✅ IMPORTANT
              email: user.email,
              token: res.m_login_token,
            }),
          );
        }

        // CART SYNC
        const syncCartItems: ICartAddOrUpdate[] = [];

        this.cartItem$
          .subscribe((items) => {
            items.forEach((item) => {
              if (item) {
                syncCartItems.push({
                  id: null,
                  product: item.product,
                  product_id: item.product_id,
                  variation: item.variation ?? null,
                  variation_id: item.variation_id ?? null,
                  quantity: item.quantity,
                });
              }
            });
          })
          .unsubscribe();

        if (syncCartItems.length > 0) {
          this.store.dispatch(new SyncCartAction(syncCartItems));
        } else {
          this.store.dispatch(new GetCartItemsAction());
        }

        const redirectUrl = this.authService.redirectUrl || "/";
        this.authService.redirectUrl = undefined;

        this.router.navigate([redirectUrl]);
      },

      error: () => {
        this.loginError = "Invalid username or password";
        this.loginForm.controls["password"].setErrors({ invalid: true });
      },
    });
  }

  goToForgotPassword() {
    this.router.navigate(["/forgot-password"]);
  }

  goToRegister() {
    this.router.navigate(["/register"]);
  }

  loginWithNumber(): void {
    this.activeForm.emit("withNumber");
  }

  action(action: string): void {
    this.activeForm.emit(action);
  }
}
