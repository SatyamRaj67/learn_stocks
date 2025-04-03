"use client";

import React from "react";
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
import { formatCurrency } from "@/lib/utils";
import { TransactionFilters } from "./transaction-filters";

// Define transaction type based on your Prisma schema
type Transaction = {
  id: string;
  type: "BUY" | "SELL";
  status: "PENDING" | "COMPLETED" | "FAILED";
  quantity: number;
  price: number;
  totalAmount: number;
  timestamp: string;
  stock: {
    symbol: string;
    name: string;
  };
};

export function TransactionTable() {
  const [filters, setFilters] = React.useState({
    dateRange: "all",
    type: "all",
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const response = await axios.get("/api/transactions", {
        params: filters,
      });
      return response.data as Transaction[];
    },
  });

  return (
    <div className="flex flex-col gap-5 p-8 pb-10">
      <h1 className="text-2xl font-bold">Transaction History</h1>

      <TransactionFilters
        filters={filters}
        setFilters={setFilters}
      />

      <div className="rounded-md border">
        <Table>
          <TableCaption className="p-4">
            A list of your recent transactions
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Stock Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-4"
                >
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : transactions && transactions.length > 0 ? (
              transactions.map((transaction, i) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-center">{i + 1}</TableCell>
                  <TableCell>
                    {new Date(transaction.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${transaction.type === "BUY" ? "text-green-600" : "text-red-600"}`}
                    >
                      {transaction.type}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.stock.symbol}</TableCell>
                  <TableCell>{transaction.stock.name}</TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell>{formatCurrency(transaction.price)}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(transaction.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-4"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
