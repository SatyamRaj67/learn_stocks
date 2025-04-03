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

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const stock = await prisma.stock.findUnique({ where: { id: stockId } });

    if (!user || !stock) {
      return NextResponse.json(
        { error: "User or stock not found" },
        { status: 404 }
      );
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: userId },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found for this user" },
        { status: 404 }
      );
    }

    const existingPosition = await prisma.position.findUnique({
      where: {
        portfolioId_stockId: { portfolioId: portfolio.id, stockId: stockId },
      },
    });

    if (!existingPosition) {
      return NextResponse.json(
        { error: "You do not hold this stock" },
        { status: 400 }
      );
    }

    if (existingPosition.quantity < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock to sell" },
        { status: 400 }
      );
    }

    const currentStockPrice = stock.currentPrice.toNumber();
    const sellValue = quantity * currentStockPrice;

    await prisma.user.update({
      where: { id: userId },
      data: { balance: user.balance.toNumber() + sellValue },
    });

    const newQuantity = existingPosition.quantity - quantity;

    if (newQuantity === 0) {
      await prisma.position.delete({
        where: { id: existingPosition.id },
      });
    } else {
      await prisma.position.update({
        where: { id: existingPosition.id },
        data: {
          quantity: newQuantity,
          currentValue: currentStockPrice * newQuantity,
          profitLoss:
            (currentStockPrice - existingPosition.averageBuyPrice.toNumber()) *
            newQuantity,
        },
      });
    }

    await prisma.transaction.create({
      data: {
        user: { connect: { id: userId } },
        stock: { connect: { id: stockId } },
        type: "SELL",
        quantity: quantity,
        price: currentStockPrice,
        totalAmount: sellValue,
      },
    });

    return NextResponse.json(
      { message: "Sell order processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing sell order:", error);
    return NextResponse.json(
      { error: "Failed to process sell order" },
      { status: 500 }
    );
  }
}
