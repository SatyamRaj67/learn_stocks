"use client";

import React, { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

// Fetch analytics data based on selected time range
const fetchAnalyticsData = async (timeRange) => {
  const response = await axios.get(`/api/analytics?timeRange=${timeRange}`);
  return response.data;
};

const timeRangeOptions = [
  { value: "1w", label: "1 Week" },
  { value: "1m", label: "1 Month" },
  { value: "3m", label: "3 Months" },
  { value: "6m", label: "6 Months" },
  { value: "1y", label: "1 Year" },
  { value: "all", label: "All Time" },
];

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FABF63",
  "#FF7300",
  "#8DD1E1",
  "#A4DE6C",
  "#D0ED57",
  "#FFC658",
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("1m");
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["analyticsData", timeRange],
    queryFn: () => fetchAnalyticsData(timeRange),
    refetchOnWindowFocus: false,
  });

  // Helper function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Helper function to format percentage
  const formatPercent = (value) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  if (isError) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <CardTitle className="text-destructive mb-2">Error</CardTitle>
          <CardDescription>
            There was an error loading your analytics data. Please try again later.
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Analytics</h1>
          <p className="text-muted-foreground">
            Track your investment performance and insights
          </p>
        </div>
        <div className="w-full sm:w-48">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Time Range" />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsListWrapper>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsListWrapper>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Portfolio Value Chart */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>
                  Historical portfolio value over {timeRangeOptions.find(o => o.value === timeRange)?.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <PortfolioHistoryChart data={data?.portfolioHistory} formatCurrency={formatCurrency} />
                )}
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Best performing assets in your portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <TopPerformersChart data={data?.topPerformers} formatPercent={formatPercent} />
                )}
              </CardContent>
            </Card>

            {/* PnL by Stock */}
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss by Stock</CardTitle>
                <CardDescription>Realized and unrealized gains/losses</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <PnLByStockChart data={data?.pnlByStock} formatCurrency={formatCurrency} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sector Allocation */}
            <Card>
              <CardHeader>
                <CardTitle>Sector Allocation</CardTitle>
                <CardDescription>Distribution of your investments by sector</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <SectorAllocationChart data={data?.sectorAllocation} formatCurrency={formatCurrency} />
                )}
              </CardContent>
            </Card>

            {/* Market Correlation */}
            <Card>
              <CardHeader>
                <CardTitle>Market Correlation</CardTitle>
                <CardDescription>How your stocks correlate with the market</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <MarketCorrelationChart data={data?.marketTrends} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Stock P&L Detailed */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Performance Breakdown</CardTitle>
                <CardDescription>Detailed profit and loss for each position</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : (
                  <StockPnLDetailedChart data={data?.pnlByStock} formatCurrency={formatCurrency} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trade Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Trade Activity</CardTitle>
                <CardDescription>Buy and sell transactions over time</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <TradeActivityChart data={data?.tradeActivity} formatCurrency={formatCurrency} />
                )}
              </CardContent>
            </Card>

            {/* Volume By Day */}
            <Card>
              <CardHeader>
                <CardTitle>Trading Volume</CardTitle>
                <CardDescription>Daily trading volume and value</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <VolumeByDayChart data={data?.volumeByDay} formatCurrency={formatCurrency} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Styled TabsList wrapper for better mobile experience
function TabsListWrapper({ children} : { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto pb-2">
      <TabsList className="w-full sm:w-auto inline-flex min-w-max h-10">
        {children}
      </TabsList>
    </div>
  );
}

