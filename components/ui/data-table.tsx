"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
  Settings,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  getSortedRowModel as tanstackGetSortedRowModel,
} from "@tanstack/react-table";

interface DataTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  title: string;
}

function DataTable<TData, TValue>({
  data,
  columns,
  title,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      globalFilter,
      sorting,
      columnVisibility,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: tanstackGetSortedRowModel(), // Use the renamed import
    onPaginationChange: (updater) => {
      const newPaginationState =
        typeof updater === "function"
          ? updater(table.getState().pagination)
          : updater;
      setPageIndex(newPaginationState.pageIndex);
      setPageSize(newPaginationState.pageSize);
      setPageCount(
        Math.ceil(
          table.getFilteredRowModel().rows.length / newPaginationState.pageSize
        )
      );
    },
  });

  // Update page count when filtered rows change
  const filteredRowsLength = table.getFilteredRowModel().rows.length;

  React.useEffect(() => {
    setPageCount(Math.ceil(filteredRowsLength / pageSize));
  }, [filteredRowsLength, pageSize, table]);

  // Function for handling direct page input
  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      const pageNumber = parseInt(target.value, 10);

      if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= pageCount) {
        table.setPageIndex(pageNumber - 1);
      }
      target.value = "";
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="border-b bg-muted/40 px-6 py-4">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            {/* Search Bar */}
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 h-10"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>

            {/* View Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto flex items-center"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[180px]"
              >
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "percentChange"
                        ? "% Change"
                        : column.id.charAt(0).toUpperCase() +
                          column.id.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`
                      ${
                        header.id.includes("price") ||
                        header.id.includes("change")
                          ? "text-right"
                          : ""
                      }
                      ${header.id.includes("actions") ? "text-center" : ""}
                      ${
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }
                      bg-muted/40 h-11
                    `}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`${
                          !header.id.includes("price") &&
                          !header.id.includes("change") &&
                          !header.id.includes("actions")
                            ? "flex-1"
                            : ""
                        }`}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                      {header.column.getCanSort() && (
                        <div className="flex items-center ml-1">
                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowUp className="h-4 w-4 ml-1" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDown className="h-4 w-4 ml-1" />
                          ) : (
                            <div className="w-4 h-4 opacity-0 group-hover:opacity-50">
                              ⋮
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-[53px] hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleFlatColumns().length}
                  className="h-24 text-center"
                >
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Enhanced Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing{" "}
          <strong>
            {table.getFilteredRowModel().rows.length === 0
              ? 0
              : pageIndex * pageSize + 1}
          </strong>
          -{" "}
          <strong>
            {Math.min(
              (pageIndex + 1) * pageSize,
              table.getFilteredRowModel().rows.length
            )}
          </strong>{" "}
          of <strong>{table.getFilteredRowModel().rows.length}</strong> items
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          {/* Page Size Selector */}
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              className="h-8 w-[70px] rounded-md border border-input px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option
                  key={size}
                  value={size}
                >
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Page Jump Input */}
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium whitespace-nowrap">Go to page</p>
            <Input
              type="number"
              min={1}
              max={pageCount}
              className="h-8 w-[70px]"
              placeholder={`${pageIndex + 1}`}
              onKeyDown={handlePageInput}
            />
          </div>

          {/* Page Navigation Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default DataTable;
