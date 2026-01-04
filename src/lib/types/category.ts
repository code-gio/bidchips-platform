export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  icon: string | null;
  color: string | null;
  image_url: string | null;
  sort_order: number;
  lot_count: number;
  active_lot_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

