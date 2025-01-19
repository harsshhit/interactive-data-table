"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import DataTable from "./DataTable";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DataItem = {
  id: string;
  name: string;
  description: string;
  // [key: string]: any;
};

type Data = {
  items: DataItem[];
  totalPages: number;
  total: number;
};



const fetchData = async (page: number, filter: string): Promise<Data> => {
  const res = await fetch(`/api/data?page=${page}&filter=${filter}`);
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
};


export default function DashboardPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      setIsAuthChecking(false);
    }
  }, [router]);

 const {
   data,
   error,
   isLoading: isDataLoading,
   isFetching,
 } = useQuery<Data, Error>({
   queryKey: ["tableData", page, filter],
   queryFn: () => fetchData(page, filter),
 });


  const TableLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-[400px] bg-white/50">
      <div className="flex items-center gap-3">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        <p className="text-gray-600 font-medium">Loading data...</p>
      </div>
    </div>
  );

  const ErrorState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-[400px]">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Data
            </h2>
            <p className="text-gray-600">{message}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    </div>
  );

  if (isAuthChecking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and monitor your data</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Total Entries",
              value: data?.total || 0,
              description: "All time",
              icon: () => (
                <div className="p-2 bg-blue-50 rounded-lg">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              ),
            },
            {
              title: "Current Page",
              value: page,
              description: "out of 732 pages",
              icon: () => (
                <div className="p-2 bg-green-50 rounded-lg">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              ),
            },
            {
              title: "Total Pages",
              value: "732",
              description: "Available",
              icon: () => (
                <div className="p-2 bg-purple-50 rounded-lg">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              ),
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className="bg-white hover:shadow-lg transition-all duration-200 border border-gray-100"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      {index === 1 && (
                        <span className="text-sm text-gray-500">/ 732</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {stat.description}
                    </p>
                  </div>
                  {stat.icon && <stat.icon />}
                </div>

                {index === 1 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{((page / 732) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${(page / 732) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <Card className="overflow-hidden bg-white shadow-lg border-0">
            <CardHeader className="border-b border-gray-100 bg-white px-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-gray-800">
                  Data Overview
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isDataLoading ? (
                <TableLoadingState />
              ) : error ? (
                <ErrorState
                  message={
                    error instanceof Error ? error.message : "An error occurred"
                  }
                />
              ) : (
                data && (
                  <div
                    className={`relative ${
                      isFetching ? "opacity-60" : ""
                    } transition-opacity duration-200`}
                  >
                    {isFetching && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                          <p className="text-gray-600 font-medium">
                            Updating data...
                          </p>
                        </div>
                      </div>
                    )}
                    <DataTable
                      data={data.items}
                      totalPages={data.totalPages}
                      currentPage={page}
                      setPage={setPage}
                      filter={filter}
                      setFilter={setFilter}
                    />
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
