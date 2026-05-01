import { Component, inject, input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IProduct } from '../../../../../../interface/product.interface';
import { ProductDetailsModal } from '../../../../modal/product-details-modal/product-details-modal';
import { ProductService } from '../../../../../../services/product.service';

@Component({
  selector: 'app-quick-view',
  templateUrl: './quick-view.html',
  styleUrl: './quick-view.scss',
})
export class QuickView {

  private modal = inject(NgbModal);
  private productService = inject(ProductService);

  readonly product = input<IProduct>();
  readonly class = input<string>();

openModal(product: IProduct) {

  this.productService.getProductDetails(product.id).subscribe({

    next: (res) => {

      console.log("API OK");

      const modalRef = this.modal.open(ProductDetailsModal, {
        centered: true,
        size: 'lg',
        windowClass: 'theme-modal-2 quick-view-modal',
      });

      // 🔥 USE ORIGINAL PRODUCT ONLY
      modalRef.componentInstance.product = product;
    }

  });
}
}