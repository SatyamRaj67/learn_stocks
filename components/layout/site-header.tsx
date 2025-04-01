"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ThemeToggle from "./theme-toggle";
import { usePathname } from "next/navigation";

function formatPathname(pathname: string): string {
  if (!pathname || pathname === "/") return "";

  const segments = pathname.replace(/^\/|\/$/g, "").split("/");

  const capitalizedSegments = segments.map((segment) => {
    if (segment.length === 0) return "";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  });

  return " / " + capitalizedSegments.join(" / ");
}

export function SiteHeader() {
  const path = usePathname();
  const pathName = formatPathname(path);
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">App {pathName}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            asChild
            size="sm"
            className="hidden sm:flex"
          >
            <ThemeToggle />
          </Button>
        </div>
      </div>
    </header>
  );
}
