import { IAccountUserUpdatePassword } from '../../interface/account.interface';
import { IUserAddress } from '../../interface/user.interface';

export class GetUserDetailsAction {
  static readonly type = '[Account] Get User Details';
  constructor() {}
}

export class UpdateUserProfileAction {
  static readonly type = '[Account] Update User Profile';
  constructor(public payload: any) {}
}

export class UpdateUserPasswordAction {
  static readonly type = '[Account] Update User Password';
  constructor(public payload: IAccountUserUpdatePassword) {}
}

export class CreateAddressAction {
  static readonly type = '[Account] Create Address';
 constructor(public payload: any) {}

}

export class UpdateAddressAction {
  static readonly type = '[Account] Update Address';
  constructor(public payload: IUserAddress, public id: number) {}
}

export class DeleteAddressAction {
  static readonly type = '[Account] Delete Address';
  constructor(public id: number) {}
}

export class AccountClearAction {
  static readonly type = '[Account] Clear';
  constructor() {}
}
