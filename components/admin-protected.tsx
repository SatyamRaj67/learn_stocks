import { auth } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { UserRole } from "@prisma/client";

interface AdminProtectedProps {
  children: React.ReactNode;
}

export default async function AdminProtected({
  children,
}: AdminProtectedProps) {
  const session = await auth();

  if (session?.user?.role === UserRole.ADMIN) {
    Response.redirect(DEFAULT_LOGIN_REDIRECT);
  }

  return <>{children}</>;
}
