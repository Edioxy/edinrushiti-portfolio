import { AdminApp } from "@/components/admin/AdminApp";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/auth";

export default async function AdminPage() {
  const configured = isAdminConfigured();
  const authenticated = configured ? await isAdminAuthenticated() : false;

  return <AdminApp configured={configured} authenticated={authenticated} />;
}
