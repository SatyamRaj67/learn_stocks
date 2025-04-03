import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { TransactionType } from "@prisma/client"; 
import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";

    let dateFilter = {};
    let typeFilter = {};

    if (type !== "all") {
      if (type === "BUY" || type === "SELL") {
        typeFilter = { type: type as TransactionType };
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        ...dateFilter,
        ...typeFilter,
      },
      include: {
        stock: {
          select: {
            symbol: true,
            name: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("[TRANSACTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
