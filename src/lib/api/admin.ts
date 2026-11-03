import type {
  AdminCategory,
  AdminCustomerDetail,
  AdminCustomerListItem,
  AdminOrderDetail,
  AdminOrderListItem,
  AdminProductDetail,
  AdminProductListItem,
  AdminNotifications,
  ContactMessage,
  DashboardStats,
  NewsletterSubscriber,
  OrderStatus,
  StaffUser,
} from "@/lib/types";

import { http } from "./http";
import { clearTokens, setTokens } from "./token-store";

export async function loginStaff(email: string, password: string): Promise<StaffUser> {
  const data = await http.post<{ access: string; refresh: string }>("/auth/login/", { email, password });
  setTokens(data.access, data.refresh);
  try {
    return await http.get<StaffUser>("/admin/me/");
  } catch (err) {
    clearTokens();
    throw err;
  }
}

export function logoutStaff(): void {
  clearTokens();
}

export function fetchMe() {
  return http.get<StaffUser>("/admin/me/");
}

export function updateMyProfile(data: { name?: string; phone?: string } | FormData) {
  if (data instanceof FormData) return http.patchForm<StaffUser>("/admin/me/", data);
  return http.patch<StaffUser>("/admin/me/", data);
}

export function changeMyPassword(current_password: string, new_password: string) {
  return http.post<{ detail: string }>("/admin/me/change-password/", {
    current_password,
    new_password,
  });
}

export function fetchDashboard() {
  return http.get<DashboardStats>("/admin/dashboard/");
}

export function fetchNotifications() {
  return http.get<AdminNotifications>("/admin/notifications/");
}

export function markNotificationRead(type: "order" | "message", ref: string) {
  return http.post<{ detail: string }>("/admin/notifications/", { type, ref });
}

export function fetchOrders(params?: { status?: string; payment_status?: string; search?: string }) {
  return http.get<AdminOrderListItem[]>("/admin/orders/", params);
}

export function fetchOrder(orderNumber: string) {
  return http.get<AdminOrderDetail>(`/admin/orders/${orderNumber}/`);
}

export function updateOrderStatus(orderNumber: string, status: OrderStatus) {
  return http.patch<AdminOrderDetail>(`/admin/orders/${orderNumber}/status/`, { status });
}

export function fetchCategories() {
  return http.get<AdminCategory[]>("/admin/categories/");
}

export function createCategory(data: FormData | Record<string, unknown>) {
  if (data instanceof FormData) return http.postForm<AdminCategory>("/admin/categories/", data);
  return http.post<AdminCategory>("/admin/categories/", data);
}

export function updateCategory(slug: string, data: FormData | Record<string, unknown>) {
  if (data instanceof FormData) return http.patchForm<AdminCategory>(`/admin/categories/${slug}/`, data);
  return http.patch<AdminCategory>(`/admin/categories/${slug}/`, data);
}

export function deleteCategory(slug: string) {
  return http.delete(`/admin/categories/${slug}/`);
}

export function fetchProducts(params?: { search?: string; category?: string; in_stock?: string }) {
  return http.get<AdminProductListItem[]>("/admin/products/", params);
}

export function fetchProduct(slug: string) {
  return http.get<AdminProductDetail>(`/admin/products/${slug}/`);
}

export function createProduct(data: Record<string, unknown>) {
  return http.post<AdminProductDetail>("/admin/products/", data);
}

export function updateProduct(slug: string, data: Record<string, unknown>) {
  return http.patch<AdminProductDetail>(`/admin/products/${slug}/`, data);
}

export function deleteProduct(slug: string) {
  return http.delete(`/admin/products/${slug}/`);
}

export function uploadProductImage(slug: string, file: File, altText = "") {
  const form = new FormData();
  form.append("image_file", file);
  if (altText) form.append("alt_text", altText);
  return http.postForm(`/admin/products/${slug}/images/`, form);
}

export function deleteProductImage(slug: string, imageId: number) {
  return http.delete(`/admin/products/${slug}/images/${imageId}/`);
}

export function fetchCustomers(params?: { search?: string }) {
  return http.get<AdminCustomerListItem[]>("/admin/customers/", params);
}

export function fetchCustomer(id: number) {
  return http.get<AdminCustomerDetail>(`/admin/customers/${id}/`);
}

export function fetchMessages(params?: { search?: string; is_read?: string }) {
  return http.get<ContactMessage[]>("/admin/messages/", params);
}

export function markMessageRead(id: number) {
  return http.post<ContactMessage>(`/admin/messages/${id}/mark-read/`);
}

export function deleteMessage(id: number) {
  return http.delete(`/admin/messages/${id}/`);
}

export function fetchNewsletter(params?: { search?: string }) {
  return http.get<NewsletterSubscriber[]>("/admin/newsletter/", params);
}

export function deleteSubscriber(id: number) {
  return http.delete(`/admin/newsletter/${id}/`);
}
