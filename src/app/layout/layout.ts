import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, inject, PLATFORM_ID, viewChild, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';

import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { Store } from '@ngxs/store';
import { forkJoin, Observable } from 'rxjs';

import { Footer } from '../shared/components/footer/footer';
import { Header } from '../shared/components/header/header';

import { Loader } from '../shared/components/widgets/loader/loader';
import { ExitModal } from '../shared/components/widgets/modal/exit-modal/exit-modal';
import { LoginModal } from '../shared/components/widgets/modal/login-modal/login-modal';

import { RecentPurchasePopup } from '../shared/components/widgets/recent-purchase-popup/recent-purchase-popup';
import { StickyCompare } from '../shared/components/widgets/sticky-compare/sticky-compare';
import { VoiceAssistant } from '../components/widgets/voice-assistant/voice-assistant';

import { IOption } from '../shared/interface/theme-option.interface';
import { AuthService } from '../shared/services/auth.service';
import { ThemeOptionService } from '../shared/services/theme-option.service';
import { GetMenuAction } from '../shared/store/action/menu.action';
import { GetProductBySearchListAction } from '../shared/store/action/product.action';
import { ThemeOptionsAction } from '../shared/store/action/theme-option.action';
import { ThemeOptionState } from '../shared/store/state/theme-option.state';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    Loader,
    Footer,
    RouterModule,
    LoadingBarRouterModule,
    Header,
    RecentPurchasePopup,
    ExitModal,
    VoiceAssistant,

  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  themeOptionService = inject(ThemeOptionService);
  authService = inject(AuthService);
  private platformId = inject<Object>(PLATFORM_ID);

  themeOption$: Observable<IOption> = inject(Store).select(ThemeOptionState.themeOptions) as Observable<IOption>;
  cookies$: Observable<boolean> = inject(Store).select(ThemeOptionState.cookies);
  exit$: Observable<boolean> = inject(Store).select(ThemeOptionState.exit);

  // readonly NewsletterModal = viewChild<NewsletterModal>('newsletterModal');
  readonly ExitModal = viewChild<ExitModal>('exitModal');

  public cookies: boolean;
  public exit: boolean;
  // ✅ 1. Initialize with default theme
  public theme: string = 'vegetables_four';
  public show: boolean;
  public isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.store.dispatch(new ThemeOptionsAction());
    this.cookies$.subscribe(res => (this.cookies = res));
    this.exit$.subscribe(res => (this.exit = res));

    // ✅ 2. Run immediately to set colors (Fixes "still same" issue on reload)
    this.updateThemeColors();

    this.route.queryParams.subscribe(params => {
      // If param is present use it, otherwise keep 'vegetables_four'
      if (params['theme']) {
        this.theme = params['theme'];
      }
      this.updateThemeColors();
    });

    this.router.events.subscribe((event) => {
      if (this.isBrowser && event instanceof NavigationEnd) {
        this.updateThemeColors();
      }
    });

    this.themeOptionService.preloader = true;
    const getProductBySearch$ = this.store.dispatch(new GetProductBySearchListAction());
    const getMenu$ = this.store.dispatch(new GetMenuAction());

    forkJoin([getMenu$, getProductBySearch$]).subscribe({
      complete: () => {
        this.themeOptionService.preloader = false;
      },
    });
  }

  // ✅ 3. Isolated logic to enforce Vegetable 4 colors with SSR Check
  updateThemeColors() {
    // Only access document if we are in the browser
    if (this.isBrowser) {
      document.body.classList.add('home');
    }

    const s = this.themeOptionService;

    // Default to Vegetable 4 Colors
    let primary = '#206664';
    let secondary = '#ee7a63';

    // Override only if a different theme is explicitly requested
    if (this.theme == 'fashion_one' || this.theme == 'vegetables_one' || this.theme == 'tools' || this.theme == 'game' || this.theme == 'left_sidebar' || this.theme == 'video' || this.theme == 'full_page') {
      primary = '#ec8951'; secondary = '';
    } else if (this.theme == 'bicycle' || this.theme == 'christmas') {
      primary = '#ff4c3b'; secondary = '';
    } else if (this.theme == 'fashion_two') {
      primary = '#fe816d'; secondary = '';
    } else if (this.theme == 'fashion_three') {
      primary = '#96796d'; secondary = '';
    } else if (this.theme == 'fashion_four') {
      primary = '#000000'; secondary = '';
    } else if (this.theme == 'fashion_five') {
      primary = '#C0AA73'; secondary = '';
    } else if (this.theme == 'fashion_six') {
      primary = '#90453e'; secondary = '';
    } else if (this.theme == 'fashion_seven') {
      primary = '#3fd09e'; secondary = '';
    } else if (this.theme == 'furniture_one' || this.theme == 'furniture_two' || this.theme == 'furniture_dark' || this.theme == 'jewellery_two' || this.theme == 'jewellery_three') {
      primary = '#d4b196'; secondary = '';
    } else if (this.theme == 'electronics_one') {
      primary = '#1a7ef2'; secondary = '';
    } else if (this.theme == 'electronics_two') {
      primary = '#6d7e87'; secondary = '';
    } else if (this.theme == 'electronics_three') {
      primary = '#2874f0'; secondary = '';
    } else if (this.theme == 'marketplace_one') {
      primary = '#3e5067'; secondary = '';
    } else if (this.theme == 'marketplace_two' || this.theme == 'marketplace_four') {
      primary = '#f39910'; secondary = '#394868';
    } else if (this.theme == 'marketplace_three') {
      primary = '#387ef0'; secondary = '';
    } else if (this.theme == 'vegetables_two' || this.theme == 'vegetables_three' || this.theme == 'nursery') {
      primary = '#81ba00'; secondary = '';
    } else if (this.theme == 'jewellery_one') {
      primary = '#5fcbc4'; secondary = '';
    } else if (this.theme == 'vegetables_four') {
      primary = '#206664'; secondary = '#ee7a63';
    } else if (this.theme == 'bag' || this.theme == 'beauty') {
      primary = '#f0b54d'; secondary = '';
    } else if (this.theme == 'watch') {
      primary = '#e4604a'; secondary = '';
    } else if (this.theme == 'medical') {
      primary = '#38c6bb'; secondary = '';
    } else if (this.theme == 'perfume') {
      primary = '#6d6659'; secondary = '';
    } else if (this.theme == 'yoga') {
      primary = '#f0583d'; secondary = '';
    } else if (this.theme == 'marijuana') {
      primary = '#5d7227'; secondary = '#203f15';
    } else if (this.theme == 'shoes') {
      primary = '#d57151'; secondary = '';
    } else if (this.theme == 'kids') {
      primary = '#fa869b'; secondary = '';
    } else if (this.theme == 'books') {
      primary = '#5ecee4'; secondary = '';
    } else if (this.theme == 'goggles') {
      primary = '#dc457e'; secondary = '';
    } else if (this.theme == 'video_slider') {
      primary = '#e38888'; secondary = '';
    } else if (this.theme == 'gym') {
      primary = '#01effc'; secondary = '#485ff2';
    } else if (this.theme == 'flower') {
      primary = '#fa869b'; secondary = '';
    } else if (this.theme == 'digital_download') {
      primary = '#234ca1'; secondary = '';
    } else if (this.theme == 'pets') {
      primary = '#ff9944'; secondary = '';
    } else if (this.theme == 'parallax') {
      primary = '#866e6c'; secondary = '';
    } else if (this.theme == 'single_product') {
      primary = '#854D9C'; secondary = '#d04ed6';
    } else if (this.theme == 'gradient') {
      primary = '#dd5e89'; secondary = '#f7bb97';
    } else if (this.theme == 'surfboard') {
      primary = '#2E94D2'; secondary = '';
    }

    s.theme_color = primary;
    s.theme_color_2 = secondary;

    // Only apply CSS variables if we are in the browser
    if (this.isBrowser) {
      document.body.style.setProperty('--theme-color', primary);
      if (secondary) {
        document.body.style.setProperty('--theme-color2', secondary);
      } else {
        document.body.style.removeProperty('--theme-color2');
      }
    }
  }

  openLoginModal(event: Event) {
    if (event) {
      this.router.navigate(['/login']);
    }
  }

  setLogo() {
    // ✅ 4. Default to Vegetable 4 Logo
    let headerLogo = 'assets/images/icon/logo/70.png';
    let footerLogo = 'assets/images/icon/logo/70.png';

    if (this.theme && this.theme !== 'vegetables_four') {
      if (this.theme == 'fashion_one' || this.theme == 'tools' || this.theme == 'left_sidebar' || this.theme == 'video') {
        headerLogo = 'assets/images/icon/logo/12.png'; footerLogo = 'assets/images/icon/logo/f6.png';
      }
      else if (this.theme == 'fashion_two' || this.theme == 'fashion_three') {
        headerLogo = 'assets/images/icon/logo/2.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'fashion_four') {
        headerLogo = 'assets/images/icon/logo/8.png'; footerLogo = 'assets/images/icon/logo/f3.png';
      }
      else if (this.theme == 'fashion_five') {
        headerLogo = 'assets/images/icon/logo/11.png'; footerLogo = 'assets/images/icon/logo/f5.png';
      }
      else if (this.theme == 'fashion_six') {
        headerLogo = 'assets/images/icon/logo/9.png'; footerLogo = 'assets/images/icon/logo/f4.png';
      }
      else if (this.theme == 'fashion_seven') {
        headerLogo = 'assets/images/icon/logo/42.png'; footerLogo = 'assets/images/icon/logo/f20.png';
      }
      else if (this.theme == 'furniture_one') {
        headerLogo = 'assets/images/icon/logo/1.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'furniture_two') {
        headerLogo = 'assets/images/icon/logo/15.png'; footerLogo = 'assets/images/icon/logo/f8.png';
      }
      else if (this.theme == 'furniture_dark') {
        headerLogo = 'assets/images/icon/logo/29.png'; footerLogo = 'assets/images/icon/logo/f14.png';
      }
      else if (this.theme == 'electronics_one') {
        headerLogo = 'assets/images/icon/logo/3.png'; footerLogo = 'assets/images/icon/logo/f2.png';
      }
      else if (this.theme == 'electronics_two') {
        headerLogo = 'assets/images/icon/logo/20.png'; footerLogo = 'assets/images/icon/logo/f9.png';
      }
      else if (this.theme == 'electronics_three') {
        headerLogo = 'assets/images/icon/logo/21.png'; footerLogo = 'assets/images/icon/logo/f10.png';
      }
      else if (this.theme == 'marketplace_one') {
        headerLogo = 'assets/images/icon/logo/18.png'; footerLogo = 'assets/images/icon/logo/f9.png';
      }
      else if (this.theme == 'marketplace_two') {
        headerLogo = 'assets/images/icon/logo/25.png'; footerLogo = 'assets/images/icon/logo/f12.png';
      }
      else if (this.theme == 'marketplace_three') {
        headerLogo = 'assets/images/icon/logo/26.png'; footerLogo = 'assets/images/icon/logo/f13.png';
      }
      else if (this.theme == 'marketplace_four') {
        headerLogo = 'assets/images/icon/logo/37.png'; footerLogo = 'assets/images/icon/logo/f12.png';
      }
      else if (this.theme == 'vegetables_one') {
        headerLogo = 'assets/images/icon/logo/5.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'vegetables_two') {
        headerLogo = 'assets/images/icon/logo/16.png'; footerLogo = 'assets/images/icon/logo/f8.png';
      }
      else if (this.theme == 'vegetables_three') {
        headerLogo = 'assets/images/icon/logo/43.png'; footerLogo = 'assets/images/icon/logo/f21.png';
      }
      else if (this.theme == 'jewellery_one') {
        headerLogo = 'assets/images/icon/logo/13.png'; footerLogo = 'assets/images/icon/logo/f7.png';
      }
      else if (this.theme == 'jewellery_two') {
        headerLogo = 'assets/images/icon/logo/44.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'jewellery_three') {
        headerLogo = 'assets/images/icon/logo/46.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'bag') {
        headerLogo = 'assets/images/icon/logo/7.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'watch') {
        headerLogo = 'assets/images/icon/logo/6.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'medical') {
        headerLogo = 'assets/images/icon/logo/22.png'; footerLogo = 'assets/images/icon/logo/f11.png';
      }
      else if (this.theme == 'perfume') {
        headerLogo = 'assets/images/icon/logo/24.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'yoga') {
        headerLogo = 'assets/images/icon/logo/23.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'christmas') {
        headerLogo = 'assets/images/icon/logo/27.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'bicycle') {
        headerLogo = 'assets/images/icon/logo/30.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'marijuana') {
        headerLogo = 'assets/images/icon/logo/31.png'; footerLogo = 'assets/images/icon/logo/f15.png';
      }
      else if (this.theme == 'shoes') {
        headerLogo = 'assets/images/icon/logo/17.png'; footerLogo = 'assets/images/icon/logo/f8.png';
      }
      else if (this.theme == 'kids') {
        headerLogo = 'assets/images/icon/logo/33.png'; footerLogo = 'assets/images/icon/logo/f16.png';
      }
      else if (this.theme == 'books') {
        headerLogo = 'assets/images/icon/logo/34.png'; footerLogo = 'assets/images/icon/logo/f17.png';
      }
      else if (this.theme == 'beauty') {
        headerLogo = 'assets/images/icon/logo/4.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'goggles') {
        headerLogo = 'assets/images/icon/logo/35.png'; footerLogo = 'assets/images/icon/logo/f18.png';
      }
      else if (this.theme == 'video_slider') {
        headerLogo = 'assets/images/icon/logo/36.png'; footerLogo = 'assets/images/icon/logo/f19.png';
      }
      else if (this.theme == 'gym') {
        headerLogo = 'assets/images/icon/logo/38.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'flower') {
        headerLogo = 'assets/images/icon/logo/40.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'nursery') {
        headerLogo = 'assets/images/icon/logo/41.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'digital_download') {
        headerLogo = 'assets/images/icon/logo/48.png'; footerLogo = 'assets/images/icon/logo/f21.png';
      }
      else if (this.theme == 'pets') {
        headerLogo = 'assets/images/icon/logo/45.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'game') {
        headerLogo = 'assets/images/icon/logo/39.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'parallax') {
        headerLogo = 'assets/images/icon/logo/14.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'single_product') {
        headerLogo = 'assets/images/icon/logo/32.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'gradient') {
        headerLogo = 'assets/images/icon/logo/47.png'; footerLogo = 'assets/images/icon/logo/f1.png';
      }
      else if (this.theme == 'surfboard') {
        headerLogo = 'assets/images/icon/logo/50.png'; footerLogo = 'assets/images/icon/logo/f23.png';
      }
    }

    return { header_logo: headerLogo, footer_logo: footerLogo };
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.isBrowser) {
      let number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      this.show = number > 600;
    }
  }
}