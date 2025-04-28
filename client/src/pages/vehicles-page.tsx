import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Vehicle } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import VehicleCard from "@/components/vehicles/vehicle-card";
import VehicleFilter from "@/components/vehicles/vehicle-filter";
import { useAuth } from "@/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  MapPin,
  Car,
  SearchX,
  RotateCcw,
  Filter as FilterIcon,
} from "lucide-react";
import { formatPrice } from "@/lib/currency";

export default function VehiclesPage() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const { user } = useAuth();
  const isClient = user && user.userType === "client";

  const [filters, setFilters] = useState({
    categoryId: searchParams.get("categoryId") || undefined,
    location: searchParams.get("location") || "All Locations",
    available: true,
    priceRange: [0, 1000000] as [number, number],
    seats: "any",
    transmission: "any",
    fuel: "any",
    occasion: searchParams.get("occasion") || undefined,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("recommended");

  // Parse pickup and return dates from URL if present
  const pickupDate = searchParams.get("pickupDate")
    ? new Date(searchParams.get("pickupDate")!)
    : undefined;

  const returnDate = searchParams.get("returnDate")
    ? new Date(searchParams.get("returnDate")!)
    : undefined;

  // Prepare API query parameters
  const queryParams: Record<string, string> = {};

  if (filters.categoryId) {
    queryParams.categoryId = filters.categoryId;
  }

  if (filters.location !== "All Locations") {
    queryParams.location = filters.location;
  }

  if (filters.available !== undefined) {
    queryParams.available = String(filters.available);
  }

  if (filters.occasion) {
    queryParams.occasion = filters.occasion;
  }

  // Fetch vehicles based on filters
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles", queryParams],
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);

    // Update URL with filters
    const params = new URLSearchParams();

    if (newFilters.categoryId) {
      params.set("categoryId", newFilters.categoryId);
    }

    if (newFilters.location && newFilters.location !== "All Locations") {
      params.set("location", newFilters.location);
    }

    if (pickupDate) {
      params.set("pickupDate", pickupDate.toISOString().split("T")[0]);
    }

    if (returnDate) {
      params.set("returnDate", returnDate.toISOString().split("T")[0]);
    }

    setLocation(`/vehicles?${params.toString()}`);
  };

  // Filter and sort vehicles
  const filteredVehicles = vehicles
    ? vehicles
        .filter((vehicle) => {
          // Apply price filter
          if (
            vehicle.pricePerDay < filters.priceRange[0] ||
            vehicle.pricePerDay > filters.priceRange[1]
          ) {
            return false;
          }

          // Apply seats filter
          if (filters.seats !== "any") {
            const requiredSeats = parseInt(filters.seats);
            if (vehicle.seats < requiredSeats) {
              return false;
            }
          }

          // Apply transmission filter
          if (
            filters.transmission !== "any" &&
            vehicle.transmission !== filters.transmission
          ) {
            return false;
          }

          // Apply fuel filter
          if (filters.fuel !== "any" && vehicle.fuel !== filters.fuel) {
            return false;
          }

          // Apply search query
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
              vehicle.brand.toLowerCase().includes(query) ||
              vehicle.model.toLowerCase().includes(query) ||
              `${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(query)
            );
          }

          return true;
        })
        .sort((a, b) => {
          switch (sortOption) {
            case "price-low":
              return a.pricePerDay - b.pricePerDay;
            case "price-high":
              return b.pricePerDay - a.pricePerDay;
            case "rating":
              return (b.rating || 0) - (a.rating || 0);
            default:
              // Default sorting (recommended)
              return b.isFeatured ? 1 : -1;
          }
        })
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Search section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 md:p-8 rounded-xl shadow-sm mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
                Find Affordable Cars in Rwanda
              </h1>
              <p className="text-gray-600 mb-6 max-w-xl">
                Browse our selection of cars available in Kigali and across Rwanda.
              </p>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Search by brand, model, or location in Rwanda..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-200 focus:ring-primary"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>

                  <div className="w-full md:w-60">
                    <Select
                      value={filters.location}
                      onValueChange={(value) =>
                        handleFilterChange({ ...filters, location: value })
                      }
                    >
                      <SelectTrigger className="border-gray-200">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          <SelectValue placeholder="Select location" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "All Locations",
                          "Kigali, RW",
                          "Musanze, RW",
                          "Rubavu, RW",
                          "Karongi, RW",
                          "Rusizi, RW",
                        ].map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full md:w-auto bg-primary hover:bg-primary/90">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                {(pickupDate || returnDate) && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md flex items-center justify-between">
                    <div className="text-sm text-primary">
                      <span className="font-semibold">Selected dates:</span>{" "}
                      {pickupDate?.toLocaleDateString()} -{" "}
                      {returnDate?.toLocaleDateString()}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/90 hover:bg-primary/10"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.delete("pickupDate");
                        params.delete("returnDate");
                        setLocation(`/vehicles?${params.toString()}`);
                      }}
                    >
                      Change
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Filters sidebar */}
            <aside className="col-span-12 lg:col-span-3 lg:mb-0">
              <div className="bg-white rounded-xl shadow-sm p-5 sticky top-4">
                <h3 className="font-semibold mb-4 flex items-center text-gray-900">
                  <FilterIcon className="h-4 w-4 mr-2 text-primary" /> Refine
                  Results
                </h3>
                <VehicleFilter
                  categoryId={filters.categoryId}
                  location={filters.location}
                  available={filters.available}
                  priceRange={filters.priceRange}
                  seats={filters.seats}
                  transmission={filters.transmission}
                  fuel={filters.fuel}
                  onFilterChange={handleFilterChange}
                />
              </div>
            </aside>

            {/* Main content */}
            <div className="col-span-12 lg:col-span-9">
              {/* Results summary and sort */}
              <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="font-bold flex items-center">
                  <Car className="h-4 w-4 mr-2 text-primary" />
                  {isLoading
                    ? "Loading vehicles..."
                    : `${filteredVehicles.length} vehicles available`}
                </h2>
                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-[180px] border-gray-200">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="price-low">
                        Price (Low to High)
                      </SelectItem>
                      <SelectItem value="price-high">
                        Price (High to Low)
                      </SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Vehicle grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <Skeleton className="h-40 w-full" />
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredVehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SearchX className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    No vehicles found
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Try adjusting your filters or search criteria to find
                    vehicles that match your needs.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({
                        categoryId: undefined,
                        location: "All Locations",
                        available: true,
                        priceRange: [0, 1000000],
                        seats: "any",
                        transmission: "any",
                        fuel: "any",
                        occasion: undefined,
                      });
                      setSearchQuery("");
                      setSortOption("recommended");
                      setLocation("/vehicles");
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
