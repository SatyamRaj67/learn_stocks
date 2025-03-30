import { Search, Shield, Star } from "lucide-react";
import React from "react";

const keys = [
  {
    title: "Commission-free trading",
    description:
      "Invest in stocks and ETFs without paying commissions or hidden fees.",
    icon: <Shield className="h-6 w-6" />,
  },
  {
    title: "Expert research",
    description:
      "Access in-depth analysis and recommendations from financial experts.",
    icon: <Search className="h-6 w-6" />,
  },
  {
    title: "5-star support",
    description:
      "Get help from our knowledgeable support team whenever you need it.",
    icon: <Star className="h-6 w-6" />,
  },
];

const ImportanceSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why investors choose StockSmart
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of investors who trust our platform for their trading
            needs
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {keys.map((item, i) => (
            <div
              key={i}
              className="flex gap-4"
            >
              <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-3 h-fit">
                {item.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImportanceSection;
