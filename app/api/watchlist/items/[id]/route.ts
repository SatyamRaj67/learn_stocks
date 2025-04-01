import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { checkAdminRole } from "@/lib/utils/roleCheck";
import { authOptions } from "@/lib/auth/options";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const session = await getServerSession(authOptions);

  const { isAuthorized, response } = checkAdminRole(session);

  if (!isAuthorized) {
    return response;
  }

  try {
    // Find watchlist with all items
    const watchlist = await prisma.watchlist.findUnique({
      where: {
        userId: params.userId,
      },
      include: {
        items: {
          include: {
            stock: true,
          },
          orderBy: {
            addedAt: "desc",
          },
        },
      },
    });

    if (!watchlist) {
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(watchlist);
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  const { isAuthorized, response } = checkAdminRole(session);

  if (!isAuthorized) {
    return response;
  }

  try {
    const itemId = params.id;

    // First check if the watchlist item exists and belongs to the user
    const watchlistItem = await prisma.watchlistItem.findUnique({
      where: { id: itemId },
      include: { watchlist: true },
    });

    if (!watchlistItem) {
      return NextResponse.json(
        { error: "Watchlist item not found" },
        { status: 404 },
      );
    }

    // Delete the watchlist item
    await prisma.watchlistItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing item from watchlist:", error);
    return NextResponse.json(
      { error: "Failed to remove stock from watchlist" },
      { status: 500 },
    );
  }
}
