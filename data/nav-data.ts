import {
    IconBuildingStore,
    IconCashRegister,
    IconChartBar,
    IconDashboard,
    IconDatabase,
    IconFileDescription,
    IconHelp,
    IconReport,
    IconReportAnalytics,
    IconSearch,
    IconSettings,
    IconTerminal,
    IconUsers,
  } from "@tabler/icons-react";

export const navData = {
    navMain: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: IconDashboard,
      },
      {
        title: "Market",
        href: "/market",
        icon: IconChartBar,
      },
      {
        title: "Analytics",
        href: "/analytics",
        icon: IconReportAnalytics,
      },
      {
        title: "Transactions",
        href: "/transactions",
        icon: IconCashRegister,
      },
      {
        title: "Team",
        href: "#",
        icon: IconUsers,
      },
    ],
    navAdmin: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: IconTerminal,
      },
      {
        title: "Watchlist",
        href: "/admin/watchlist",
        icon: IconFileDescription,
      },
      {
        title: "Reports",
        href: "/admin/reports",
        icon: IconReport,
      },
      {
        title: "Market",
        href: "/admin/market",
        icon: IconBuildingStore,
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "/settings",
        icon: IconSettings,
      },
      {
        title: "Get Help",
        url: "#",
        icon: IconHelp,
      },
      {
        title: "Search",
        url: "#",
        icon: IconSearch,
      },
    ],
    documents: [
      {
        name: "Data Library",
        url: "#",
        icon: IconDatabase,
      },
      {
        name: "Reports",
        url: "#",
        icon: IconReport,
      },
    ],
  };