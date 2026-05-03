import { NextRequest, NextResponse } from "next/server";

const RAPIDAPI_KEY =
  process.env.RAPIDAPI_KEY ||
  "c56678146dmsh07852f6a91039c1p13da3bjsne08e81cf1b85";
const RAPIDAPI_HOST = "real-time-amazon-data.p.rapidapi.com";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const asin = searchParams.get("asin");

  if (!asin) {
    return NextResponse.json({ error: "ASIN required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/product-details?asin=${asin}&country=US`,
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("RapidAPI error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product details" },
      { status: 500 },
    );
  }
}
