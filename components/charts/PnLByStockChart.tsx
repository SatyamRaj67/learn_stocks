import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  TooltipProps,
} from "recharts";
import { PnLItem } from "@/types/analytics";
import { ArrowUpIcon, ArrowDownIcon, DollarSignIcon } from "lucide-react";

interface PnLByStockChartProps {
  data: PnLItem[];
  formatCurrency: (value: number) => string;
}

// Custom tooltip component
interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
  label?: string;
  data: PnLItem[];
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

  const stockData = data.find((item) => item.symbol === label);
  if (!stockData) return null;

  const totalValue = stockData.total;
  const isPositive = totalValue >= 0;

  // Calculate realized P&L (profit + loss)
  const realizedPnL = stockData.profit + stockData.loss;

  return (
    <div className="custom-tooltip bg-background p-4 rounded-lg shadow-lg border border-muted-background min-w-[250px]">
      {/* Header with stock info */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-base font-bold">{stockData.symbol}</p>
          <p className="text-sm text-muted-foreground">{stockData.name}</p>
        </div>
        <div
          className={`flex items-center justify-center h-8 w-8 rounded-full ${isPositive ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}`}
        >
          {isPositive ? (
            <ArrowUpIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <ArrowDownIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
          )}
        </div>
      </div>

      {/* Total P&L */}
      <div className="mb-3">
        <span className="text-sm text-muted-foreground">Total P&L</span>
        <div
          className={`text-lg font-bold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
        >
          {formatCurrency(totalValue)}
        </div>
      </div>

      {/* P&L breakdown */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        {/* Realized P&L */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-muted-foreground">Realized P&L:</span>
          <span
            className={`text-sm font-medium ${realizedPnL >= 0 ? "text-green-500" : "text-red-500"}`}
          >
            {formatCurrency(realizedPnL)}
          </span>
        </div>

        {/* Realized profit */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-muted-foreground pl-4">Profit:</span>
          <span className="text-sm font-medium text-green-500">
            {formatCurrency(stockData.profit)}
          </span>
        </div>

        {/* Realized loss */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-muted-foreground pl-4">Loss:</span>
          <span className="text-sm font-medium text-red-500">
            {formatCurrency(stockData.loss)}
          </span>
        </div>

        {/* Unrealized P&L */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <span className="text-sm text-muted-foreground">Unrealized P&L:</span>
          <span
            className={`text-sm font-medium ${stockData.unrealized >= 0 ? "text-blue-500" : "text-orange-500"}`}
          >
            {formatCurrency(stockData.unrealized)}
          </span>
        </div>
      </div>

      {/* Visual meter for total P&L */}
      <div className="mt-3 pt-2">
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${isPositive ? "bg-green-500" : "bg-red-500"}`}
            style={{
              width: `${Math.min((Math.abs(totalValue) / 10000) * 100, 100)}%`,
              transition: "width 0.5s ease-out",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export function PnLByStockChart({
  data,
  formatCurrency,
}: PnLByStockChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No profit/loss data available
      </div>
    );
  }

  // Sort data by total P&L
  const sortedData = [...data].sort((a, b) => b.total - a.total);

  return (
    <ResponsiveContainer
      width="100%"
      height={300}
    >
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        barSize={20}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          opacity={0.2}
          horizontal={true}
          vertical={false}
        />
        <XAxis
          type="number"
          tickFormatter={(value) => formatCurrency(value)}
        />
        <YAxis
          type="category"
          dataKey="symbol"
          tick={{ fontSize: 12 }}
          width={60}
        />
        <Tooltip
          content={
            <CustomTooltip
              data={sortedData}
              formatCurrency={formatCurrency}
            />
          }
          cursor={{ fill: "rgba(180, 180, 180, 0.1)" }}
        />
        <Bar
          dataKey="total"
          animationDuration={1500}
          animationEasing="ease-out"
        >
          {sortedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.total >= 0
                  ? entry.total > 5000
                    ? "#059669"
                    : "#10b981"
                  : entry.total < -5000
                    ? "#dc2626"
                    : "#ef4444"
              }
              radius={entry.total >= 0 ? 4 : 0}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
