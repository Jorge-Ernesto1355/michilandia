import { getServerSession } from "@/lib/auth-server";

export async function getAdminSession() {
  const session = await getServerSession();
  return (session?.user as { role?: string } | undefined)?.role === "ADMIN" ? session : null;
}

export function isAdminRole(role: unknown) {
  return role === "ADMIN";
}
