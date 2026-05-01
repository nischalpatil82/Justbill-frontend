export class GetWishlistAction {
  static readonly type = '[Wishlist] Get';
  constructor(public customerID: number) {}
}

export class AddToWishlistAction {
  static readonly type = '[Wishlist] Add';
  constructor(
    public productID: number,
    public customerID: number
  ) {}
}

export class DeleteWishlistAction {
  static readonly type = '[Wishlist] Delete';
  constructor(
    public id: number,        // DB record id (ml_productcustomer.id)
    public productID: number,
    public customerID: number
  ) {}
}
