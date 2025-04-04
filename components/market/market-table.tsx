"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, ArrowDownIcon, Search, Loader2 } from "lucide-react";
import {
  calculatePriceChange,
  formatCurrency,
  formatLargeNumber,
} from "@/lib/utils";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useStockTrade } from "@/hooks/useStockTrade";

export function MarketTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { data: session } = useSession();

  // Use our custom hook for trade operations
  const { buyStock, sellStock, processingStock } = useStockTrade();

  const { data: stocks, isLoading } = useQuery({
    queryKey: ["market-stocks"],
    queryFn: async () => {
      const response = await axios.get("/api/stocks");
      return response.data as Stock[];
    },
  });

  const handleQuantityChange = (stockId: string, value: string) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity >= 0) {
      setQuantities((prev) => ({
        ...prev,
        [stockId]: quantity,
      }));
    }
  };

  const handleBuy = (stockId: string) => {
    const quantity = quantities[stockId] || 0;
    if (quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    buyStock(stockId, quantity, session?.user?.id);

    // Clear the quantity for the processed stock after completion
    if (processingStock === null) {
      setQuantities((prev) => {
        const updated = { ...prev };
        delete updated[stockId];
        return updated;
      });
    }
  };

  const handleSell = (stockId: string) => {
    const quantity = quantities[stockId] || 0;
    if (quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    sellStock(stockId, quantity, session?.user?.id);

    // Clear the quantity for the processed stock after completion
    if (processingStock === null) {
      setQuantities((prev) => {
        const updated = { ...prev };
        delete updated[stockId];
        return updated;
      });
    }
  };

  const activeStocks = stocks?.filter((stock) => stock.isActive) || [];
  const filteredStocks = activeStocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stock.sector &&
        stock.sector.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          placeholder="Search by symbol, name, or sector..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption className="p-2">
            List of available stocks in the market
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Market Cap</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6"
                >
                  Loading stocks...
                </TableCell>
              </TableRow>
            ) : filteredStocks && filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => {
                const priceChange = calculatePriceChange(
                  stock.currentPrice,
                  stock.previousClose
                );
                const priceChangeFormatted = Math.abs(priceChange).toFixed(2);
                const isPositiveChange = priceChange >= 0;
                const isProcessing = processingStock === stock.id;

                return (
                  <TableRow key={stock.id}>
                    <TableCell className="font-medium">
                      {stock.symbol}
                    </TableCell>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell>{formatCurrency(stock.currentPrice)}</TableCell>
                    <TableCell>
                      <div
                        className={`flex items-center ${isPositiveChange ? "text-green-600" : "text-red-600"}`}
                      >
                        {isPositiveChange ? (
                          <ArrowUpIcon
                            className="mr-1"
                            size={16}
                          />
                        ) : (
                          <ArrowDownIcon
                            className="mr-1"
                            size={16}
                          />
                        )}
                        {priceChangeFormatted}%
                      </div>
                    </TableCell>
                    <TableCell>{formatLargeNumber(stock.volume)}</TableCell>
                    <TableCell>{formatLargeNumber(stock.marketCap)}</TableCell>
                    <TableCell>{stock.sector || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Qty"
                          className="w-16 h-8"
                          onChange={(e) =>
                            handleQuantityChange(stock.id, e.target.value)
                          }
                          disabled={isProcessing}
                        />

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                          onClick={() => handleBuy(stock.id)}
                          disabled={
                            isProcessing || stock.isFrozen || !stock.isActive
                          }
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Buy"
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                          onClick={() => handleSell(stock.id)}
                          disabled={
                            isProcessing || stock.isFrozen || !stock.isActive
                          }
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Sell"
                          )}
                        </Button>
                      </div>

                      {(stock.isFrozen || !stock.isActive) && (
                        <div className="mt-1">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              stock.isFrozen
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {stock.isFrozen ? "Frozen" : "Inactive"}
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6"
                >
                  No stocks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
