import { NextResponse } from "next/server";

const ITEMS_PER_PAGE = 50;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const filter = searchParams.get("filter") || "";

  try {
    const response = await fetch(
      "https://docs.google.com/spreadsheets/d/1vwc803C8MwWBMc7ntCre3zJ5xZtG881HKkxlIrwwxNs/gviz/tq?tqx=out:json"
    );
    const text = await response.text();
    const data = JSON.parse(text.substring(47).slice(0, -2));

    if (data && data.table && data.table.rows) {
      let formattedData = data.table.rows.map((row: any) => {
        const obj: Record<string, any> = {};
        data.table.cols.forEach((col: any, index: number) => {
          obj[col.label] = row.c[index] ? row.c[index].v : "";
        });
        return obj;
      });

      if (filter) {
        formattedData = formattedData.filter(
          (item: any) =>
            item["Domain"] &&
            item["Domain"].toLowerCase().includes(filter.toLowerCase())
        );
      }

      const totalItems = formattedData.length;
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const paginatedData = formattedData.slice(
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

