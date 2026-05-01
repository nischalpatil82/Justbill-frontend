import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { HeaderEight } from './header-eight/header-eight';
import { HeaderFive } from './header-five/header-five';
import { HeaderFour } from './header-four/header-four';
import { HeaderOne } from './header-one/header-one';
import { HeaderSeven } from './header-seven/header-seven';
import { HeaderSix } from './header-six/header-six';
import { HeaderThree } from './header-three/header-three';
import { HeaderTwo } from './header-two/header-two';
import { IOption } from '../../interface/theme-option.interface';
import { IMobileMenu } from './widgets/mobile-menu/mobile-menu';
import { ThemeOptionState } from '../../store/state/theme-option.state';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    HeaderOne,
    HeaderTwo,
    HeaderThree,
    HeaderFour,
    HeaderFive,
    HeaderSix,
    HeaderSeven,
    HeaderEight,
    IMobileMenu,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  private router = inject(Router);
  route = inject(ActivatedRoute);

  themeOption$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  readonly logo = input<string>();

  // ✅ Initialize Defaults (Vegetables 4)
  public style: string = 'header_two';
  public sticky: boolean = true;
  public path: string = 'vegetables_four';
  
  // ✅ FIX: Added 'routes' property to fix the HTML error
  public routes: string;


  public hideMenu: boolean = false;

  ngOnInit(): void {
    // 1. Run immediately
    this.checkUrlAndSetHeader();

    this.route.queryParams.subscribe(params => {
       if (params['theme']) {
         this.path = params['theme'];
       }
       this.checkUrlAndSetHeader();
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkUrlAndSetHeader();
      }
    });
  }

checkUrlAndSetHeader() {
  // update route
  this.routes = this.router.url;

  // ✅ ALWAYS USE FASHION HEADER
  this.style = 'header_one';

  // ✅ ALWAYS SHOW MENU
  this.hideMenu = false;
}
}