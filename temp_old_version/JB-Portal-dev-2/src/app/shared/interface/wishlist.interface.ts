import { IPaginateModel } from './core.interface';
import { IProduct } from './product.interface';

export interface IWishlistModel extends IPaginateModel {
  data: IProduct[];
}

/* ================= MESSAGE INFO ================= */

export interface IMessageInfo {
  returnValue: number;
  returnMessage: string | null;
}

/* ================= PRODUCT-CUSTOMER TABLE ================= */

export interface IProductCustomer {
  id: number;
  productID: number;
  customerID: number;
  relationType: string;
  notes: string;
  createdUserID: number;
  createdDateTime: string;
  updatedUserID: number;
  updatedDateTime: string;
  isActive: boolean;
}

/* ================= GET WISHLIST RESPONSE ================= */

export interface IWishlistResponse {
  ml_productcustomer: IProductCustomer[];
  messageInfo: IMessageInfo;
  userDBConnStr: string | null;
}
