import { AdminShell } from "@/components/layout/AdminShell";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
