import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function isAdmin() {
  const session = await auth();
  if (!session?.user) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}
