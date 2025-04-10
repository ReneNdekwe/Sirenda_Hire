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
import { X, Filter } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  priceRange = [0, 500],
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
    priceRange,
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
      priceRange: [0, 500],
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <Accordion type="single" collapsible defaultValue="category">
        <AccordionItem value="category">
          <AccordionTrigger>Vehicle Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
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

        <AccordionItem value="location">
          <AccordionTrigger>Location</AccordionTrigger>
          <AccordionContent>
            <Select
              value={filters.location}
              onValueChange={(value) => handleFilterChange("location", value)}
            >
              <SelectTrigger>
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

        <AccordionItem value="price">
          <AccordionTrigger>Price Range ($ per day)</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                defaultValue={filters.priceRange}
                value={filters.priceRange}
                max={500}
                step={10}
                onValueChange={(value) => handleFilterChange("priceRange", value)}
              />
              <div className="flex justify-between">
                <span className="text-sm">${filters.priceRange[0]}</span>
                <span className="text-sm">${filters.priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="specs">
          <AccordionTrigger>Vehicle Specifications</AccordionTrigger>
          <AccordionContent>
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

        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
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

      <Button className="w-full mt-4" onClick={applyFilters}>
        Apply Filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop filter */}
      <div className="hidden md:block sticky top-20 h-fit">
        {filterContent}
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
            <div className="h-full overflow-auto py-4">{filterContent}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
