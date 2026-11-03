export type StaffUser = {
  id: number;
  email: string;
  name: string;
  phone: string;
  avatar_url: string;
  avatar_initial: string;
  is_staff: boolean;
  is_superuser: boolean;
};

export type OrderStatus = "processing" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type AdminOrderListItem = {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  delivery_method: string;
  total: string;
  currency: string;
  total_bdt: string;
  contact_email: string;
  contact_phone: string;
  customer_email: string;
  customer_name: string;
  item_count: number;
  created_at: string;
  updated_at: string;
};

export type AdminOrderDetail = AdminOrderListItem & {
  items: Array<{
    id: number;
    product: number | null;
    name: string;
    slug: string;
    image: string;
    color: string;
    size: string;
    price: string;
    quantity: number;
    line_total: string;
  }>;
  timeline: Array<{
    status: string;
    label: string;
    date: string | null;
    completed: boolean;
    order_index: number;
  }>;
  subtotal: string;
  shipping: string;
  discount: string;
  exchange_rate: string;
  payment_tran_id: string;
  paid_at: string | null;
  shipping_address: {
    full_name: string;
    phone: string;
    address: string;
    city: string;
    area: string;
    postal_code: string;
  };
  customer_id: number | null;
  estimated_delivery: string | null;
};

export type DashboardStats = {
  total_revenue: number;
  total_orders: number;
  pending_orders: number;
  total_products: number;
  low_stock_count: number;
  low_stock_products: Array<{ id: number; slug: string; name: string; stock: number }>;
  total_customers: number;
  unread_messages: number;
  newsletter_subscribers: number;
  recent_orders: AdminOrderListItem[];
  top_products: Array<{ name: string; units: number }>;
  revenue_labels: string[];
  revenue_data: number[];
};

export type AdminCategory = {
  id: number;
  slug: string;
  name: string;
  description: string;
  hero_image: string;
  image: string;
  order: number;
};

export type AdminProductListItem = {
  id: number;
  slug: string;
  name: string;
  category: string;
  category_name: string;
  price: string;
  compare_at_price: string | null;
  currency: string;
  stock: number;
  in_stock: boolean;
  featured: boolean;
  bestseller: boolean;
  new_arrival: boolean;
  primary_image: string;
  rating: string;
  review_count: number;
  created_at: string;
  updated_at: string;
};

export type AdminProductDetail = {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: string;
  compare_at_price: string | null;
  currency: string;
  description: string;
  short_description: string;
  materials: string;
  dimensions: string;
  care_instructions: string;
  stock: number;
  in_stock: boolean;
  featured: boolean;
  bestseller: boolean;
  new_arrival: boolean;
  tags: string[];
  images: Array<{ id: number; image: string; alt_text: string; order: number; color: string }>;
  colors: Array<{ id: number; name: string; image: string; order: number }>;
  sizes: Array<{ id: number; label: string; order: number }>;
  rating: string;
  review_count: number;
  created_at: string;
  updated_at: string;
};

export type AdminCustomerListItem = {
  id: number;
  email: string;
  name: string;
  phone: string;
  avatar_initial: string;
  is_active: boolean;
  date_joined: string;
  order_count: number;
};

export type AdminCustomerDetail = AdminCustomerListItem & {
  addresses: Array<{
    id: number;
    full_name: string;
    phone: string;
    address: string;
    city: string;
    area: string;
    postal_code: string;
    is_default: boolean;
    created_at: string;
  }>;
};

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type NewsletterSubscriber = {
  id: number;
  email: string;
  subscribed_at: string;
};

export type AdminNotificationItem = {
  id: string;
  type: "order" | "message";
  title: string;
  body: string;
  created_at: string;
  ref: string;
};

export type AdminNotifications = {
  count: number;
  new_orders_count: number;
  unread_messages_count: number;
  items: AdminNotificationItem[];
};
