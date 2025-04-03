"use client";

import { useQuery } from "@tanstack/react-query";
import { SectionCards } from "@/components/home/CardsSection";
import { ChartAreaInteractive } from "@/components/layout/chart-area-interactive";
import { PortfolioBreakdown } from "@/components/dashboard/portfolio-breakdown";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Define a client-side function to fetch the data
const fetchDashboardData = async () => {
  const response = await fetch("/api/dashboard");
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return response.json();
};

const DashboardPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: fetchDashboardData,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold">Failed to load dashboard data</h2>
          <p className="text-muted-foreground">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  const { user, portfolio, recentTransactions } = data;

  // Calculate total portfolio value from positions
  const calculatedPortfolioValue =
    portfolio?.positions?.reduce(
      (total: number, position: Position) =>
        total + Number(position.currentValue),
      0
    ) || 0;

  // Use calculated value instead of stored value
  const portfolioValue = calculatedPortfolioValue;

  // Recalculate growth rate based on actual portfolio value
  let growthRate = 0;
  if (portfolioValue > 0) {
    growthRate = (user.totalProfit / portfolioValue) * 100;
  }

  const cardData = [
    {
      description: "Portfolio Value",
      value: formatCurrency(portfolioValue),
      badge: formatPercentage(growthRate),
      footerTitle:
        growthRate >= 0
          ? "Your investments are growing"
          : "Your investments are declining",
      footerDescription: "Based on current market performance",
      positive: growthRate >= 0,
    },
    {
      description: "Available Cash",
      value: formatCurrency(user.balance),
      badge: "",
      footerTitle: "Ready to invest",
      footerDescription: "Current available balance",
      positive: true,
    },
    {
      description: "Total Gains / Loss",
      value: formatCurrency(user.totalProfit),
      badge: formatPercentage(growthRate),
      footerTitle: user.totalProfit >= 0 ? "Profit" : "Loss",
      footerDescription:
        user.totalProfit >= 0
          ? "Keep up the good work!"
          : "Analyze your positions",
      positive: user.totalProfit >= 0,
    },
    {
      description: "Growth Rate",
      value: formatPercentage(growthRate),
      badge: "",
      footerTitle:
        growthRate >= 0 ? "Positive trajectory" : "Needs improvement",
      footerDescription: "Overall portfolio performance",
      positive: growthRate >= 0,
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards cards={cardData} />

          <div className="px-4 lg:px-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartAreaInteractive />
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <PortfolioBreakdown positions={portfolio?.positions || []} />
              <RecentTransactions transactions={recentTransactions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
