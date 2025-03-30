import React from "react";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Button } from "../ui/button";

const stocks = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: "$198.45",
    change: "+1.2%",
    color: "text-emerald-500",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: "$402.78",
    change: "+0.7%",
    color: "text-emerald-500",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: "$146.95",
    change: "-0.3%",
    color: "text-red-500",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: "$182.30",
    change: "+2.1%",
    color: "text-emerald-500",
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: "$175.21",
    change: "-1.5%",
    color: "text-red-500",
  },
  {
    symbol: "META",
    name: "Meta Platforms",
    price: "$485.90",
    change: "+0.8%",
    color: "text-emerald-500",
  },
];

const MarketSection = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Market Snapshot</h2>
          <Button variant="outline">View all markets</Button>
        </div>

        <Tabs
          defaultValue="trending"
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
            <TabsTrigger value="losers">Top Losers</TabsTrigger>
            <TabsTrigger value="watchlist">Your Watchlist</TabsTrigger>
          </TabsList>

          <TabsContent
            value="trending"
            className="space-y-0"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map((stock, i) => (
                <Card
                  key={i}
                  className="border-none shadow-sm"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">{stock.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {stock.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{stock.price}</p>
                        <p className={stock.color}>{stock.change}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other tabs would have similar content */}
          <TabsContent value="gainers">
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Top gaining stocks would appear here
            </div>
          </TabsContent>
          <TabsContent value="losers">
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Top losing stocks would appear here
            </div>
          </TabsContent>
          <TabsContent value="watchlist">
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Your watchlist would appear here
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default MarketSection;
