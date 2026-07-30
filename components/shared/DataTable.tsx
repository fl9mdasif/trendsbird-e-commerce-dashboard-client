"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  pageIndex?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  filterComponent?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  error = null,
  onRetry,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  pageIndex = 1,
  pageCount = 1,
  onPageChange,
  emptyMessage = "No results found.",
  filterComponent,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4 w-full">
      {/* Search and Filters Bar */}
      {(onSearchChange || filterComponent) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {onSearchChange && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          {filterComponent && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {filterComponent}
            </div>
          )}
        </div>
      )}

      {/* Table Body / Loading / Error / Empty States */}
      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : isLoading ? (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : !data.length ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && pageCount > 1 && onPageChange && (
        <div className="flex items-center justify-between px-2">
          <div className="text-xs text-muted-foreground">
            Page {pageIndex} of {pageCount}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pageIndex - 1)}
              disabled={pageIndex <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pageIndex + 1)}
              disabled={pageIndex >= pageCount}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
