import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { IFaqModel } from '../../../shared/interface/page.interface';
import { PageService } from '../../../shared/services/page.service';
import { GetFaqsAction } from '../../../shared/store/action/page.action';
import { PageState } from '../../../shared/store/state/page.state';

@Component({
  selector: 'app-faq',
  imports: [CommonModule, NgbAccordionModule, Breadcrumb, NoData],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
})
export class Faq {
  private store = inject(Store);
  pageService = inject(PageService);

  public breadcrumb: IBreadcrumb = {
    title: "FAQ's",
    items: [{ label: "FAQ's", active: true }],
  };

  faq$: Observable<IFaqModel> = inject(Store).select(PageState.faq);

  constructor() {
    this.store.dispatch(new GetFaqsAction());
  }
}
