import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { checkAdminRole } from "@/lib/utils/roleCheck";
import { authOptions } from "@/lib/auth/options";

interface UserTransactionGroup {
  [userId: string]: {
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
    count: number;
  };
}

// GET single stock by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const stock = await prisma.stock.findUnique({
      where: { id },
    });

    if (!stock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    return NextResponse.json(stock);
  } catch (error) {
    console.error("Error fetching stock:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock" },
      { status: 500 },
    );
  }
}

// PUT update stock (admin only)
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Check admin authorization
  const session = await getServerSession(authOptions);
  const { isAuthorized, response } = checkAdminRole(session);

  if (!isAuthorized) {
    return response;
  }

  try {
    const { id } = context.params;
    const data = await request.json();

    // Check if stock exists
    const exists = await prisma.stock.findUnique({
      where: { id },
    });

    if (!exists) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    // Update the stock
    const stock = await prisma.stock.update({
      where: { id },
      data: {
        symbol: data.symbol,
        name: data.name,
        currentPrice: Number(data.currentPrice),
        previousClose: data.previousClose
          ? Number(data.previousClose)
          : undefined,
        openPrice: data.openPrice ? Number(data.openPrice) : undefined,
        highPrice: data.highPrice ? Number(data.highPrice) : undefined,
        lowPrice: data.lowPrice ? Number(data.lowPrice) : undefined,
        volume: data.volume !== undefined ? Number(data.volume) : undefined,
        marketCap: data.marketCap ? Number(data.marketCap) : undefined,
        description: data.description || undefined,
        sector: data.sector || undefined,
      },
    });

    return NextResponse.json(stock);
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { error: "Failed to update stock" },
      { status: 500 },
    );
  }
}

// DELETE stock (admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Check admin authorization
  const session = await getServerSession(authOptions);
  const { isAuthorized, response } = checkAdminRole(session);

  if (!isAuthorized) {
    return response;
  }

  try {
    const { id } = context.params;
    const { forceDelete } = await request.json().catch(() => ({}));

    // Check if stock exists
    const stock = await prisma.stock.findUnique({
      where: { id },
    });

    if (!stock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    // Check for related transactions
    const relatedTransactions = await prisma.transaction.count({
      where: { stockId: id },
    });

    if (relatedTransactions > 0 && !forceDelete) {
      // Get user transaction details
      const transactions = await prisma.transaction.findMany({
        where: { stockId: id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        take: 10, // Limit results
      });

      // Group transactions by user
      const userTransactions = transactions.reduce<UserTransactionGroup>(
        (acc, transaction) => {
          if (!acc[transaction.user.id]) {
            acc[transaction.user.id] = {
              user: transaction.user,
              count: 0,
            };
          }
          acc[transaction.user.id].count++;
          return acc;
        },
        {},
      );

      return NextResponse.json(
        {
          error: "Cannot delete stock that has related transactions.",
          hasRelatedTransactions: true,
          transactionCount: relatedTransactions,
          affectedUsers: Object.values(userTransactions),
        },
        { status: 400 },
      );
    }

    if (forceDelete && relatedTransactions > 0) {
      // First delete all related transactions in a transaction
      await prisma.$transaction([
        prisma.transaction.deleteMany({ where: { stockId: id } }),
        prisma.stock.delete({ where: { id } }),
      ]);
    } else {
      // Normal delete (no transactions)
      await prisma.stock.delete({
        where: { id },
      });
    }

    return NextResponse.json(
      { message: "Stock deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting stock:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to delete stock", details: errorMessage },
      { status: 500 },
    );
  }
}