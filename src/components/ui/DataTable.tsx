"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TableSkeleton } from "./skeleton";

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: (item: T) => unknown;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
  width?: string;
}

export interface ActionButton<T> {
  label: string;
  onClick: (item: T) => void;
  variant?: "primary" | "secondary" | "danger" | "success" | "warning";
  condition?: (item: T) => boolean;
  loading?: (item: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  actions?: ActionButton<T>[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  pageSize?: number;
  sortable?: boolean;
  filterable?: boolean;
  dragAndDrop?: boolean;
  className?: string;
}

export function DataTable<T extends object>({
  data,
  columns,
  actions = [],
  onRowClick,
  loading = false,
  error = null,
  emptyMessage = "No data",
  pageSize = 10,
  sortable = true,
  filterable = true,
  className = "",
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (globalFilter) {
      filtered = filtered.filter((item) =>
        columns.some((column) => {
          const value = column.accessor(item);
          return String(value || "")
            .toLowerCase()
            .includes(globalFilter.toLowerCase());
        }),
      );
    }

    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue) {
        const column = columns.find((col) => col.key === key);
        if (column) {
          filtered = filtered.filter((item) => {
            const value = column.accessor(item);
            return String(value || "")
              .toLowerCase()
              .includes(filterValue.toLowerCase());
          });
        }
      }
    });

    return filtered;
  }, [data, columns, globalFilter, filters]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const column = columns.find((col) => col.key === sortConfig.key);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = column.accessor(a);
      const bValue = column.accessor(b);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === "asc" ? comparison : -comparison;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, columns]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    setSortConfig((prevConfig) => {
      if (prevConfig?.key === columnKey) {
        return {
          key: columnKey,
          direction: prevConfig.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: columnKey, direction: "asc" };
    });
  };

  const handleColumnFilter = (columnKey: string, value: string) => {
    setFilters((prev) => ({ ...prev, [columnKey]: value }));
    setCurrentPage(1);
  };

  const variantStyles: Record<string, string> = {
    primary: "text-primary bg-primary/10 hover:bg-primary/20",
    secondary: "text-secondary-foreground bg-secondary hover:bg-secondary/80",
    danger: "text-destructive bg-destructive/10 hover:bg-destructive/20",
    success: "text-success bg-success/10 hover:bg-success/20",
    warning: "text-warning bg-warning/10 hover:bg-warning/20",
  };

  if (loading) {
    return (
      <div className={cn("rounded-lg border border-border bg-card", className)}>
        <TableSkeleton rows={5} columns={columns.length || 5} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "rounded-lg border border-border bg-card p-8 text-center",
          className,
        )}
      >
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-border bg-card", className)}>
      {/* Search & Filters */}
      {filterable && (
        <div className="p-4 space-y-3 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground"
            />
          </div>
          {columns.some((c) => c.filterable) && (
            <div className="flex flex-wrap gap-2">
              {columns
                .filter((column) => column.filterable)
                .map((column) => (
                  <input
                    key={column.key}
                    type="text"
                    placeholder={column.header}
                    value={filters[column.key] || ""}
                    onChange={(e) =>
                      handleColumnFilter(column.key, e.target.value)
                    }
                    className="px-3 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground w-32"
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider",
                    column.sortable &&
                      sortable &&
                      "cursor-pointer select-none hover:text-foreground transition-colors",
                  )}
                  style={{ width: column.width }}
                  onClick={() => sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.header}</span>
                    {sortable && column.sortable && (
                      <span className="text-muted-foreground">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className={cn(
                    "border-b border-border last:border-0 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => {
                    const value = column.accessor(item);
                    return (
                      <td
                        key={column.key}
                        className="px-4 py-3 text-sm text-foreground whitespace-nowrap"
                      >
                        {column.render
                          ? column.render(value, item)
                          : String(value || "-")}
                      </td>
                    );
                  })}
                  {actions.length > 0 && (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {actions.map((action, actionIndex) => {
                          const shouldShow = action.condition
                            ? action.condition(item)
                            : true;
                          const isLoading = action.loading
                            ? action.loading(item)
                            : false;
                          if (!shouldShow) return null;
                          return (
                            <button
                              key={actionIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(item);
                              }}
                              disabled={isLoading}
                              className={cn(
                                "inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-50",
                                variantStyles[action.variant || "primary"],
                              )}
                            >
                              {isLoading ? "..." : action.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
            {sortedData.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    "h-8 min-w-8 px-2 text-xs font-medium rounded-md transition-colors",
                    currentPage === pageNum
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
