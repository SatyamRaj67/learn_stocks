import { SectionCards } from "@/components/home/CardsSection";
import { ChartAreaInteractive } from "@/components/layout/chart-area-interactive";
import React from "react";

const DashboardPage = () => {
  const cardData = [
    {
      description: "Portfolio Value",
      value: "₹80,000,000",
      badge: "+20%",
      footerTitle: "Trending up this month",
      footerDescription: "Millionaire in 25 Years",
    },
    {
      description: "Available Cash",
      value: "₹8.69",
      badge: "-92059.83%",
      footerTitle: "Down 92059% this period",
      footerDescription: "Acquisition needs attention",
    },
    {
      description: "Totals Gains / Loss",
      value: "-₹79,950,000",
      badge: "-92059.83%",
      footerTitle: "Going to be Homeless",
      footerDescription: "Losses exceed targets",
    },
    {
      description: "Growth Rate",
      value: "20%",
      badge: "+20%",
      footerTitle: "Steady performance increase",
      footerDescription: "Meets growth projections",
    },
  ];
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards cards={cardData} />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
