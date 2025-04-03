"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { PieChart } from "lucide-react";

interface PortfolioBreakdownProps {
  positions: Position[];
}

export function PortfolioBreakdown({ positions }: PortfolioBreakdownProps) {
  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="mr-2 h-5 w-5" />
            Portfolio Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48">
            <p className="text-muted-foreground">
              No positions in your portfolio.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Start investing to see your holdings here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total value for percentage calculation
  const totalValue = positions.reduce((acc, pos) => acc + pos.currentValue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieChart className="mr-2 h-5 w-5" />
          Portfolio Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {positions.map((position) => {
            const percentOfPortfolio =
              (position.currentValue / totalValue) * 100;
            const profitLossPercent =
              (position.profitLoss /
                (position.currentValue - position.profitLoss)) *
              100;
            const isProfit = position.profitLoss >= 0;

            return (
              <div
                key={position.id}
                className="flex flex-col"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{position.stock.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {position.stock.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(position.currentValue)}
                    </div>
                    <div
                      className={`text-sm ${isProfit ? "text-green-600" : "text-red-600"}`}
                    >
                      {isProfit ? "+" : ""}
                      {formatCurrency(position.profitLoss)} (
                      {formatPercentage(profitLossPercent)})
                    </div>
                  </div>
                </div>

                <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${percentOfPortfolio}%` }}
                  ></div>
                </div>

                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>
                    {position.quantity} shares @{" "}
                    {formatCurrency(position.stock.currentPrice)}
                  </span>
                  <span>{percentOfPortfolio.toFixed(1)}% of portfolio</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
