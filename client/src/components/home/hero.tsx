import { useState } from "react";
import { useLocation } from "wouter";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar } from "lucide-react";

const LOCATIONS = [
  "Kigali, RW",
  "Musanze, RW",
  "Rubavu, RW",
  "Karongi, RW",
  "Rusizi, RW",
];

export default function Hero() {
  const [, navigate] = useLocation();
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();

    if (location) {
      searchParams.set("location", location);
    }

    if (pickupDate) {
      searchParams.set("pickupDate", pickupDate.toISOString().split("T")[0]);
    }

    if (returnDate) {
      searchParams.set("returnDate", returnDate.toISOString().split("T")[0]);
    }

    navigate(`/vehicles?${searchParams.toString()}`);
  };

  return (
    <section className="relative bg-white pb-12 pt-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h1 className="hero-title">
            Carhiring Re-imagined
          </h1>
          <p className="mt-4 text-xl font-light text-gray-600 leading-relaxed">
            Discover and book unique vehicles from trusted rental companies
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 overflow-hidden"
          >
            <div className="grid gap-4 md:grid-cols-4 md:gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Select onValueChange={setLocation}>
                  <SelectTrigger className="w-full border-gray-300 focus:ring-primary/25 focus:border-primary">
                    <SelectValue placeholder="Where to?">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">
                          {location || "Where to?"}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pick-up Date
                </label>
                <div className="relative">
                  <DatePicker
                    date={pickupDate}
                    setDate={setPickupDate}
                    placeholder="Add date"
                    className="border-gray-300 focus:ring-primary/25 focus:border-primary"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Date
                </label>
                <div className="relative">
                  <DatePicker
                    date={returnDate}
                    setDate={setReturnDate}
                    placeholder="Add date"
                    fromDate={pickupDate}
                    className="border-gray-300 focus:ring-primary/25 focus:border-primary"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 flex items-end">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
                >
                  <Search className="h-4 w-4 mr-2" />
                  <span>Search</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
