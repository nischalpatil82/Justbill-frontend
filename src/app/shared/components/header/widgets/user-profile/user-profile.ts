import { Component, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";

import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from "@ngx-translate/core";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";

import { IAccountUser } from "../../../../interface/account.interface";
import { AuthService } from "../../../../services/auth.service";
import { AccountState } from "../../../../store/state/account.state";
import { AuthState } from "../../../../store/state/auth.state";
import { ConfirmationModal } from "../../../widgets/modal/confirmation-modal/confirmation-modal";

@Component({
  selector: "app-user-profile",
  standalone: true,
  imports: [RouterModule, TranslateModule],
  templateUrl: "./user-profile.html",
  styleUrl: "./user-profile.scss",
})
export class UserProfile {
  private authService = inject(AuthService);
  private modal = inject(NgbModal);
  private router = inject(Router);
  private store = inject(Store);

  public isLogin: boolean = false;

  user$: Observable<IAccountUser | null> = this.store.select(AccountState.user);
  isAuthenticated$: Observable<boolean> = this.store.select(
    AuthState.isAuthenticated,
  );

  ngOnInit() {
    this.isAuthenticated$.subscribe((res) => {
      this.isLogin = Boolean(res);
    });
  }

  // ✅ Navigate to account or login
  account() {
    if (this.isLogin) {
      this.router.navigate(["/account/dashboard"]);
    } else {
      this.router.navigate(["/login"]);
    }
  }

  // ✅ Login navigation
  goToLogin() {
    this.router.navigate(["/login"]);
  }

  // ✅ Register navigation
  goToRegister() {
    this.router.navigate(["/register"]);
  }

  // ✅ Logout with confirmation
  logout() {
    const token = this.store.selectSnapshot(
      (state) => state.auth?.access_token,
    );

    if (!token) {
      this.router.navigate(["/login"]);
    } else {
      this.modal.open(ConfirmationModal, { centered: true });
    }
  }
}
