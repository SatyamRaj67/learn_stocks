import React from "react";
import { Button } from "../ui/button";

const ContactSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to start your investment journey?
        </h2>
        <p className="text-lg mb-8 max-w-xl mx-auto">
          Join thousands of investors already using StockSmart to achieve their
          financial goals
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Create free account
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-foreground border-background hover:bg-foregorund/10"
          >
            Contact sales
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
