import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  addDays,
  subDays,
  subMonths,
  subYears,
  format,
  parseISO,
} from "date-fns";
import { Decimal } from "@prisma/client/runtime/library";

// Define TypeScript interfaces
interface PortfolioHistoryPoint {
  date: string;
  value: number;
}

interface SectorAllocation {
  name: string;
  value: number;
}

interface PerformerData {
  symbol: string;
  name: string;
  return: number;
}

interface TradeActivity {
  date: string;
  buy: number;
  sell: number;
  balance: number;
}

interface VolumeData {
  date: string;
  volume: number;
  value: number;
}

interface StockPnL {
  symbol: string;
  name: string;
  profit: number;
  loss: number;
  unrealized: number;
  total?: number;
}

interface MarketTrend {
  id: number;
  market: number;
  stock: number;
}

interface Position {
  stock: {
    symbol: string;
    name: string;
    sector: string | null;
    currentPrice: Decimal;
  };
  averageBuyPrice: Decimal;
  currentValue: Decimal;
  profitLoss: Decimal;
  quantity: number;
}

interface Portfolio {
  positions: Position[];
}

interface Transaction {
  timestamp: Date;
  stock: {
    symbol: string;
    name: string;
  };
  type: "BUY" | "SELL";
  quantity: number;
  totalAmount: Decimal;
  profitLoss?: Decimal | null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "1m";

    // Calculate date range based on selected time period
    const now = new Date();
    let startDate = now;

    switch (timeRange) {
      case "1w":
        startDate = subDays(now, 7);
        break;
      case "1m":
        startDate = subMonths(now, 1);
        break;
      case "3m":
        startDate = subMonths(now, 3);
        break;
      case "6m":
        startDate = subMonths(now, 6);
        break;
      case "1y":
        startDate = subYears(now, 1);
        break;
      case "all":
        // Use oldest transaction date or account creation date
        const oldestTransaction = await prisma.transaction.findFirst({
          where: { userId },
          orderBy: { timestamp: "asc" },
          select: { timestamp: true },
        });
        startDate = oldestTransaction?.timestamp || subYears(now, 1);
        break;
    }

    // Get portfolio performance history
    const transactions = (await prisma.transaction.findMany({
      where: {
        userId,
        timestamp: { gte: startDate },
      },
      include: {
        stock: true,
      },
      orderBy: { timestamp: "asc" },
    })) as unknown as Transaction[];

    // Get current portfolio positions
    const portfolio = (await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        positions: {
          include: {
            stock: true,
          },
        },
      },
    })) as unknown as Portfolio | null;

    // Generate portfolio history data points
    const portfolioHistory = generatePortfolioHistoryData(
      transactions,
      portfolio,
      startDate,
      now
    );

    // Calculate sector allocation
    const sectorAllocation = calculateSectorAllocation(portfolio);

    // Calculate top performers
    const topPerformers = calculateTopPerformers(portfolio);

    // Calculate trade activity
    const tradeActivity = calculateTradeActivity(transactions, startDate, now);

    // Calculate volume by day
    const volumeByDay = calculateVolumeByDay(transactions);

    // Calculate P&L by stock
    const pnlByStock = calculatePnLByStock(portfolio, transactions);

    // Generate market correlation data
    const marketTrends = generateMarketTrendsData();

    return NextResponse.json({
      portfolioHistory,
      sectorAllocation,
      topPerformers,
      tradeActivity,
      volumeByDay,
      pnlByStock,
      marketTrends,
    });
  } catch (error) {
    console.error("[ANALYTICS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// Helper functions
function generatePortfolioHistoryData(
  transactions: Transaction[],
  portfolio: Portfolio | null,
  startDate: Date,
  endDate: Date
): PortfolioHistoryPoint[] {
  const datePoints: string[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    datePoints.push(format(currentDate, "yyyy-MM-dd"));
    currentDate = addDays(
      currentDate,
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      )
    );
    if (datePoints.length > 30) break; // Limit to 30 points for performance
  }

  // Simplified mock generation of portfolio values over time
  // In a real app, you would calculate actual portfolio value for each date
  let baseValue = 10000;
  let volatility = 0.03;

  return datePoints.map((date, index) => {
    // Create a somewhat realistic growth pattern
    const trend = 1 + (Math.random() * volatility * 2 - volatility);
    baseValue = baseValue * trend;

    return {
      date,
      value: Math.round(baseValue),
    };
  });
}

function calculateSectorAllocation(
  portfolio: Portfolio | null
): SectorAllocation[] {
  if (!portfolio?.positions?.length) return [];

  // Group by sector and sum values
  const sectors: Record<string, number> = {};
  portfolio.positions.forEach((position) => {
    const sector = position.stock.sector || "Uncategorized";
    if (!sectors[sector]) {
      sectors[sector] = 0;
    }
    sectors[sector] += Number(position.currentValue);
  });

  // Convert to array for chart
  return Object.entries(sectors).map(([name, value]) => ({
    name,
    value,
  }));
}

function calculateTopPerformers(portfolio: Portfolio | null): PerformerData[] {
  if (!portfolio?.positions?.length) return [];

  // Calculate return for each position
  const performers: PerformerData[] = portfolio.positions.map((position) => {
    const costBasis = Number(position.averageBuyPrice);
    const currentPrice = Number(position.stock.currentPrice);
    const returnPct =
      costBasis > 0 ? ((currentPrice - costBasis) / costBasis) * 100 : 0;

    return {
      symbol: position.stock.symbol,
      name: position.stock.name,
      return: parseFloat(returnPct.toFixed(2)),
    };
  });

  // Sort by return and get top 5
  return performers.sort((a, b) => b.return - a.return).slice(0, 5);
}

function calculateTradeActivity(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): TradeActivity[] {
  if (!transactions?.length) return [];

  // Group transactions by month and type
  const activity: Record<string, TradeActivity> = {};
  transactions.forEach((tx) => {
    const month = format(tx.timestamp, "MMM yyyy");
    if (!activity[month]) {
      activity[month] = { date: month, buy: 0, sell: 0, balance: 0 };
    }

    const amount = Number(tx.totalAmount);
    if (tx.type === "BUY") {
      activity[month].buy += amount;
      activity[month].balance -= amount;
    } else {
      activity[month].sell += amount;
      activity[month].balance += amount;
    }
  });

  // Convert to array for chart
  return Object.values(activity);
}

function calculateVolumeByDay(transactions: Transaction[]): VolumeData[] {
  if (!transactions?.length) return [];

  // Group transactions by day
  const volumeByDay: Record<string, VolumeData> = {};
  transactions.forEach((tx) => {
    const day = format(tx.timestamp, "yyyy-MM-dd");
    if (!volumeByDay[day]) {
      volumeByDay[day] = { date: day, volume: 0, value: 0 };
    }

    volumeByDay[day].volume += tx.quantity;
    volumeByDay[day].value += Number(tx.totalAmount);
  });

  // Convert to array and sort by date
  return Object.values(volumeByDay).sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );
}

