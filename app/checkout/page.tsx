"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useAddresses } from "@/hooks/use-addresses";
import {
  useGuestCheckout,
  useAuthenticatedCheckout,
} from "@/hooks/use-checkout";
import { useCalculateShipping, ShippingOption } from "@/hooks/use-shipping";
import { MainNavigation } from "@/components/common/main-navigation";
import { AddressSelector } from "@/components/checkout/address-selector";
import { ContactInfoForm } from "@/components/checkout/contact-info-form";
import {
  AddressForm,
  AddressFormData,
} from "@/components/checkout/address-form";
import { OrderSummaryCard } from "@/components/checkout/order-summary-card";
import { LocationData } from "@/components/checkout/address-form";
import type { ContactInfoSchema } from "@/lib/validations/checkout.validation";
import type { CartItem } from "@/lib/types/cart.types";

/**
 * Calculate total weight of cart items in grams
 */
function calculateCartWeight(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => {
    const weight = item.weight || 1000; // Default 1kg if not specified
    return total + weight * item.quantity;
  }, 0);
}

export default function CheckoutPage() {
  const cartQuery = useCart();
  const { isLoggedIn, isMeLoading } = useAuth();
  const { addresses, isLoading: isAddressesLoading } = useAddresses();
  const guestCheckout = useGuestCheckout();
  const authenticatedCheckout = useAuthenticatedCheckout();
  const calculateShipping = useCalculateShipping();

  const cartItems = cartQuery.data?.data?.items || [];

  // Calculate cart weight for shipping
  const cartWeight = useMemo(() => calculateCartWeight(cartItems), [cartItems]);

  // Derive default address (always synced with DB)
  const defaultAddress =
    addresses?.find((addr) => addr.isDefault) || addresses?.[0];

  // Simple state for selected address (authenticated users only)
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Shipping state
  const [selectedShippingOption, setSelectedShippingOption] =
    useState<ShippingOption | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingError, setShippingError] = useState<string | undefined>();

  // Location state for guest checkout
  const [guestLocationData, setGuestLocationData] =
    useState<LocationData | null>(null);

  // Guest checkout form refs
  const contactFormRef = useRef<UseFormReturn<ContactInfoSchema> | null>(null);
  const addressFormRef = useRef<UseFormReturn<AddressFormData> | null>(null);

  // Track form validity for guest checkout (force re-render when forms change)
  const [formsValid, setFormsValid] = useState(false);

  // Sync selectedAddressId with defaultAddress
  useEffect(() => {
    if (defaultAddress?.id) {
      setSelectedAddressId(defaultAddress.id);
    }
  }, [defaultAddress?.id]);

  // Check form validity periodically for guest checkout
  useEffect(() => {
    if (!isLoggedIn) {
      const interval = setInterval(() => {
        const contactValid = contactFormRef.current?.formState.isValid ?? false;
        const addressValid = addressFormRef.current?.formState.isValid ?? false;
        setFormsValid(contactValid && addressValid);
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Get selected address for authenticated users
  const selectedAddress = useMemo(() => {
    if (!isLoggedIn || !selectedAddressId || !addresses) return null;
    return addresses.find((addr) => addr.id === selectedAddressId) || null;
  }, [isLoggedIn, selectedAddressId, addresses]);

  // Trigger shipping calculation when district is selected (guest checkout)
  const handleGuestLocationChange = useCallback(
    (location: LocationData | null) => {
      setGuestLocationData(location);
      // Reset shipping when location changes
      setSelectedShippingOption(null);
      setShippingOptions([]);
      setShippingError(undefined);

      if (location?.regencyCode && cartWeight > 0) {
        calculateShipping.mutate(
          {
            destinationRegencyCode: location.regencyCode,
            weightInGrams: cartWeight,
          },
          {
            onSuccess: (options) => {
              setShippingOptions(options);
              setShippingError(undefined);
              // Auto-select first shipping option
              if (options.length > 0) {
                setSelectedShippingOption(options[0]);
              }
            },
            onError: (error) => {
              setShippingError(
                error.message || "Gagal menghitung ongkos kirim"
              );
              setShippingOptions([]);
            },
          }
        );
      }
    },
    [cartWeight, calculateShipping]
  );

  // Trigger shipping calculation when address is selected (authenticated checkout)
  useEffect(() => {
    if (isLoggedIn && selectedAddress?.regencyCode && cartWeight > 0) {
      // Reset shipping when address changes
      setSelectedShippingOption(null);
      setShippingOptions([]);
      setShippingError(undefined);

      calculateShipping.mutate(
        {
          destinationRegencyCode: selectedAddress.regencyCode,
          weightInGrams: cartWeight,
        },
        {
          onSuccess: (options) => {
            setShippingOptions(options);
            setShippingError(undefined);
            // Auto-select first shipping option
            if (options.length > 0) {
              setSelectedShippingOption(options[0]);
            }
          },
          onError: (error) => {
            setShippingError(error.message || "Gagal menghitung ongkos kirim");
            setShippingOptions([]);
          },
        }
      );
    } else if (isLoggedIn && selectedAddress && !selectedAddress.regencyCode) {
      // Address doesn't have regencyCode - clear shipping options
      setShippingOptions([]);
      setSelectedShippingOption(null);
      setShippingError(undefined);
    }
  }, [isLoggedIn, selectedAddress, cartWeight]);

  // Handle checkout
  const handleCheckout = () => {
    if (isLoggedIn) {
      if (selectedAddressId) {
        authenticatedCheckout.mutate({
          addressId: selectedAddressId,
          selectedCourier: selectedShippingOption?.courierName,
          selectedService: selectedShippingOption?.serviceName,
          shippingCost: selectedShippingOption?.cost,
        });
      }
    } else {
      // Validate and get form data
      const contactForm = contactFormRef.current;
      const addressForm = addressFormRef.current;

      if (contactForm?.formState.isValid && addressForm?.formState.isValid) {
        const contactData = contactForm.getValues();
        const addressData = addressForm.getValues();

        guestCheckout.mutate({
          fullName: contactData.fullName,
          email: contactData.email,
          phone: contactData.phone,
          address: {
            ...addressData,
            provinceCode: guestLocationData?.provinceCode,
            regencyCode: guestLocationData?.regencyCode,
            districtCode: guestLocationData?.districtCode,
            villageCode: guestLocationData?.villageCode,
          },
          selectedCourier: selectedShippingOption?.courierName,
          selectedService: selectedShippingOption?.serviceName,
          shippingCost: selectedShippingOption?.cost,
        });
      }
    }
  };

  // Determine if checkout button should be disabled
  // For guest: forms must be valid AND shipping must be selected
  // For authenticated: address must be selected AND shipping must be selected (if regencyCode exists)
  const isCheckoutDisabled = isLoggedIn
    ? !selectedAddressId ||
      (!!selectedAddress?.regencyCode && !selectedShippingOption)
    : !formsValid || !selectedShippingOption;

  const isSubmitting = isLoggedIn
    ? authenticatedCheckout.isPending
    : guestCheckout.isPending;

  // Check if selected address needs location update (authenticated users)
  const addressNeedsLocationUpdate =
    isLoggedIn && selectedAddress && !selectedAddress.regencyCode;

  return (
    <div className="flex flex-col min-h-screen">
      <MainNavigation />
      <div className="grid lg:grid-cols-2 flex-1 h-full">
        <div className="col-span-1 space-y-6 p-5 lg:p-16 flex justify-center lg:justify-end">
          <div className="flex-1 max-w-lg">
            {isMeLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Memuat informasi pengguna...
                </p>
              </div>
            ) : isLoggedIn ? (
              isAddressesLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Memuat alamat...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <AddressSelector
                    addresses={addresses || []}
                    selectedAddressId={selectedAddressId}
                    onSelectAddress={setSelectedAddressId}
                  />
                </div>
              )
            ) : (
              <div className="space-y-8">
                {/* Contact Information Section */}
                <div className="space-y-6">
                  <h2 className="text-lg font-medium tracking-tight">
                    Informasi Kontak
                  </h2>
                  <ContactInfoForm
                    isSubmitting={isSubmitting}
                    formRef={(form) => (contactFormRef.current = form)}
                  />
                </div>

                {/* Delivery Address Section */}
                <div className="space-y-6">
                  <h2 className="text-lg font-medium tracking-tight">
                    Alamat Pengiriman
                  </h2>
                  <AddressForm
                    isSubmitting={isSubmitting}
                    showDefaultCheckbox={false}
                    showSubmitButton={false}
                    formRef={(form) => (addressFormRef.current = form)}
                    onLocationChange={handleGuestLocationChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:bg-muted col-span-1 space-y-6 p-5 lg:p-16 flex justify-center lg:justify-start">
          <div className="flex-1 max-w-lg space-y-6">
            <h2 className="text-lg font-medium tracking-tight">
              Ringkasan Pesanan
            </h2>

            {cartQuery.isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Memuat keranjang...</p>
              </div>
            ) : (
              <OrderSummaryCard
                cartItems={cartItems}
                onCheckout={handleCheckout}
                isSubmitting={isSubmitting}
                disabled={isCheckoutDisabled}
                shippingCost={selectedShippingOption?.cost ?? null}
                courierName={
                  selectedShippingOption
                    ? `${selectedShippingOption.courierName} - ${selectedShippingOption.serviceName}`
                    : null
                }
                isCalculatingShipping={calculateShipping.isPending}
                shippingOptions={shippingOptions}
                selectedShippingOption={selectedShippingOption}
                onSelectShipping={setSelectedShippingOption}
                shippingError={shippingError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
