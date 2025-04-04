import React from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TradeActivityItem } from "@/types/analytics";

interface TradeActivityChartProps {
  data: TradeActivityItem[];
  formatCurrency: (value: number) => string;
}

export function TradeActivityChart({
  data,
  formatCurrency,
}: TradeActivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No trade activity data available
      </div>
    );
  }

  return (
    <ResponsiveContainer
      width="100%"
      height={350}
    >
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          opacity={0.2}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          tickFormatter={(value) => formatCurrency(value)}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => formatCurrency(value)}
          tick={{ fontSize: 12 }}
        />
        <Tooltip formatter={(value: number) => [formatCurrency(value), ""]} />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="buy"
          name="Buy Orders"
          fill="#3b82f6"
          barSize={20}
        />
        <Bar
          yAxisId="left"
          dataKey="sell"
          name="Sell Orders"
          fill="#f97316"
          barSize={20}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="balance"
          name="Net Balance"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
