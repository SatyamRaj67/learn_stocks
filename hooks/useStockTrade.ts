import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useState } from "react";

interface TradeOptions {
  stockId: string;
  quantity: number;
  userId?: string;
}

export function useStockTrade() {
  const [processingStock, setProcessingStock] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Buy mutation
  const buyMutation = useMutation({
    mutationFn: async ({ stockId, quantity, userId }: TradeOptions) => {
      return axios.post("/api/stocks/buy", {
        userId,
        stockId,
        quantity,
      });
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["user-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["user-balance"] });
      toast.success("Stock purchased successfully");
      setProcessingStock(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to buy stock");
      setProcessingStock(null);
    },
  });

  // Sell mutation
  const sellMutation = useMutation({
    mutationFn: async ({ stockId, quantity, userId }: TradeOptions) => {
      return axios.post("/api/stocks/sell", {
        userId,
        stockId,
        quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["user-balance"] });
      toast.success("Stock sold successfully");
      setProcessingStock(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to sell stock");
      setProcessingStock(null);
    },
  });

  // Helper functions
  const buyStock = (stockId: string, quantity: number, userId?: string) => {
    setProcessingStock(stockId);
    buyMutation.mutate({ stockId, quantity, userId });
  };

  const sellStock = (stockId: string, quantity: number, userId?: string) => {
    setProcessingStock(stockId);
    sellMutation.mutate({ stockId, quantity, userId });
  };

  return {
    buyStock,
    sellStock,
    processingStock,
    isBuying: buyMutation.isPending,
    isSelling: sellMutation.isPending,
  };
}