import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, stockId, quantity: quantityStr } = body;
    const quantity = parseInt(quantityStr, 10);

    if (!userId || !stockId || isNaN(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: userId },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: "Wait for our Admins to approve" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const stock = await prisma.stock.findUnique({ where: { id: stockId } });

    if (!user || !stock) {
      return NextResponse.json(
        { error: "User or stock not found" },
        { status: 404 }
      );
    }
    const currentStockPrice = stock.currentPrice.toNumber();
    const totalCost = quantity * currentStockPrice;

    if (user.balance.toNumber() < totalCost) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { balance: user.balance.toNumber() - totalCost },
    }); // Find the user's portfolio

    const existingPosition = await prisma.position.findUnique({
      where: {
        portfolioId_stockId: { portfolioId: portfolio.id, stockId: stockId },
      },
    });

    if (existingPosition) {
      const newAverageBuyPrice =
        (existingPosition.averageBuyPrice.toNumber() *
          existingPosition.quantity +
          totalCost) /
        (existingPosition.quantity + quantity);

      await prisma.position.update({
        where: { id: existingPosition.id },
        data: {
          quantity: existingPosition.quantity + quantity,
          averageBuyPrice: newAverageBuyPrice,
          currentValue:
            stock.currentPrice.toNumber() *
            (existingPosition.quantity + quantity),
          profitLoss:
            (stock.currentPrice.toNumber() - newAverageBuyPrice) *
            (existingPosition.quantity + quantity),
        },
      });
    } else {
      await prisma.position.create({
        data: {
          portfolio: { connect: { id: portfolio.id } },
          stock: { connect: { id: stockId } },
          quantity: quantity,
          averageBuyPrice: currentStockPrice,
          currentValue: stock.currentPrice.toNumber() * quantity,
          profitLoss: 0,
        },
      });
    }

    await prisma.transaction.create({
      data: {
        user: { connect: { id: userId } },
        stock: { connect: { id: stockId } },
        type: "BUY",
        quantity: quantity,
        price: currentStockPrice,
        totalAmount: totalCost,
      },
    });

    return NextResponse.json(
      { message: "Buy order processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing buy order:", error);
    return NextResponse.json(
      { error: "Failed to process buy order" },
      { status: 500 }
    );
  }
}
