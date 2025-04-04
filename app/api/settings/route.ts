import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get the current session
    const session = await auth();

    // If no session exists, user is not authenticated
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user details from database
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        emailVerified: true,
        balance: true,
        totalProfit: true,
        portfolioValue: true,
        isTwoFactorEnabled: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format decimal values for JSON response
    const formattedUser = {
      ...user,
      balance: user.balance.toString(),
      totalProfit: user.totalProfit.toString(),
      portfolioValue: user.portfolioValue.toString(),
    };

    // Return user data
    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("[SETTINGS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
