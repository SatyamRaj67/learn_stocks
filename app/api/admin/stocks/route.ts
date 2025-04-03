import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const stockSchema = z.object({
  symbol: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  sector: z.string().optional().nullable(),
  currentPrice: z.coerce.number().min(0),
  previousClose: z.coerce.number().min(0).optional().nullable(),
  volume: z.coerce.number().min(0),
  marketCap: z.coerce.number().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
  isFrozen: z.boolean().default(false),
});

// Helper to check if user is admin
const isAdmin = async () => {
  const session = await auth();
  if (!session?.user) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
};

// GET all stocks (admin only)
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const stocks = await prisma.stock.findMany({
      orderBy: { symbol: "asc" },
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
    console.error("[ADMIN_STOCKS_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST create new stock (admin only)
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();

    // Validate the input data
    const validatedData = stockSchema.parse(data);

    // Check if stock with symbol already exists
    const existingStock = await prisma.stock.findFirst({
      where: { symbol: validatedData.symbol },
    });

    if (existingStock) {
      return NextResponse.json(
        { error: `Stock with symbol ${validatedData.symbol} already exists` },
        { status: 400 }
      );
    }

    // Get current user for created by
    const session = await auth();
    const userId = session?.user?.id;

    // Create the stock
    const stock = await prisma.stock.create({
      data: {
        ...validatedData,
        createdBy: userId ? { connect: { id: userId } } : {},
      },
    });

    return NextResponse.json(stock);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("[ADMIN_STOCKS_POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
