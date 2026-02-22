import { NextRequest, NextResponse } from "next/server";

const RAPIDAPI_KEY =
  process.env.RAPIDAPI_KEY ||
  "c56678146dmsh07852f6a91039c1p13da3bjsne08e81cf1b85";
const RAPIDAPI_HOST = "real-time-amazon-data.p.rapidapi.com";
const AI_API_KEY = process.env.AI_API_KEY || "";

type AmazonProduct = {
  asin?: string;
  product_title?: string;
  product_price?: string;
  product_photo?: string;
  product_star_rating?: string;
  product_num_ratings?: number;
};

type ProductDetail = {
  product_title?: string;
  product_description?: string;
  about_product?: string[];
  product_details?: Record<string, string>;
  product_information?: Record<string, string>;
  brand?: string;
  product_photos?: string[];
  category_path?: Array<{ name: string }>;
};

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
    console.log("RAPIDAPI_KEY available:", !!RAPIDAPI_KEY);

    // Step 1: Search Amazon for products (limit to 2)
    const searchUrl = `https://${RAPIDAPI_HOST}/search?query=${encodeURIComponent(productName)}&page=1&country=US&sort_by=RELEVANCE&product_condition=ALL&page_size=2`;
    console.log("Search URL:", searchUrl);

    const searchResponse = await fetch(searchUrl, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    });

    console.log("Search response status:", searchResponse.status);

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error("Search API error:", searchResponse.status, errorText);
      throw new Error(`Failed to search products: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    console.log("Search data received:", !!searchData.data);

    const products: AmazonProduct[] = searchData.data?.products || [];
    console.log("Products found:", products.length);

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, message: "No products found" },
        { status: 404 },
      );
    }

    // Step 2: Get details for first 2 products
    const detailPromises = products.slice(0, 2).map(async (product) => {
      if (!product.asin) return null;

      try {
        const detailResponse = await fetch(
          `https://${RAPIDAPI_HOST}/product-details?asin=${product.asin}&country=US`,
          {
            headers: {
              "x-rapidapi-key": RAPIDAPI_KEY,
              "x-rapidapi-host": RAPIDAPI_HOST,
            },
          },
        );

        if (!detailResponse.ok) return null;

        const detailData = await detailResponse.json();
        return detailData.data as ProductDetail;
      } catch {
        return null;
      }
    });

    const productDetails = (await Promise.all(detailPromises)).filter(
      (detail): detail is ProductDetail => detail !== null,
    );

    if (productDetails.length === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch product details" },
        { status: 500 },
      );
    }

    // Step 3: Process with AI
    const aiPrompt = `You are a product data processor. Based on the following Amazon product data, generate structured product information suitable for an e-commerce platform.

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
- Images should be high quality product photos
- Return ONLY valid JSON, no additional text`;

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
