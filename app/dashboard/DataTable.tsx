"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
};

type DataItem = Record<string, string | number>;

interface DataTableProps {
  data: DataItem[];
  totalPages: number;
  currentPage: number;
  setPage: (page: number) => void;
  filter: string;
  setFilter: (filter: string) => void;
}

export default function DataTable({
  data,
  totalPages,
  currentPage,
  setPage,
  filter,
  setFilter,
}: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "",
    direction: "asc",
  });

 const sortedData = useMemo(() => {
  if (!data || data.length === 0) return [];
  const sortableData = [...data]; 
  if (sortConfig.key) {
    sortableData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }
  return sortableData;
}, [data, sortConfig]);


  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 45, []), 
    overscan: 5,
  });

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Button
            onClick={() => setPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            className="h-9 px-4 flex items-center gap-1 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1 px-2 text-gray-600">
            <span>Page</span>
            <span className="font-medium text-gray-900">{currentPage}</span>
            <span>of</span>
            <span className="font-medium text-gray-900">{totalPages}</span>
          </div>
          <Button
            onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
            className="h-9 px-4 flex items-center gap-1 hover:bg-gray-50"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
        <div ref={parentRef} className="h-[500px] overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th
                    key={key}
                    onClick={() => requestSort(key)}
                    className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {key}
                      <span
                        className={`transform transition-transform duration-200 ${
                          sortConfig.key === key
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-50"
                        }`}
                      >
                        {sortConfig.key === key &&
                        sortConfig.direction === "asc" ? (
                          <ArrowUpIcon className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ArrowDownIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const item = sortedData[virtualRow.index];
                return (
                  <tr
                    key={virtualRow.index}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {Object.entries(item).map(([key, value]) => (
                      <td
                        key={key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                      >
                        {value !== null && value !== undefined
                          ? value.toString()
                          : "-"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