// Chart Components
function PortfolioHistoryChart({ data, formatCurrency }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No portfolio history data available</div>;
  }

  // Calculate percent change from first to last data point
  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const percentChange = ((lastValue - firstValue) / firstValue) * 100;
  const isPositive = percentChange >= 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        <div>
          <h4 className="text-xl font-semibold">{formatCurrency(lastValue)}</h4>
          <div className="flex items-center">
            <span className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"} flex items-center`}>
              {isPositive ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
              {Math.abs(percentChange).toFixed(2)}%
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              since {data[0].date}
            </span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(value), "Portfolio Value"]}
          />
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isPositive ? "#10b981" : "#ef4444"}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={isPositive ? "#10b981" : "#ef4444"}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            fillOpacity={1}
            fill="url(#colorValue)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TopPerformersChart({ data, formatPercent }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No performer data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        barSize={20}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
        <XAxis
          type="number"
          tickFormatter={(value) => formatPercent(value)}
          domain={["dataMin", "dataMax"]}
        />
        <YAxis
          type="category"
          dataKey="symbol"
          tick={{ fontSize: 12 }}
          width={60}
        />
        <Tooltip
          formatter={(value) => [formatPercent(value), "Return"]}
          labelFormatter={(label) => data.find(item => item.symbol === label)?.name || label}
        />
        <Bar dataKey="return">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.return >= 0 ? "#10b981" : "#ef4444"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function PnLByStockChart({ data, formatCurrency }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No profit/loss data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        barSize={20}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
        <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
        <YAxis
          type="category"
          dataKey="symbol"
          tick={{ fontSize: 12 }}
          width={60}
        />
        <Tooltip
          formatter={(value) => [formatCurrency(value), "Total P&L"]}
          labelFormatter={(label) => data.find(item => item.symbol === label)?.name || label}
        />
        <Bar dataKey="total">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.total >= 0 ? "#10b981" : "#ef4444"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function SectorAllocationChart({ data, formatCurrency }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No sector allocation data available</div>;
  }

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={60}
          paddingAngle={2}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [
            `${formatCurrency(value)} (${((value / total) * 100).toFixed(1)}%)`,
            "Allocation",
          ]}
        />
        <Legend layout="vertical" verticalAlign="middle" align="right" />
      </PieChart>
    </ResponsiveContainer>
  );
}

function MarketCorrelationChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No correlation data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis
          type="number"
          dataKey="market"
          name="Market Return"
          unit="%"
          domain={["dataMin", "dataMax"]}
        />
        <YAxis
          type="number"
          dataKey="stock"
          name="Stock Return"
          unit="%"
          domain={["dataMin", "dataMax"]}
        />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Scatter name="Stocks" data={data} fill="#8884d8">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.stock >= 0 ? "#10b981" : "#ef4444"}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function StockPnLDetailedChart({ data, formatCurrency }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No profit/loss data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="symbol" />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip formatter={(value) => [formatCurrency(value)]} />
        <Legend />
        <Bar dataKey="profit" name="Realized Profit" fill="#10b981" />
        <Bar dataKey="loss" name="Realized Loss" fill="#ef4444" />
        <Bar dataKey="unrealized" name="Unrealized P&L">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.unrealized >= 0 ? "#22c55e" : "#f87171"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function TradeActivityChart({ data, formatCurrency }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No trade activity data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip formatter={(value) => [formatCurrency(value)]} />
        <Legend />
        <Bar dataKey="buy" name="Buy" fill="#3b82f6" />
        <Bar dataKey="sell" name="Sell" fill="#10b981" />
        <Line
          type="monotone"
          dataKey="balance"
          name="Net Flow"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function VolumeByDayChart({ data, formatCurrency }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No volume data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="date" />
        <YAxis
          yAxisId="left"
          tickFormatter={(value) => value}
          orientation="left"
          stroke="#8884d8"
        />
        <YAxis
          yAxisId="right"
          tickFormatter={(value) => formatCurrency(value)}
          orientation="right"
          stroke="#82ca9d"
        />
        <Tooltip
          formatter={(value, name) =>
            name === "volume" ? [value, "Shares"] : [formatCurrency(value), "Value"]
          }
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="volume"
          name="Volume (Shares)"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="value"
          name="Value"
          stroke="#82ca9d"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}