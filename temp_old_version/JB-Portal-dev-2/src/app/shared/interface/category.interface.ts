import { IAttachment } from './attachment.interface';
import { IPaginateModel } from './core.interface';

export interface ICategoryModel extends IPaginateModel {
  data: ICategory[];
}

export interface ICategory {

  /* ===== BASIC ===== */
  id: number;
  name: string;
  slug: string;
  description: string;
  type: string;

  /* ===== PARENT ===== */
  parentID?: number | null;
  parent_id?: number | null;   // 🔥 keep for old logic

  /* ===== IMAGE ===== */
  imageID?: number | null;
  iconID?: number | null;

  category_image?: IAttachment;
  category_icon?: IAttachment;
  category_meta_image?: IAttachment;   // 🔥 keep for SEO

  /* ===== META (.NET) ===== */
  metaTitle?: string;
  metaDescription?: string;
  metaImageID?: number | null;

  /* ===== META (OLD THEME SUPPORT) ===== */
  meta_title?: string;          // 🔥 keep
  meta_description?: string;    // 🔥 keep

  /* ===== PRODUCT COUNT ===== */
  totalProduct?: number | null;
  products_count?: number;      // 🔥 keep for theme

  /* ===== STATUS ===== */
  isActive?: boolean;
  status?: boolean;             // 🔥 keep for theme

  /* ===== AUDIT ===== */
  createdUserID?: number | null;
  createdDateTime?: string;
  updatedUserID?: number | null;
  updatedDateTime?: string;

  /* ===== NESTED ===== */
  subcategories?: ICategory[];
}
