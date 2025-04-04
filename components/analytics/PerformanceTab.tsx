import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsData } from "@/types/analytics";
import { MarketCorrelationChart } from "@/components/charts/MarketCorrelationChart";
import { StockPnLDetailedChart } from "@/components/charts/StockPnLDetailedChart";

interface PerformanceTabProps {
  data: AnalyticsData | undefined;
  isLoading: boolean;
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
}

export function PerformanceTab({
  data,
  isLoading,
  formatCurrency,
  formatPercent,
}: PerformanceTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Key performance indicators for your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[100px] w-full" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Sharpe Ratio", value: "1.42" },
                  { name: "Alpha", value: "2.18%" },
                  { name: "Beta", value: "0.85" },
                  { name: "Max Drawdown", value: "-12.4%" },
                  { name: "Volatility", value: "15.2%" },
                  { name: "R-Squared", value: "0.78" },
                  { name: "Sortino Ratio", value: "1.64" },
                  { name: "Treynor Ratio", value: "8.2%" },
                ].map((metric) => (
                  <div
                    key={metric.name}
                    className="bg-muted/50 p-4 rounded-lg text-center"
                  >
                    <div className="text-sm font-medium text-muted-foreground">
                      {metric.name}
                    </div>
                    <div className="text-2xl font-bold mt-1">
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Correlation Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Market Correlation</CardTitle>
            <CardDescription>
              How your stocks correlate with broader market movements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : data?.marketTrends ? (
              <MarketCorrelationChart data={data.marketTrends} />
            ) : null}
          </CardContent>
        </Card>

        {/* Stock P&L Detailed Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Profit & Loss</CardTitle>
            <CardDescription>
              Breakdown of realized and unrealized gains and losses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : data?.pnlByStock ? (
              <StockPnLDetailedChart
                data={data.pnlByStock}
                formatCurrency={formatCurrency}
              />
            ) : null}
          </CardContent>
        </Card>

        {/* Benchmark Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Benchmark Comparison</CardTitle>
            <CardDescription>
              Performance relative to market indices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[150px] w-full" />
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  {[
                    {
                      name: "Your Portfolio",
                      value: 18.7,
                      color: "bg-blue-600",
                    },
                    { name: "S&P 500", value: 14.2, color: "bg-green-600" },
                    { name: "NASDAQ", value: 15.8, color: "bg-amber-600" },
                    { name: "Dow Jones", value: 12.5, color: "bg-purple-600" },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span
                          className={`text-sm ${item.value >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {item.value > 0 ? "+" : ""}
                          {item.value}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full`}
                          style={{
                            width: `${Math.min(Math.abs(item.value) * 3, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Note: This shows YTD performance. Past performance is not
                  indicative of future results.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
