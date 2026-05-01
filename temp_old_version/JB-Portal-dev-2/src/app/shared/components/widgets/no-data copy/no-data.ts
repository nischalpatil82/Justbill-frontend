import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-no-data',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './no-data.html',
  styleUrl: './no-data.scss',
})
export class NoData {
  @Input() class: string = 'no-data-added';
  @Input() image: string;
  @Input() text: string;
  @Input() description: string;
}
