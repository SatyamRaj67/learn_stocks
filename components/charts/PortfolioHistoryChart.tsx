import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react";
import { PortfolioHistoryItem } from "@/types/analytics";

interface PortfolioHistoryChartProps {
  data: PortfolioHistoryItem[];
  formatCurrency: (value: number) => string;
}

// Custom tooltip component
interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
  label?: string;
  data: PortfolioHistoryItem[];
  formatCurrency: (value: number) => string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  data,
  formatCurrency,
}: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const currentValue = payload[0].value;
  const currentIndex = data.findIndex((item) => item.date === label);
  const previousValue =
    currentIndex > 0 ? data[currentIndex - 1].value : currentValue;

  // Calculate daily change
  const absoluteChange = currentValue - previousValue;
  const percentChange =
    previousValue !== 0 ? (absoluteChange / previousValue) * 100 : 0;
  const isPositive = absoluteChange >= 0;

  return (
    <div className="custom-tooltip bg-background p-4 rounded-lg shadow-lg border border-muted-background">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {isPositive ? (
          <TrendingUpIcon
            size={16}
            className="text-green-500"
          />
        ) : (
          <TrendingDownIcon
            size={16}
            className="text-red-500"
          />
        )}
      </div>
      <p className="text-xl font-bold mb-1">{formatCurrency(currentValue)}</p>
      <div className="flex items-center">
        <span
          className={`text-xs font-medium flex items-center ${isPositive ? "text-green-500" : "text-red-500"}`}
        >
          {isPositive ? (
            <ArrowUpIcon className="h-3 w-3 mr-1" />
          ) : (
            <ArrowDownIcon className="h-3 w-3 mr-1" />
          )}
          {absoluteChange !== 0
            ? formatCurrency(Math.abs(absoluteChange))
            : "$0"}
        </span>
        <span
          className={`text-xs font-medium ml-2 ${isPositive ? "text-green-500" : "text-red-500"}`}
        >
          ({percentChange.toFixed(2)}%)
        </span>
        {currentIndex > 0 && (
          <span className="text-xs text-muted-foreground ml-2">
            vs previous day
          </span>
        )}
      </div>
    </div>
  );
};

export function PortfolioHistoryChart({
  data,
  formatCurrency,
}: PortfolioHistoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No portfolio history data available
      </div>
    );
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
            <span
              className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"} flex items-center`}
            >
              {isPositive ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(percentChange).toFixed(2)}%
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              since {data[0].date}
            </span>
          </div>
        </div>
      </div>
      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            opacity={0.2}
          />
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
            content={
              <CustomTooltip
                data={data}
                formatCurrency={formatCurrency}
              />
            }
            cursor={{
              stroke: "#6366f1",
              strokeWidth: 1,
              strokeDasharray: "3 3",
            }}
          />
          <defs>
            <linearGradient
              id="colorValue"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
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
            activeDot={{
              r: 6,
              fill: isPositive ? "#10b981" : "#ef4444",
              stroke: "white",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
