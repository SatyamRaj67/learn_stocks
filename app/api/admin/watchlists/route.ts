import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { serializeData } from "@/lib/utils/serializeData";
import { checkAdminRole } from "@/lib/utils/roleCheck";
import { authOptions } from "@/lib/auth/options";

// GET all watchlists
export async function GET() {
  const session = await getServerSession(authOptions);

  const { isAuthorized, response } = checkAdminRole(session);

  if (!isAuthorized) {
    return response;
  }

  try {
    const watchlists = await prisma.watchlist.findMany({
      include: {
        user: true,
        items: {
          include: {
            stock: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Serialize to handle Decimal values
    return NextResponse.json(serializeData(watchlists));
  } catch (error) {
    console.error("Error fetching watchlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlists" },
      { status: 500 },
    );
  }
}

// POST to create missing watchlists
export async function POST() {
  const session = await getServerSession(authOptions);

  const { isAuthorized, response } = checkAdminRole(session);

  if (!isAuthorized) {
    return response;
  }

  try {
    // Find users without watchlists
    const usersWithoutWatchlists = await prisma.user.findMany({
      where: { watchlist: null },
      select: { id: true },
    });

    // Create watchlists for these users
    if (usersWithoutWatchlists.length > 0) {
      await Promise.all(
        usersWithoutWatchlists.map((user) =>
          prisma.watchlist.create({
            data: { userId: user.id },
          }),
        ),
      );
    }

    return NextResponse.json({
      success: true,
      count: usersWithoutWatchlists.length,
    });
  } catch (error) {
    console.error("Error creating watchlists:", error);
    return NextResponse.json(
      { error: "Failed to create watchlists" },
      { status: 500 },
    );
  }
}
