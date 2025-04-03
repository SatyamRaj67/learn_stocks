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
import { Button } from "@/components/ui/button";
import { EditIcon, Loader2, PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatLargeNumber } from "@/lib/utils";
import { StockEditDialog } from "./stock-edit-dialog";

export function AdminStockTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stockToEdit, setStockToEdit] = useState<Stock | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: stocks, isLoading } = useQuery({
    queryKey: ["admin-stocks"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/stocks");
      return response.data as Stock[];
    },
  });

  // Filter stocks based on search query
  const filteredStocks = stocks?.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stock.sector &&
        stock.sector.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (stock: Stock) => {
    setStockToEdit(stock);
    setIsDialogOpen(true);
  };

  const handleCreateNew = () => {
    // Create an empty stock object for the form
    setStockToEdit({
      id: "",
      symbol: "",
      name: "",
      sector: "",
      currentPrice: 0,
      volume: 0,
      marketCap: 0,
      isActive: true,
      isFrozen: false,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setStockToEdit(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center relative w-64">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search stocks..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          onClick={handleCreateNew}
          className="flex items-center gap-2"
        >
          <PlusCircle size={16} />
          <span>Add Stock</span>
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableCaption>A list of all stocks in the system</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Market Cap</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center w-[2em]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6"
                >
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span>Loading stocks...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStocks?.length ? (
              filteredStocks.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell className="font-medium">{stock.symbol}</TableCell>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell>{formatCurrency(stock.currentPrice)}</TableCell>
                  <TableCell>{formatLargeNumber(stock.volume)}</TableCell>
                  <TableCell>
                    {formatLargeNumber(stock.marketCap || 0)}
                  </TableCell>
                  <TableCell>{stock.sector || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {!stock.isActive && (
                        <Badge
                          variant="outline"
                          className="bg-red-700"
                        >
                          Inactive
                        </Badge>
                      )}
                      {stock.isFrozen && (
                        <Badge
                          variant="outline"
                          className="bg-blue-800 text-blue-100"
                        >
                          Frozen
                        </Badge>
                      )}
                      {stock.isActive && !stock.isFrozen && (
                        <Badge
                          variant="outline"
                          className="bg-green-800 text-green-100"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(stock)}
                      className="right-0 items-center"
                    >
                      <EditIcon size={14} />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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

      {/* Dialog for editing stocks */}
      <StockEditDialog
        stock={stockToEdit}
        open={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
