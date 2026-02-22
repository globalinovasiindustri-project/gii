import { NextRequest, NextResponse } from "next/server";

const RAPIDAPI_KEY =
  process.env.RAPIDAPI_KEY ||
  "c56678146dmsh07852f6a91039c1p13da3bjsne08e81cf1b85";
const RAPIDAPI_HOST = "axesso-axesso-amazon-data-service-v1.p.rapidapi.com";
const AI_API_KEY = process.env.AI_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const { productName } = await request.json();

    if (!productName) {
      return NextResponse.json(
        { success: false, message: "Product name is required" },
        { status: 400 },
      );
    }

    console.log("Searching for product:", productName);

    // Step 1: Search Amazon using Axesso API
    const searchUrl = `https://${RAPIDAPI_HOST}/amz/amazon-search-by-keyword-asin?domainCode=com&keyword=${encodeURIComponent(productName)}&page=1&excludeSponsored=false&sortBy=relevanceblender&withCache=true`;

    const searchResponse = await fetch(searchUrl, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error("Search API error:", searchResponse.status, errorText);
      throw new Error(`Failed to search products: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    console.log("Search response:", JSON.stringify(searchData, null, 2));

    // Axesso returns ASIN codes in foundProducts array
    const foundProducts = searchData.foundProducts || [];
    console.log("Products found (ASINs):", foundProducts.length);

    if (foundProducts.length === 0) {
      return NextResponse.json(
        { success: false, message: "No products found" },
        { status: 404 },
      );
    }

    // Step 2: Get detailed product info for first 2 ASINs using URL-based lookup
    const detailPromises = foundProducts
      .slice(0, 2)
      .map(async (asin: string) => {
        try {
          // Construct Amazon product URL
          const productUrl = `https://www.amazon.com/dp/${asin}/`;
          const encodedUrl = encodeURIComponent(productUrl);

          const detailResponse = await fetch(
            `https://${RAPIDAPI_HOST}/amz/amazon-lookup-product?url=${encodedUrl}`,
            {
              headers: {
                "x-rapidapi-key": RAPIDAPI_KEY,
                "x-rapidapi-host": RAPIDAPI_HOST,
              },
            },
          );

          if (!detailResponse.ok) {
            console.error(`Failed to fetch details for ASIN ${asin}`);
            return null;
          }

          const detailData = await detailResponse.json();
          console.log(
            `Detail for ${asin}:`,
            JSON.stringify(detailData, null, 2),
          );
          return detailData;
        } catch (error) {
          console.error(`Error fetching details for ASIN ${asin}:`, error);
          return null;
        }
      });

    const productDetails = (await Promise.all(detailPromises)).filter(
      (detail) => detail !== null,
    );

    if (productDetails.length === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch product details" },
        { status: 500 },
      );
    }

    // Step 3: Process with AI
    const aiPrompt = `You are a product data processor. Based on the following Amazon product data from Axesso API, generate structured product information suitable for an e-commerce platform.

Product Data:
${JSON.stringify(productDetails, null, 2)}

Please analyze this data and return a JSON object with the following structure:
{
  "name": "Product name ONLY - clean, concise, without variants (e.g., 'Apple iPhone 15' NOT 'Apple iPhone 15, 128GB, Black - Unlocked')",
  "category": "One of: smartphones, laptops, tablets, smartwatches, headphones, cameras, gaming, accessories, home_appliances, other",
  "brand": "Brand name (lowercase, one of: apple, samsung, google, xiaomi, oppo, vivo, realme, asus, lenovo, hp, dell, acer, sony, lg, huawei, oneplus, nokia, motorola, other)",
  "weight": "Estimated weight in grams (number only, reasonable estimate based on product type)",
  "description": "Comprehensive product description in Indonesian (Bahasa Indonesia), 3-4 sentences, highlighting key features and benefits",
  "images": ["array of image URLs from the product data, select best quality images, maximum 6 images"]
}

Important:
- Name must be ONLY the base product name without any variants, colors, storage, or conditions
- Remove any variant information like storage (128GB, 256GB), colors (Black, White), conditions (Renewed, Unlocked)
- Example: "Apple iPhone 15" NOT "Apple iPhone 15, 128GB, Black - Unlocked (Renewed)"
- Description must be in Indonesian language
- Weight should be a realistic estimate in grams (e.g., smartphone: 150-250g, laptop: 1500-2500g)
- Category must match exactly one of the provided options
- Brand must be lowercase and match one of the provided options, use "other" if not listed
- Images should be high quality product photos (look for imgUrl, productImages, images, or similar fields)
- Return ONLY valid JSON, no additional text

The Axesso API may use different field names like:
- productTitle, title, or name for product name
- imgUrl, productImages, images, or imageUrlList for images
- manufacturer or brand for brand name
- features, featureBullets, or productDescription for description
- Extract and use whatever fields are available`;

    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that processes product data and returns structured JSON.",
            },
            {
              role: "user",
              content: aiPrompt,
            },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error("Failed to process with AI");
    }

    const aiData = await aiResponse.json();
    const generatedData = JSON.parse(aiData.choices[0].message.content);

    console.log("Generated data:", JSON.stringify(generatedData, null, 2));

    return NextResponse.json({
      success: true,
      data: generatedData,
    });
  } catch (error) {
    console.error("Generate product error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate product data",
      },
      { status: 500 },
    );
  }
}
