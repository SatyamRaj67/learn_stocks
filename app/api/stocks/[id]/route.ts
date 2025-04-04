import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const url = new URL(req.url);
    const forceDelete = url.searchParams.get("force") === "true";

    // Check if the user is authenticated and has admin privileges
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const stockId = params.id;

    // Check if the stock exists
    const stock = await prisma.stock.findUnique({
      where: { id: stockId },
      include: {
        positions: { select: { id: true }, take: 1 },
        transactions: { select: { id: true }, take: 1 },
      },
    });

    if (!stock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    // Check if there are positions or transactions related to this stock
    if (
      !forceDelete &&
      (stock.positions.length > 0 || stock.transactions.length > 0)
    ) {
      return NextResponse.json(
        {
          error: "Cannot delete stock with existing positions or transactions",
          hasRelatedData: true,
        },
        { status: 400 }
      );
    }

    // For force delete, first remove all related records
    if (forceDelete) {
      await prisma.$transaction([
        // Delete positions referencing this stock
        prisma.position.deleteMany({
          where: { stockId },
        }),
        // Delete transactions referencing this stock
        prisma.transaction.deleteMany({
          where: { stockId },
        }),
        // Delete price history
        prisma.priceHistory.deleteMany({
          where: { stockId },
        }),
        // Delete watchlist items
        prisma.watchlistItem.deleteMany({
          where: { stockId },
        }),
        // Finally delete the stock
        prisma.stock.delete({
          where: { id: stockId },
        }),
      ]);
    } else {
      // Regular delete with just price history and watchlist items
      await prisma.$transaction([
        prisma.priceHistory.deleteMany({
          where: { stockId },
        }),
        prisma.watchlistItem.deleteMany({
          where: { stockId },
        }),
        prisma.stock.delete({
          where: { id: stockId },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[STOCK_DELETE]", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the stock" },
      { status: 500 }
    );
  }
}
