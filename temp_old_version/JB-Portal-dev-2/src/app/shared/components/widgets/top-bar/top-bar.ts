import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IValues } from '../../../interface/setting.interface';
import { IOption } from '../../../interface/theme-option.interface';
import { SettingState } from '../../../store/state/setting.state';
import { Currency } from '../../header/widgets/currency/currency';
import { Language } from '../../header/widgets/language/language';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, Language, Currency],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {

  private router = inject(Router);

  setting$: Observable<IValues> = inject(Store).select(SettingState.setting) as Observable<IValues>;

  readonly data = input<IOption | null>();
  readonly darkTopBar = input<boolean>();

isLoggedIn(): boolean {
  return !!sessionStorage.getItem('access_token');
}

getUserName(): string {
  const userData = JSON.parse(sessionStorage.getItem('account_user') || '{}');
  return userData?.m_customer?.firstName || 'User';
}

goToLogin() {
  this.router.navigate(['/login']);
}

goToProfile() {
  this.router.navigate(['/account/dashboard']);
}
}