"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { EditIcon, Loader2, PlusCircle, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatLargeNumber } from "@/lib/utils";
import { StockEditDialog } from "./stock-edit-dialog";
import { StockDeleteDialog } from "./stock-delete-dialog";
import { toast } from "sonner";

export function AdminStockTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stockToEdit, setStockToEdit] = useState<Stock | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stockToDelete, setStockToDelete] = useState<Stock | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hasRelatedData, setHasRelatedData] = useState(false);

  const queryClient = useQueryClient();

  const { data: stocks, isLoading } = useQuery({
    queryKey: ["admin-stocks"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/stocks");
      return response.data as Stock[];
    },
  });

  const deleteStockMutation = useMutation({
    mutationFn: async ({
      stockId,
      force,
    }: {
      stockId: string;
      force: boolean;
    }) => {
      await axios.delete(`/api/stocks/${stockId}${force ? "?force=true" : ""}`);
    },
    onSuccess: () => {
      toast.success("Stock deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-stocks"] });
      setIsDeleteDialogOpen(false);
      setStockToDelete(null);
      setHasRelatedData(false);
    },
    onError: (error: any) => {
      console.error("Error deleting stock:", error);

      // Check if the error is due to related data
      if (error.response?.data?.hasRelatedData) {
        setHasRelatedData(true);
        setIsDeleteDialogOpen(true);
        toast.error(
          "This stock has related data. Use force delete to remove it."
        );
      } else {
        toast.error(
          "Failed to delete stock: " +
            (error.response?.data?.error || "Unknown error")
        );
        setIsDeleteDialogOpen(false);
      }
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

  const handleDelete = (stock: Stock) => {
    setStockToDelete(stock);
    deleteStockMutation.mutate({ stockId: stock.id, force: false });
  };

  const confirmDelete = (stock: Stock, forceDelete: boolean) => {
    deleteStockMutation.mutate({ stockId: stock.id, force: forceDelete });
  };

  const handleCreateNew = () => {
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
              <TableHead className="text-center w-[100px]">Actions</TableHead>
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
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(stock)}
                        className="items-center"
                      >
                        <EditIcon
                          size={14}
                          className="mr-1"
                        />
                        Edit
                      </Button>
                      <Button
                        className="items-center"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(stock)}
                      >
                        <Trash2
                          size={14}
                          className="mr-1"
                        />
                        Delete
                      </Button>
                    </div>
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

      {/* Dialog for deleting stocks */}
      {hasRelatedData && (
        <StockDeleteDialog
          stock={stockToDelete}
          open={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setHasRelatedData(false);
          }}
          onConfirm={confirmDelete}
          isDeleting={deleteStockMutation.isPending}
          hasRelatedData={true}
        />
      )}
    </div>
  );
}
