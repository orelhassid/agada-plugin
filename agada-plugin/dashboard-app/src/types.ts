export interface Product {
  id: number;
  slug: string;
  name: string;
  image_url: string;
  is_optional_extra: number;
  price_per_person: number;
  extra_cost: number;
  is_predefined: number;
  is_active: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: number;
  slug: string;
  name: string;
  includes_json: string;
  base_price_per_person: number;
  image_url: string;
  meals_json: string;
  is_active: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  whatsapp_number: string;
  notification_email: string;
  default_min_portions: number;
  notices: Notice[];
  special_dates: SpecialDate[];
}

export interface Notice {
  text: string;
  type?: string;
}

export interface SpecialDate {
  date: string;
  min_portions: number;
  label?: string;
}

export type Screen = "products" | "packages" | "settings";
