import React from "react";
import { Card, CardContent } from "../ui/card";

const stats = [
  { label: "Active users", value: "100K+", icon: "users" },
  { label: "Markets covered", value: "35+", icon: "globe" },
  { label: "Daily transactions", value: "$12M+", icon: "bank" },
  {
    label: "Customer satisfaction",
    value: "98%",
    icon: "thumbs-up",
  },
];

const StatsSection = () => {
  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-900/30">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card
              key={i}
              className="border-none shadow-sm bg-white dark:bg-slate-800"
            >
              <CardContent className="p-6">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-muted-foreground mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
