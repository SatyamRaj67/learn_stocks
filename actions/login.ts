"use server";

import * as z from "zod";

import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/data/user";
import {
  generateTwoFactorToken,
  generateVerificationToken,
} from "@/lib/tokens";
import { sendTwoFactorEmail, sendVerificationEmail } from "@/lib/mail";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { prisma } from "@/lib/prisma";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null,
) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;

  const exisitingUser = await getUserByEmail(email);
  if (!exisitingUser || !exisitingUser.email || !exisitingUser.password) {
    return { error: "User does not exist!" };
  }

  if (!exisitingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      exisitingUser.email,
    );

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );

    return { success: "Confirmation Email Sent!" };
  }

  if (exisitingUser.isTwoFactorEnabled && exisitingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(
        exisitingUser.email,
      );

      if (!twoFactorToken) {
        return { error: "Invalid Code!" };
      }

      if (twoFactorToken.token !== code) {
        return { error: "Invalid Code!" };
      }

      const hasExpired = new Date() > new Date(twoFactorToken.expires);

      if (hasExpired) {
        return { error: "Code has expired!" };
      }

      await prisma.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        exisitingUser.id,
      );

      if (existingConfirmation) {
        await prisma.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await prisma.twoFactorConfirmation.create({
        data: {
          userId: exisitingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(exisitingUser.email);
      await sendTwoFactorEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }
};
