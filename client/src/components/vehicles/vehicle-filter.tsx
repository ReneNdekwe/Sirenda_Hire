import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Category } from "@shared/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X, Filter, Car, MapPin, DollarSign, Settings, Calendar } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const LOCATIONS = [
  "All Locations",
  "Kigali, RW",
  "Musanze, RW",
  "Rubavu, RW",
  "Karongi, RW",
  "Rusizi, RW",
];

const SEATS = [
  { value: "any", label: "Any" },
  { value: "2", label: "2+ Seats" },
  { value: "4", label: "4+ Seats" },
  { value: "5", label: "5+ Seats" },
  { value: "7", label: "7+ Seats" },
];

const TRANSMISSION = [
  { value: "any", label: "Any" },
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
];

const FUEL = [
  { value: "any", label: "Any" },
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
];

interface FilterProps {
  categoryId?: string;
  location?: string;
  available?: boolean;
  priceRange?: [number, number];
  seats?: string;
  transmission?: string;
  fuel?: string;
  onFilterChange: (filters: any) => void;
}

export default function VehicleFilter({
  categoryId,
  location,
  available = true,
  priceRange = [0, 500000],
  seats = "any",
  transmission = "any",
  fuel = "any",
  onFilterChange,
}: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    categoryId,
    location: location || "All Locations",
    available,
    priceRange: priceRange || [0, 1000000],
    seats,
    transmission,
    fuel,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const resetFilters = {
      categoryId: undefined,
      location: "All Locations",
      available: true,
      priceRange: [0, 1000000] as [number, number],
      seats: "any",
      transmission: "any",
      fuel: "any",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  // Set initial filters from props
  useEffect(() => {
    setFilters({
      categoryId,
      location: location || "All Locations",
      available,
      priceRange,
      seats,
      transmission,
      fuel,
    });
  }, [categoryId, location, available, priceRange, seats, transmission, fuel]);

  const filterContent = (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetFilters}
          className="text-gray-500 hover:text-gray-900"
        >
          <X className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <Accordion type="single" collapsible defaultValue="category" className="space-y-4">
        <AccordionItem value="category" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center">
              <Car className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">Vehicle Category</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="category-all"
                  checked={!filters.categoryId}
                  onCheckedChange={() => handleFilterChange("categoryId", undefined)}
                />
                <label
                  htmlFor="category-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  All Categories
                </label>
              </div>
              {categories?.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={String(filters.categoryId) === String(category.id)}
                    onCheckedChange={() =>
                      handleFilterChange("categoryId", category.id)
                    }
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="location" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">Location</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <Select
              value={filters.location}
              onValueChange={(value) => handleFilterChange("location", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">Price Range</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{filters.priceRange[0].toLocaleString()} RWF</span>
                <span>{filters.priceRange[1].toLocaleString()} RWF</span>
              </div>
              <Slider
                defaultValue={filters.priceRange}
                value={filters.priceRange}
                max={1000000}
                step={10000}
                onValueChange={(value) => handleFilterChange("priceRange", value)}
                className="py-4"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="specs" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">Vehicle Specifications</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Seats</label>
                <Select
                  value={filters.seats}
                  onValueChange={(value) => handleFilterChange("seats", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select seats" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEATS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Transmission</label>
                <Select
                  value={filters.transmission}
                  onValueChange={(value) => handleFilterChange("transmission", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSMISSION.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Fuel Type</label>
                <Select
                  value={filters.fuel}
                  onValueChange={(value) => handleFilterChange("fuel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">Availability</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="available"
                checked={filters.available}
                onCheckedChange={(checked) =>
                  handleFilterChange("available", checked)
                }
              />
              <label
                htmlFor="available"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show only available vehicles
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button className="w-full" onClick={applyFilters}>
        Apply Filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop filter */}
      <div className="hidden md:block sticky top-20 h-fit">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {filterContent}
        </div>
      </div>

      {/* Mobile filter */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-md">
            <SheetTitle className="sr-only">Filter Vehicles</SheetTitle>
            <div className="h-full overflow-auto py-4">{filterContent}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
