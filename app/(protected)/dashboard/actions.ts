"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getDashboardData() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Get user data with basic financial info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        balance: true,
        totalProfit: true,
        portfolioValue: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get portfolio positions
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        positions: {
          include: {
            stock: {
              select: {
                symbol: true,
                name: true,
                currentPrice: true,
              },
            },
          },
        },
      },
    });

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        stock: {
          select: {
            symbol: true,
            name: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 5,
    });

    // Calculate growth rate (if you have historical data)
    // For now, we'll calculate it based on total profit vs portfolio value
    let growthRate = 0;
    if (user.portfolioValue.toNumber() > 0) {
      growthRate =
        (user.totalProfit.toNumber() / user.portfolioValue.toNumber()) * 100;
    }

    return {
      user: {
        balance: user.balance.toNumber(),
        totalProfit: user.totalProfit.toNumber(),
        portfolioValue: user.portfolioValue.toNumber(),
        growthRate,
      },
      portfolio: portfolio || null,
      recentTransactions,
    };
  } catch (error) {
    console.error("[DASHBOARD_DATA]", error);
    throw new Error("Failed to fetch dashboard data");
  }
}
