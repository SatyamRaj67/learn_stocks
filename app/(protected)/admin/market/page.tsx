"use client";

import React from "react";
import { AdminStockTable } from "@/components/admin/stock-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AdminMarketPage = () => {
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Market Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stocks</CardTitle>
          <CardDescription>
            Manage all stocks in the system. Click on edit to update stock
            details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminStockTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMarketPage;
