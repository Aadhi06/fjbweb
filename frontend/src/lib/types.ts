export interface MetalRate {
  metal: string;
  price_per_gram: number;
  price_per_oz: number;
  buying_price_per_gram: number;
  change_24h: number;
  currency: string;
  updated_at: string;
}

export interface GoldCaratRate {
  carat: string;
  label?: string;
  purity: number;
  price_per_gram: number;
  buying_price_per_gram: number;
}

export interface FormField {
  id: number;
  name: string;
  label: string;
  type: "text" | "textarea" | "email" | "phone" | "number" | "select" | "checkbox" | "radio" | "file" | "date";
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
}

export interface DynamicForm {
  id: number;
  title: string;
  slug: string;
  description?: string;
  fields: FormField[];
  success_message: string;
}

export interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url?: string;
  time: number;
  review_key?: string;
  source?: "google" | "manual";
  reply_text?: string | null;
  replied_at?: string | null;
  is_hidden?: boolean;
}

export interface GoogleReviewsData {
  place_name: string;
  rating: number;
  total_reviews: number;
  reviews: GoogleReview[];
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  image?: string;
  category?: string;
  created_at: string;
  published_at?: string;
  reading_time?: string;
}
