"use client";

import React from "react";
import { MarketTable } from "@/components/market/market-table";

const MarketPage = () => {
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Stock Market</h1>
      </div>
      <MarketTable />
    </div>
  );
};

export default MarketPage;
