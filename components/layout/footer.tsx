import { TrendingUp } from "lucide-react";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="py-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">StockSmart</h3>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Smart investing made simple
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#">Features</Link>
              </li>
              <li>
                <Link href="#">Pricing</Link>
              </li>
              <li>
                <Link href="#">API</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#">Documentation</Link>
              </li>
              <li>
                <Link href="#">Guides</Link>
              </li>
              <li>
                <Link href="#">Help center</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#">About</Link>
              </li>
              <li>
                <Link href="#">Blog</Link>
              </li>
              <li>
                <Link href="#">Careers</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-foreground mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p>© 2025 StockSmart. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#">Terms</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
