"use server";

import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import { prisma } from "@/lib/prisma";
import { NewPasswordSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import * as z from "zod";

export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null,
) => {
  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { password } = validatedFields.data;

  if (!token) {
    return { error: "Missing Token!" };
  }

  const exisitingToken = await getPasswordResetTokenByToken(token);

  if (!exisitingToken) {
    return { error: "Invalid token!" };
  }

  const hasExpired = new Date(exisitingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(exisitingToken.email);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      password: hashedPassword,
    },
  });

  await prisma.passwordResetToken.delete({
    where: { id: exisitingToken.id },
  });

  return { success: "Password Updated!" };
};
