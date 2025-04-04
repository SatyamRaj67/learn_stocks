import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const symbol = searchParams.get("symbol");

    // Ensure we have at least one identifier
    if (!id && !symbol) {
      return NextResponse.json(
        { error: "Stock ID or symbol is required" },
        { status: 400 }
      );
    }

    // Find the stock by ID or symbol
    const stock = await prisma.stock.findFirst({
      where: {
        OR: [
          { id: id ?? undefined },
          { symbol: symbol?.toUpperCase() ?? undefined },
        ],
        isActive: true,
      },
    });

    if (!stock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    // Get price history for this stock (last 30 days by default)
    const days = parseInt(searchParams.get("days") ?? "30");

    const priceHistory = await prisma.priceHistory.findMany({
      where: {
        stockId: stock.id,
      },
      orderBy: {
        timestamp: "desc", // Get newest records first
      },
      take: days,
    });

    // Reverse the array to get chronological order (oldest to newest)
    priceHistory.reverse();

    // Format data for chart
    const chartData = priceHistory.map((entry) => ({
      date: entry.timestamp.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      price: parseFloat(entry.price.toString()),
    }));

    // Calculate price change
    const latestPrice = stock.currentPrice.toNumber();
    const previousPrice = stock.previousClose?.toNumber() || latestPrice;
    const priceChange = latestPrice - previousPrice;
    const percentChange = (priceChange / previousPrice) * 100;

    return NextResponse.json({
      stock: {
        id: stock.id,
        symbol: stock.symbol,
        name: stock.name,
        sector: stock.sector,
        currentPrice: latestPrice,
      },
      chartData,
      priceChange,
      percentChange,
    });
  } catch (error) {
    console.error("Failed to fetch stock history:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock history" },
      { status: 500 }
    );
  }
}
