import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { AuthState } from 'src/app/shared/store/state/auth.state';

import { AuthService } from '../../shared/services/auth.service';
import { GetUserDetailsAction } from '../../shared/store/action/account.action';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private store = inject(Store);
  private router = inject(Router);
  private modal = inject(NgbModal);
  private authService = inject(AuthService);

  access_token$: Observable<String> = inject(Store).select(
    AuthState.accessToken,
  ) as Observable<String>;
  public is_redirect: boolean;

canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

  const token = this.store.selectSnapshot(state => state.auth?.access_token);

  // ✅ If logged in → allow
  if (token) {
    return true;
  }

  // ❌ If not logged in → redirect to login
  this.authService.redirectUrl = state.url;

  this.router.navigate(['/login']);
  return false;
}

  canActivateChild(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    if (!!this.store.selectSnapshot(state => state.auth && state.auth.access_token)) {
      if (
        this.router.url.startsWith('/account') ||
        this.router.url == '/checkout' ||
        this.router.url == '/compare'
      )
        void this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
