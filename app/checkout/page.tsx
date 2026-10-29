import { redirect } from "next/navigation";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { getServerSession } from "@/lib/auth-server";

export default async function CheckoutPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/login?callbackURL=%2Fcheckout");
  return <CheckoutForm />;
}
