import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/options";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const page = pageParam ? parseInt(pageParam, 10) : 0;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const skip = page * limit;

    // Debug log
    console.log(
      `Fetching page ${page}, limit ${limit} for user ${session.user.id}`,
    );

    // Get total count for pagination
    const total = await prisma.transaction.count({
      where: { userId: session.user.id },
    });

    // Get transactions with pagination
    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: "desc" },
      include: { stock: true },
      skip,
      take: limit,
    });

    // Debug log
    console.log(`Found ${transactions.length} transactions, total: ${total}`);

    return NextResponse.json({
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

// POST endpoint for new transactions
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { stockId, quantity, type, price } = await request.json();

  if (!stockId || !quantity || !type || !price) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    // Start a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        include: {
          portfolio: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const stock = await tx.stock.findUnique({
        where: { id: stockId },
      });

      if (!stock) {
        throw new Error("Stock not found");
      }

      const totalCost = parseFloat((price * quantity).toFixed(2));

      // Handle buying
      if (type === "BUY") {
        if (user.balance.toNumber() < totalCost) {
          throw new Error("Insufficient funds");
        }

        // Update user balance
        await tx.user.update({
          where: { id: session.user.id },
          data: { balance: { decrement: totalCost } },
        });

        // Check if portfolio exists, if not create one
        let portfolioId = user.portfolio?.id;
        if (!portfolioId) {
          const newPortfolio = await tx.portfolio.create({
            data: { userId: user.id },
          });
          portfolioId = newPortfolio.id;
        }

        // Check if position exists
        const existingPosition = await tx.position.findFirst({
          where: {
            portfolioId,
            stockId,
          },
        });

        if (existingPosition) {
          // Update existing position with new weighted average price
          const totalShares = existingPosition.quantity + quantity;
          const newAveragePrice =
            (existingPosition.quantity *
              parseFloat(existingPosition.averageBuyPrice.toString()) +
              totalCost) /
            totalShares;

          await tx.position.update({
            where: { id: existingPosition.id },
            data: {
              quantity: { increment: quantity },
              averageBuyPrice: newAveragePrice,
              currentValue: { increment: totalCost },
              profitLoss: {
                set:
                  totalShares * parseFloat(stock.currentPrice.toString()) -
                  totalShares * newAveragePrice,
              },
            },
          });
        } else {
          // Create new position
          await tx.position.create({
            data: {
              portfolioId,
              stockId,
              quantity,
              averageBuyPrice: price,
              currentValue: totalCost,
              profitLoss: 0, // Initially no profit/loss
            },
          });
        }
      }
      // Handle selling
      else if (type === "SELL") {
        const position = await tx.position.findFirst({
          where: {
            portfolioId: user.portfolio?.id,
            stockId,
          },
        });

        if (!position || position.quantity < quantity) {
          throw new Error("Insufficient shares to sell");
        }

        // Update user balance - add sale proceeds
        await tx.user.update({
          where: { id: session.user.id },
          data: { balance: { increment: totalCost } },
        });

        if (position.quantity === quantity) {
          // Remove position if all shares sold
          await tx.position.delete({
            where: { id: position.id },
          });
        } else {
          // Update position
          await tx.position.update({
            where: { id: position.id },
            data: {
              quantity: { decrement: quantity },
              currentValue: {
                set:
                  (position.quantity - quantity) *
                  parseFloat(position.averageBuyPrice.toString()),
              },
              profitLoss: {
                set:
                  (position.quantity - quantity) *
                  (parseFloat(stock.currentPrice.toString()) -
                    parseFloat(position.averageBuyPrice.toString())),
              },
            },
          });
        }
      }

      // Record transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: session.user.id,
          stockId,
          quantity,
          price,
          type,
          timestamp: new Date(),
          totalAmount: totalCost,
        },
        include: {
          stock: true,
        },
      });

      // Recalculate portfolio value
      const updatedPositions = await tx.position.findMany({
        where: { portfolioId: user.portfolio?.id },
        include: { stock: true },
      });

      const portfolioValue = updatedPositions.reduce(
        (sum, pos) =>
          sum + pos.quantity * parseFloat(pos.stock.currentPrice.toString()),
        0,
      );

      // Update user's portfolio value
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          portfolioValue,
          // Calculate total profit/loss
          totalProfit: {
            set: updatedPositions.reduce(
              (sum, pos) => sum + parseFloat(pos.profitLoss.toString()),
              0,
            ),
          },
        },
        select: {
          balance: true,
          portfolioValue: true,
          totalProfit: true,
        },
      });

      return {
        transaction,
        user: updatedUser,
      };
    });

    return NextResponse.json(result);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process transaction" },
      { status: 400 },
    );
  }
}
