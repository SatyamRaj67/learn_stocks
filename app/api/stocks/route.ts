import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const stocks = await prisma.stock.findMany({
      select: {
        id: true,
        symbol: true,
        name: true,
        sector: true,
        currentPrice: true,
        previousClose: true,
        volume: true,
        marketCap: true,
        isActive: true,
        isFrozen: true,
      },
      orderBy: {
        symbol: "asc",
      },
    });

    // Convert Decimal values to numbers for JSON serialization
    const serializedStocks = stocks.map((stock) => ({
      ...stock,
      currentPrice: parseFloat(stock.currentPrice.toString()),
      previousClose: stock.previousClose
        ? parseFloat(stock.previousClose.toString())
        : null,
      marketCap: stock.marketCap
        ? parseFloat(stock.marketCap.toString())
        : null,
    }));

    return NextResponse.json(serializedStocks);
  } catch (error) {
    console.error("[STOCKS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