function calculatePnLByStock(
  portfolio: Portfolio | null,
  transactions: Transaction[]
): StockPnL[] {
  if (!portfolio?.positions?.length) return [];

  // Calculate realized and unrealized P&L per stock
  const stockPnL: Record<string, StockPnL> = {};

  // First calculate realized P&L from transactions
  transactions.forEach((tx) => {
    const symbol = tx.stock.symbol;
    if (!stockPnL[symbol]) {
      stockPnL[symbol] = {
        symbol,
        name: tx.stock.name,
        profit: 0,
        loss: 0,
        unrealized: 0,
      };
    }

    // For sell transactions, calculate profit/loss
    if (tx.type === "SELL") {
      const profit = tx.profitLoss ? Number(tx.profitLoss) : 0;
      if (profit >= 0) {
        stockPnL[symbol].profit += profit;
      } else {
        stockPnL[symbol].loss += Math.abs(profit);
      }
    }
  });

  // Then add unrealized P&L from current positions
  portfolio.positions.forEach((position) => {
    const symbol = position.stock.symbol;
    if (!stockPnL[symbol]) {
      stockPnL[symbol] = {
        symbol,
        name: position.stock.name,
        profit: 0,
        loss: 0,
        unrealized: 0,
      };
    }

    const unrealizedPL = Number(position.profitLoss);
    stockPnL[symbol].unrealized += unrealizedPL;
  });

  // Convert to array for chart and get top 10 by absolute total P&L
  return Object.values(stockPnL)
    .map((stock) => ({
      ...stock,
      total: stock.profit - stock.loss + stock.unrealized,
    }))
    .sort((a, b) => Math.abs(b.total!) - Math.abs(a.total!))
    .slice(0, 10);
}

function generateMarketTrendsData(): MarketTrend[] {
  // This would typically use real market index data
  // For now, generate some random correlation data
  const stocks: MarketTrend[] = [];

  for (let i = 0; i < 20; i++) {
    const marketReturn = Math.random() * 20 - 10; // -10% to +10%
    // Create somewhat correlated returns, but with some variance
    const correlation = 0.7 + (Math.random() * 0.6 - 0.3); // 0.4 to 1.0
    const stockReturn = marketReturn * correlation + (Math.random() * 10 - 5);

    stocks.push({
      id: i,
      market: parseFloat(marketReturn.toFixed(2)),
      stock: parseFloat(stockReturn.toFixed(2)),
    });
  }

  return stocks;
}
