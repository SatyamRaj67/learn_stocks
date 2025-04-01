import { columns } from "@/components/ui/data-table/columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import React from "react";
import { z } from "zod";

import { promises as fs } from "fs";
import path from "path";
import { taskSchema } from "@/data/schema";

async function getTasks() {
  const data = await fs.readFile(
    path.join(process.cwd(), "/components/ui/data-table/data/tasks.json")
  );

  const tasks = JSON.parse(data.toString());

  return z.array(taskSchema).parse(tasks);
}

export default async function MarketPage() {
  const tasks = await getTasks();

  return (
    <>
      <div className="md:hidden"></div>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
        </div>
        <DataTable
          data={tasks}
          columns={columns}
        />
      </div>
    </>
  );
}
