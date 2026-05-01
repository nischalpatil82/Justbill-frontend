import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private store = inject(Store);

  user$: Observable<any> = this.store.select(state => state?.auth?.user);

  openModal(type: string) {
    console.log('Open modal:', type);
  }
}