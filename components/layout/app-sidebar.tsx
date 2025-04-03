"use client";

import * as React from "react";
import { IconInnerShadowTop } from "@tabler/icons-react";

import { NavMain } from "@/components/layout/nav-main";
import { NavSecondary } from "@/components/layout/nav-secondary";
import { NavUser } from "@/components/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { NavAdmin } from "./nav-admin";
import { navData } from "@/data/nav-data";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useCurrentUser();
  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">SmartStock</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
        {user?.role === "ADMIN" && <NavAdmin items={navData.navAdmin} />}

        <NavSecondary
          items={navData.navSecondary}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
