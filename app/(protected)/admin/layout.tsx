import { auth } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

interface AdminProtectedProps {
  children: React.ReactNode;
}

export default async function AdminProtectedLayout({
  children,
}: AdminProtectedProps) {
  const session = await auth();

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect(DEFAULT_LOGIN_REDIRECT);
  }

  return <>{children}</>;
}
