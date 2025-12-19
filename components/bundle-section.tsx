import Image from "next/image";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BundleSection() {
  return (
    <section className="w-full px-4 md:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Background Image with Text Overlay */}
        <div className="h-[400px] overflow-hidden rounded-xl lg:h-[600px] hidden relative md:flex">
          <Image
            src="/placeholder.svg?height=700&width=700"
            alt="Till Death Drips Hot Bundle Background"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 rounded-xl bg-black/40" />
          <div className="relative z-10 flex h-full flex-col justify-end p-8 text-white md:p-12">
            <h2 className="mb-4 text-3xl font-medium tracking-tighter leading-tight md:text-4xl">
              Beli dalam jumlah yang banyak, untuk harga yang murah.
            </h2>
            <p className="mb-6 text-lg font-medium">
              Untuk harga yang lebih murah
            </p>
            <p className="text-base leading-relaxed text-gray-200">
              Dapatkan penawaran khusus untuk pembelian skala besar, yang
              memenuhi beragam kebutuhan.
            </p>
          </div>
        </div>

        {/* Right Column: Product Cards and Add to Cart */}
        <div className="relative flex flex-col justify-between bg-muted p-8 rounded-2xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Product Card 1: Bottle */}
            <Card className="relative overflow-hidden rounded-xl border-none shadow-none">
              <div className="relative h-64 w-full">
                <Image
                  src="/placeholder.svg"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Select defaultValue="sacred-shadow">
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sacred-shadow">Samsung</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="1">
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Volume" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Samsung Galaxy S24 5G</SelectItem>
                      <SelectItem value="2">
                        Samsung Galaxy S24 5G Ultra
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="1">
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Volume" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">5 pcs</SelectItem>
                      <SelectItem value="2">5-10 pcs</SelectItem>
                      <SelectItem value="3">10-25 pcs</SelectItem>
                      <SelectItem value="4">25-50 pcs</SelectItem>
                      <SelectItem value="5">50-100 pcs</SelectItem>
                      <SelectItem value="6">100+ pcs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Plus Icon between cards */}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-md">
              <Plus className="size-6 text-gray-700" />
            </div>

            {/* Product Card 2: Tote Bag */}
            <Card className="relative overflow-hidden rounded-xl border-none shadow-none">
              <div className="relative h-64 w-full">
                <Image
                  src="/placeholder.svg"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Select defaultValue="sacred-shadow">
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sacred-shadow">Samsung</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="1">
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Volume" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Samsung Galaxy S24 5G</SelectItem>
                      <SelectItem value="2">
                        Samsung Galaxy S24 5G Ultra
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="1">
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Volume" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">5 pcs</SelectItem>
                      <SelectItem value="2">5-10 pcs</SelectItem>
                      <SelectItem value="3">10-25 pcs</SelectItem>
                      <SelectItem value="4">25-50 pcs</SelectItem>
                      <SelectItem value="5">50-100 pcs</SelectItem>
                      <SelectItem value="6">100+ pcs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add to Cart Button */}
          <Button className="mt-8 w-full bg-black py-6 text-lg text-background">
            Minta penawaran
          </Button>
        </div>
      </div>
    </section>
  );
}
