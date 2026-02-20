
export interface TourDate {
  id: string;
  date: string;
  venue: string;
  location: string;
  status: 'Available' | 'Sold Out' | 'Canceled';
  ticketUrl: string;
}

export interface MusicRelease {
  id: string;
  title: string;
  year: string;
  coverUrl: string;
  type: 'Album' | 'Single' | 'EP';
  links: {
    spotify: string;
    apple: string;
  };
}

export interface PressArticle {
  id: string;
  title: string;
  outlet: string;
  date: string;
  excerpt: string;
  imageUrl: string;
  url: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
}

export interface User {
  email: string;
  name: string;         // first_name + last_name
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  country?: string;
  emailVerified?: boolean;
}

// ─── Shop ────────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: 'vinyl' | 'apparel' | 'limited';
  stock: number;
  stripe_price_id?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  user_email: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  stripe_session_id?: string;
  shipping_address?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  source: 'newsletter' | 'registration' | 'shop_notify';
  active: boolean;
  subscribed_at: string;
}

export interface Dancer {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
}
