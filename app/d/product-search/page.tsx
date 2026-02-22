"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

type AmazonProduct = {
  asin?: string;
  product_title?: string;
  product_price?: string;
  product_original_price?: string;
  product_photo?: string;
  product_star_rating?: string;
  product_num_ratings?: number;
  product_url?: string;
};

type ProductDetail = {
  asin?: string;
  product_title?: string;
  product_price?: string;
  product_original_price?: string;
  product_photo?: string;
  product_photos?: string[];
  product_star_rating?: string;
  product_num_ratings?: number;
  product_url?: string;
  product_description?: string;
  about_product?: string[];
  product_details?: Record<string, string>;
  product_information?: Record<string, string>;
  category_path?: Array<{ name: string; link: string }>;
  brand?: string;
  model?: string;
};

export default function ProductSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AmazonProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(
    null,
  );
  const [loadingDetail, setLoadingDetail] = useState(false);

  const currentProduct = results[currentIndex];

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setCurrentIndex(0);
    setProductDetail(null);
    try {
      const response = await fetch(
        `/api/product-search?q=${encodeURIComponent(query)}`,
      );
      const json = await response.json();

      if (json.error) {
        setError(json.error);
        setResults([]);
      } else {
        const products = json.data?.products || [];
        setResults(products);
        if (products.length > 0) {
          fetchProductDetail(products[0]);
        }
      }
    } catch (err) {
      setError("Failed to search products");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetail = async (product: AmazonProduct) => {
    if (!product.asin) return;

    setLoadingDetail(true);
    setProductDetail(null);
    try {
      const response = await fetch(`/api/product-details?asin=${product.asin}`);
      const json = await response.json();

      if (!json.error) {
        setProductDetail(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch product details:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < results.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      fetchProductDetail(results[nextIndex]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      fetchProductDetail(results[prevIndex]);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Product Search (Amazon Real-Time)
      </h1>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Search products... (e.g., iPhone 15, Galaxy S25)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {results.length === 0 && !loading && !error && (
        <p className="text-center text-gray-500">
          Search for products to get started
        </p>
      )}

      {results.length > 0 && currentProduct && (
        <div className="border rounded-lg p-6">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0 || loadingDetail}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              {currentIndex + 1} / {results.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === results.length - 1 || loadingDetail}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {loadingDetail && (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading details...</p>
            </div>
          )}

          {!loadingDetail && (
            <div className="space-y-6">
              {/* Images */}
              {productDetail?.product_photos &&
              productDetail.product_photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {productDetail.product_photos
                    .slice(0, 4)
                    .map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Product ${idx + 1}`}
                        className="w-full rounded-lg border"
                      />
                    ))}
                </div>
              ) : (
                currentProduct.product_photo && (
                  <img
                    src={currentProduct.product_photo}
                    alt={currentProduct.product_title}
                    className="w-full max-w-md mx-auto rounded-lg"
                  />
                )
              )}

              {/* Title & Brand */}
              <div>
                <h3 className="text-xl font-bold">
                  {productDetail?.product_title || currentProduct.product_title}
                </h3>
                {productDetail?.brand && (
                  <p className="text-sm text-gray-600 mt-1">
                    Brand: {productDetail.brand}
                  </p>
                )}
              </div>

              {/* Price & Rating */}
              <div className="flex items-center gap-6">
                {(productDetail?.product_price ||
                  currentProduct.product_price) && (
                  <div>
                    <p className="text-3xl font-bold text-green-600">
                      {productDetail?.product_price ||
                        currentProduct.product_price}
                    </p>
                    {(productDetail?.product_original_price ||
                      currentProduct.product_original_price) &&
                      (productDetail?.product_original_price ||
                        currentProduct.product_original_price) !==
                        (productDetail?.product_price ||
                          currentProduct.product_price) && (
                        <p className="text-sm line-through text-gray-500">
                          {productDetail?.product_original_price ||
                            currentProduct.product_original_price}
                        </p>
                      )}
                  </div>
                )}

                {(productDetail?.product_star_rating ||
                  currentProduct.product_star_rating) && (
                  <div>
                    <p className="font-semibold">
                      ⭐{" "}
                      {productDetail?.product_star_rating ||
                        currentProduct.product_star_rating}
                    </p>
                    <p className="text-sm text-gray-600">
                      {productDetail?.product_num_ratings ||
                        currentProduct.product_num_ratings}{" "}
                      ratings
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              {productDetail?.product_description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-gray-700">
                    {productDetail.product_description}
                  </p>
                </div>
              )}

              {/* About Product */}
              {productDetail?.about_product &&
                productDetail.about_product.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">About this item</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {productDetail.about_product.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Product Details / Specs */}
              {productDetail?.product_details &&
                Object.keys(productDetail.product_details).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Product Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(productDetail.product_details).map(
                        ([key, value]) => (
                          <div key={key} className="border-b py-1">
                            <span className="text-gray-600">{key}:</span>{" "}
                            <span className="font-medium">{value}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Product Information */}
              {productDetail?.product_information &&
                Object.keys(productDetail.product_information).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      Additional Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(productDetail.product_information).map(
                        ([key, value]) => (
                          <div key={key} className="border-b py-1">
                            <span className="text-gray-600">{key}:</span>{" "}
                            <span className="font-medium">{value}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Category Path */}
              {productDetail?.category_path &&
                productDetail.category_path.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Category</h4>
                    <p className="text-sm text-gray-600">
                      {productDetail.category_path
                        .map((cat) => cat.name)
                        .join(" > ")}
                    </p>
                  </div>
                )}

              {/* ASIN */}
              {(productDetail?.asin || currentProduct.asin) && (
                <div className="text-xs text-gray-500">
                  ASIN: {productDetail?.asin || currentProduct.asin}
                </div>
              )}

              {/* Amazon Link */}
              {(productDetail?.product_url || currentProduct.product_url) && (
                <div className="pt-4 border-t">
                  <a
                    href={
                      productDetail?.product_url || currentProduct.product_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View on Amazon →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
