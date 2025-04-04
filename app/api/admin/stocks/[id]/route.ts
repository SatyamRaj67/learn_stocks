import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stockUpdateSchema } from "@/schemas";

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

// PUT update stock (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const stockId = params.id;
    const data = await req.json();

    // Validate the input data
    const validatedData = stockUpdateSchema.parse(data);

    // Check if stock exists
    const existingStock = await prisma.stock.findUnique({
      where: { id: stockId },
    });

    if (!existingStock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    // Update the stock
    const updatedStock = await prisma.stock.update({
      where: { id: stockId },
      data: validatedData,
    });

    return NextResponse.json(updatedStock);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("[ADMIN_STOCK_UPDATE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE stock (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const stockId = params.id;

    // Check if stock exists
    const existingStock = await prisma.stock.findUnique({
      where: { id: stockId },
    });

    if (!existingStock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    // Check if stock has any transactions
    const hasTransactions = await prisma.transaction.findFirst({
      where: { stockId },
    });

    if (hasTransactions) {
      return NextResponse.json(
        {
          error:
            "Cannot delete stock with existing transactions. " +
            "Set it as inactive instead.",
        },
        { status: 400 }
      );
    }

    // Delete the stock
    await prisma.stock.delete({
      where: { id: stockId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_STOCK_DELETE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
