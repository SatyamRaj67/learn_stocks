"use client";

import React, { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

// Import types
import { AnalyticsData, TimeRangeOption } from "@/types/analytics";

// Import tab content components
import { OverviewTab } from "@/components/analytics/OverviewTab";
import { AllocationTab } from "@/components/analytics/AllocationTab";
import { PerformanceTab } from "@/components/analytics/PerformanceTab";
import { ActivityTab } from "@/components/analytics/ActivityTab";

import { formatCurrency, formatPercentage } from "@/lib/utils";

const timeRangeOptions: TimeRangeOption[] = [
  { value: "1w", label: "1 Week" },
  { value: "1m", label: "1 Month" },
  { value: "3m", label: "3 Months" },
  { value: "6m", label: "6 Months" },
  { value: "1y", label: "1 Year" },
  { value: "all", label: "All Time" },
];

// Fetch analytics data based on selected time range
const fetchAnalyticsData = async (
  timeRange: string
): Promise<AnalyticsData> => {
  const response = await axios.get(`/api/analytics?timeRange=${timeRange}`);
  return response.data;
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>("1m");
  const [activeTab, setActiveTab] = useState<string>("overview");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["analyticsData", timeRange],
    queryFn: () => fetchAnalyticsData(timeRange),
    refetchOnWindowFocus: false,
  });

  if (isError) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <CardTitle className="text-destructive mb-2">Error</CardTitle>
          <CardDescription>
            There was an error loading your analytics data. Please try again
            later.
          </CardDescription>
        </Card>
      </div>
    );
  }

  const selectedTimeLabel =
    timeRangeOptions.find((o) => o.value === timeRange)?.label || timeRange;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header and time range selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Portfolio Analytics
          </h1>
          <p className="text-muted-foreground">
            Track your investment performance and insights
          </p>
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Time Range" />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tab navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsListWrapper>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsListWrapper>

        <TabsContent value="overview">
          <OverviewTab
            data={data}
            isLoading={isLoading}
            formatCurrency={formatCurrency}
            formatPercent={formatPercentage}
            timeRangeLabel={selectedTimeLabel}
          />
        </TabsContent>

        <TabsContent value="allocation">
          <AllocationTab
            data={data}
            isLoading={isLoading}
            formatCurrency={formatCurrency}
            formatPercent={formatPercentage}
          />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceTab
            data={data}
            isLoading={isLoading}
            formatCurrency={formatCurrency}
            formatPercent={formatPercentage}
          />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTab
            data={data}
            isLoading={isLoading}
            formatCurrency={formatCurrency}
            formatPercent={formatPercentage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Styled TabsList wrapper for better mobile experience
interface TabsListWrapperProps {
  children: React.ReactNode;
}

function TabsListWrapper({ children }: TabsListWrapperProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <TabsList className="w-full sm:w-auto inline-flex min-w-max h-10">
        {children}
      </TabsList>
    </div>
  );
}
