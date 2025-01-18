import { NextResponse } from "next/server";

const ITEMS_PER_PAGE = 50;

interface TableColumn {
  label: string;
}

interface TableRow {
  c: { v: string | number | null }[]; 
}

interface TableData {
  cols: TableColumn[];
  rows: TableRow[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const filter = searchParams.get("filter") || "";

  try {
    const response = await fetch(
      "https://docs.google.com/spreadsheets/d/1vwc803C8MwWBMc7ntCre3zJ5xZtG881HKkxlIrwwxNs/gviz/tq?tqx=out:json"
    );
    const text = await response.text();
    const jsonData = text.substring(47).slice(0, -2); 
    const data: { table: TableData } = JSON.parse(jsonData);

    if (data && data.table && data.table.rows) {
      const formattedData = data.table.rows.map((row) => {
        const obj: Record<string, string | number | null> = {};
        data.table.cols.forEach((col, index) => {
          obj[col.label] = row.c[index]?.v || ""; 
        });
        return obj;
      });

      const filteredData = filter
        ? formattedData.filter((item) =>
            (item["Domain"] as string)
              ?.toLowerCase()
              .includes(filter.toLowerCase())
          )
        : formattedData;

      const totalItems = filteredData.length;
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const paginatedData = filteredData.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
      );

      return NextResponse.json({
        items: paginatedData,
        currentPage: page,
        totalPages,
        totalItems,
      });
    } else {
      console.error("Data is not in the expected format:", data);
      return NextResponse.json(
        { error: "Data format is incorrect" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
