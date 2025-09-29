import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingPageClient from "./LandingPageClient"

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return <LandingPageClient />;
}
