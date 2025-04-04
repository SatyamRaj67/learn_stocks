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
import { PerformerItem } from "@/types/analytics";
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";

interface TopPerformersChartProps {
  data: PerformerItem[];
  formatPercent: (value: number) => string;
}

// Custom tooltip component
interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
  label?: string;
  data: PerformerItem[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
  data,
}: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const stockData = data.find((item) => item.symbol === label);
  if (!stockData) return null;

  const returnValue = payload[0].value;
  const isPositive = returnValue > 0;
  const isNeutral = returnValue === 0;

  // Determine performance category
  let performanceCategory = "Neutral";
  let performanceColor = "text-gray-500";

  if (returnValue > 10) {
    performanceCategory = "Outstanding";
    performanceColor = "text-emerald-500";
  } else if (returnValue > 5) {
    performanceCategory = "Strong";
    performanceColor = "text-green-500";
  } else if (returnValue > 0) {
    performanceCategory = "Positive";
    performanceColor = "text-lime-500";
  } else if (returnValue < -10) {
    performanceCategory = "Poor";
    performanceColor = "text-red-600";
  } else if (returnValue < 0) {
    performanceCategory = "Negative";
    performanceColor = "text-red-500";
  }

  return (
    <div className="custom-tooltip bg-background p-4 rounded-lg shadow-lg border border-muted-foreground">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <p className="text-base font-bold">{stockData.symbol}</p>
          <p className="text-sm text-muted-foreground">{stockData.name}</p>
        </div>
        <div className="ml-auto">
          {isPositive ? (
            <TrendingUpIcon
              size={20}
              className="text-green-500"
            />
          ) : isNeutral ? (
            <MinusIcon
              size={20}
              className="text-gray-500"
            />
          ) : (
            <TrendingDownIcon
              size={20}
              className="text-red-500"
            />
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Performance:</span>
          <span className={`text-sm font-semibold ${performanceColor}`}>
            {performanceCategory}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-muted-foreground">Return:</span>
          <span
            className={`text-lg font-bold ${isPositive ? "text-green-500" : isNeutral ? "text-gray-500" : "text-red-500"}`}
          >
            {isPositive ? "+" : ""}
            {returnValue.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export function TopPerformersChart({
  data,
  formatPercent,
}: TopPerformersChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No performance data available
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.return - a.return);

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
          tickFormatter={(value) => `${value}%`}
        />
        <YAxis
          type="category"
          dataKey="symbol"
          tick={{ fontSize: 12 }}
          width={60}
        />
        <Tooltip
          content={<CustomTooltip data={sortedData} />}
          cursor={{ fill: "rgba(180, 180, 180, 0.1)" }}
        />
        <Bar
          dataKey="return"
          animationDuration={1500}
          animationEasing="ease-out"
        >
          {sortedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.return > 0
                  ? entry.return > 5
                    ? "#10b981"
                    : "#4ade80"
                  : entry.return < -5
                    ? "#ef4444"
                    : "#f87171"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
