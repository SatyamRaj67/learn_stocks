import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { watchlistId, stockId } = await request.json();

    if (!watchlistId || !stockId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify the watchlist belongs to the user
    const watchlist = await prisma.watchlist.findUnique({
      where: {
        id: watchlistId,
        userId: session.user.id,
      },
    });

    if (!watchlist) {
      return NextResponse.json(
        { error: "Watchlist not found or access denied" },
        { status: 403 },
      );
    }

    // Check if item already exists to avoid duplicates
    const existing = await prisma.watchlistItem.findFirst({
      where: {
        watchlistId,
        stockId,
      },
    });

    if (existing) {
      return NextResponse.json({
        message: "Stock already in watchlist",
        item: existing,
      });
    }

    // Add the stock to the watchlist
    const watchlistItem = await prisma.watchlistItem.create({
      data: {
        watchlistId,
        stockId,
      },
    });

    return NextResponse.json(watchlistItem);
  } catch (error) {
    console.error("Error adding stock to watchlist:", error);
    return NextResponse.json(
      { error: "Failed to add stock to watchlist" },
      { status: 500 },
    );
  }
}
