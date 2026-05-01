import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, PLATFORM_ID, inject, input } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable, firstValueFrom } from 'rxjs';

import { IOption } from '../../../interface/theme-option.interface';
import { MenuService } from '../../../services/menu.service';
import { Menu } from '../../widgets/menu/menu';
import { TopBar } from '../../widgets/top-bar/top-bar';
import { Cart } from '../widgets/cart/cart';
import { HeaderLogo } from '../widgets/header-logo/header-logo';
import { Search } from '../widgets/search/search';

import { AuthState } from '../../../store/state/auth.state';
import { LogoutAction } from '../../../store/action/auth.action';

import { Input } from '@angular/core';

@Component({
  selector: 'app-header-two',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    TopBar,
    Menu,
    HeaderLogo,
    Cart,
    Search
  ],
  templateUrl: './header-two.html',
  styleUrl: './header-two.scss',
})
export class HeaderTwo {
  menuService = inject(MenuService);
  private store = inject(Store);
  private router = inject(Router);

  // ✅ Auth state
  isLoggedIn$: Observable<boolean> = this.store.select(AuthState.isAuthenticated);

  readonly data = input<IOption | null>();
  readonly logo = input<string | null>();
  readonly class = input<string>();
  readonly sticky = input<boolean | number>();

  public stick: boolean = false;
  public isBrowser: boolean;

  @Input() routes: string;

  constructor() {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.isBrowser) {
      let number =
        window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      this.stick = number >= 50 && window.innerWidth > 400;
    }
  }

  mainMenuOpen() {
    this.menuService.mainMenuToggle = true;
  }

  // ✅ Navigate to account or login
  async goToAccount() {
    const isLoggedIn = await firstValueFrom(this.isLoggedIn$);

    if (isLoggedIn) {
      this.router.navigate(['/account/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  // ✅ Register navigation
  goToRegister() {
    this.router.navigate(['/register']);
  }

  // ✅ Logout
  logout() {
    this.store.dispatch(new LogoutAction());
    this.router.navigate(['/login']);
  }
}