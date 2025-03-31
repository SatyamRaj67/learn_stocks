import { DataTable } from "@/components/data-table";
import { columns } from "@/components/table-props/columns";
import React from "react";

async function getData(): Promise<any> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
  ];
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={data}
      />
    </div>
  );
}
