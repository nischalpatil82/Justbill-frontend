import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';

import { ChangePasswordModal } from '../../../shared/components/widgets/modal/change-password-modal/change-password-modal';
import { EditProfileModal } from '../../../shared/components/widgets/modal/edit-profile-modal/edit-profile-modal';
import { IUserAddress } from '../../../shared/interface/user.interface';
import { CurrencySymbolPipe } from '../../../shared/pipe/currency.pipe';
import { AccountState } from '../../../shared/store/state/account.state';
import { IAccountUser } from '../../../shared/interface/account.interface';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, TranslateModule, CurrencySymbolPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnDestroy {
  user$: Observable<IAccountUser | null> =
    this.store.select(AccountState.user);

  address: IUserAddress | null = null;
  private userSub!: Subscription;

  constructor(
    private store: Store,
    private modal: NgbModal,
  ) {
    this.userSub = this.user$.subscribe(user => {
      this.address = user?.address?.length ? user.address[0] : null;
    });
  }

  openModal(value: string) {
    if (value === 'profile') {
      this.modal.open(EditProfileModal, {
        centered: true,
        windowClass: 'theme-modal-2',
      });
    }

    if (value === 'password') {
      this.modal.open(ChangePasswordModal, {
        centered: true,
        windowClass: 'theme-modal-2',
      });
    }
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }
}
