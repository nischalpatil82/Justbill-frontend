import { IAttachment } from './attachment.interface';
import { IPaymentDetails } from './payment-details.interface';
import { IPoint } from './point.interface';
import { IRole } from './role.interface';
import { IUserAddress } from './user.interface';
import { IWallet } from './wallet.interface';

export interface IAccountUser {
  id: number;
  name: string;
  email: string;
  phone: string | number;
  country_code: string;
  profile_image?: IAttachment | null;
  profile_image_id?: number | null;
  status: boolean | number;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;

  orders_count?: number;

  role?: IRole | null;
  permission?: any[];

  address?: IUserAddress[];
  wallet?: IWallet | null;
  point?: IPoint | null;
  payment_account?: IPaymentDetails | null;
  
}

export interface IAccountUserUpdatePassword {
  current_password: string;
  new_password: string;
  confirm_password: string;
}
