"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Define types for our stock data
type StockData = {
  stock: {
    id: string;
    symbol: string;
    name: string;
    currentPrice: number;
    sector?: string;
  };
  chartData: {
    date: string;
    price: number;
  }[];
  priceChange: number;
  percentChange: number;
};

const HeroSection = () => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setIsLoading(true);
        // Replace with the specific stock symbol you want, e.g., "AAPL"
        const response = await fetch("/api/stocks/history?symbol=AAPL");

        if (!response.ok) {
          throw new Error("Failed to fetch stock data");
        }

        const data = await response.json();
        setStockData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching stock data:", err);
        setError("Failed to load stock data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, []);

  // Use default data if we couldn't fetch from the API
  const displayData = stockData || {
    stock: {
      symbol: "AAPL",
      name: "Apple Inc.",
      currentPrice: 198.45,
    },
    chartData: Array(30)
      .fill(0)
      .map((_, i) => ({
        date: `Day ${i + 1}`,
        price: 180 + Math.random() * 30,
      })),
    priceChange: 2.34,
    percentChange: 1.2,
  };

  const { stock, chartData, priceChange, percentChange } = displayData;
  const isPriceUp = priceChange >= 0;

  return (
    <section className="w-full px-4 py-24 md:py-32 bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <div className="container mx-auto flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-6">
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
            New Features
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Smart investing starts with better insights
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            Discover, analyze, and invest in stocks with confidence using our
            powerful tools and real-time data.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Start investing now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-foreground border-white hover:bg-background/10"
            >
              View demo
            </Button>
          </div>
        </div>
        <div className="flex-1 hidden md:block">
          <div className="relative h-96 w-full bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 rounded-lg p-1">
            <div className="absolute inset-0 bg-no-repeat bg-cover opacity-30"></div>
            <div className="relative h-full rounded-md bg-slate-800/70 backdrop-blur p-6 border border-slate-700">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse text-slate-400">
                    Loading stock data...
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-red-400">{error}</div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-bold text-lg">{stock.symbol}</h3>
                      <p className="text-sm text-slate-300">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl">${displayData.stock.currentPrice}</p>
                      <p
                        className={`${isPriceUp ? "text-emerald-400" : "text-red-400"} text-sm`}
                      >
                        {isPriceUp ? "+" : ""}
                        {priceChange.toFixed(2)} ({percentChange.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                  <div className="h-52 w-full bg-gradient-to-t from-emerald-500/10 to-transparent rounded relative">
                    {/* Recharts stock chart */}
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <AreaChart
                        data={chartData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorPrice"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={isPriceUp ? "#10b981" : "#ef4444"}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor={isPriceUp ? "#10b981" : "#ef4444"}
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          domain={["dataMin - 5", "dataMax + 5"]}
                          hide={true}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            borderColor: "#475569",
                            borderRadius: "0.375rem",
                          }}
                          labelStyle={{ color: "#f8fafc" }}
                          itemStyle={{ color: "#f8fafc" }}
                          formatter={(value) => [
                            `$${typeof value === "number" ? value.toFixed(2) : value}`,
                            "Price",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke={isPriceUp ? "#10b981" : "#ef4444"}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorPrice)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-emerald-500/20 to-transparent"></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
