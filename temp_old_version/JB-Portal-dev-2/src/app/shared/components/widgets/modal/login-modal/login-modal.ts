import { isPlatformBrowser } from "@angular/common";
import {
  Component,
  inject,
  PLATFORM_ID,
  TemplateRef,
  viewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";

import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from "@ngx-translate/core";
import { Store } from "@ngxs/store";
import { Observable, take } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { environment } from "../../../../../../environments/environment";
import { ForgotPassword } from "../../../../../components/auth/forgot-password/forgot-password";
import { Login } from "../../../../../components/auth/login/login";
import { LoginWithNumber } from "../../../../../components/auth/login-with-number/login-with-number";
import { Otp } from "../../../../../components/auth/otp/otp";
import { Register } from "../../../../../components/auth/register/register";
import { UpdatePassword } from "../../../../../components/auth/update-password/update-password";

import { ICart, ICartAddOrUpdate } from "../../../../interface/cart.interface";
import { IValues } from "../../../../interface/setting.interface";
import { IOption } from "../../../../interface/theme-option.interface";
import { AuthService } from "../../../../services/auth.service";
import { LoginAction } from "../../../../store/action/auth.action";
import {
  GetCartItemsAction,
  SyncCartAction,
} from "../../../../store/action/cart.action";
import { CartState } from "../../../../store/state/cart.state";
import { SettingState } from "../../../../store/state/setting.state";
import { ThemeOptionState } from "../../../../store/state/theme-option.state";

@Component({
  selector: "app-login-modal",
  standalone: true,
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    Login,
    ForgotPassword,
    Otp,
    UpdatePassword,
    Register,
    LoginWithNumber,
  ],
  templateUrl: "./login-modal.html",
  styleUrl: "./login-modal.scss",
})
export class LoginModal {
  private modalService = inject(NgbModal);
  private store = inject(Store);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  readonly LoginModal = viewChild<TemplateRef<string>>("loginModal");

  cartItem$: Observable<ICart[]> = this.store.select(CartState.cartItems);
  setting$: Observable<IValues | null> = this.store.select(
    SettingState.setting,
  );
  themeOption$: Observable<IOption> = this.store.select(
    ThemeOptionState.themeOptions,
  );

  public validate = false;
  public loginForm: FormGroup;
  public closeResult!: string;
  public modalOpen = false;
  public activeForm = "login";
  public storageURL = environment.storageURL;
  public isBrowser: boolean;
  public themeOption: IOption | null = null;

  constructor() {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);

    this.themeOption$.pipe(takeUntilDestroyed()).subscribe((res) => {
      this.themeOption = res;
    });

    this.loginForm = this.formBuilder.group({
      email: new FormControl("john.customer@example.com", [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl("123456789", Validators.required),
    });
  }

  ngAfterViewInit(): void {
    if (this.authService.isLogin === true) {
      void this.openModal();
    }
  }

  submit(): void {
    this.validate = true;
    if (!this.loginForm.valid) return;

    this.store.dispatch(new LoginAction(this.loginForm.value)).subscribe({
      complete: () => {
        const syncCartItems: ICartAddOrUpdate[] = [];

        this.cartItem$.pipe(take(1)).subscribe((items) => {
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
        });

        if (syncCartItems.length > 0) {
          this.store.dispatch(new SyncCartAction(syncCartItems));
        } else {
          this.store.dispatch(new GetCartItemsAction());
        }

        const redirectUrl =
          this.authService.redirectUrl || "/account/dashboard";
        void this.router.navigateByUrl(redirectUrl);
        this.authService.redirectUrl = undefined;
      },
    });
  }

  nextForm(action: string): void {
    this.activeForm = action;
  }

  async openModal(type: string = "login"): Promise<void> {
    if (!this.isBrowser) return;

    this.activeForm = type; // ⭐ IMPORTANT LINE

    this.modalOpen = true;

    this.modalService.open(this.LoginModal(), {
      ariaLabelledBy: "Login-Modal",
      centered: true,
      windowClass: "modal-xl modal-dialog-centered auth-modal",
    });
  }

  private getDismissReason(reason: ModalDismissReasons): string {
    this.authService.isLogin = false;

    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    }
    if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    }
    return `with: ${reason}`;
  }
}
