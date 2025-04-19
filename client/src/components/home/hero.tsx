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
    <section className="relative isolate overflow-hidden pt-20 pb-12 bg-gradient-to-br from-[#ff80b5] to-[#9089fc]">
      <div className="absolute inset-0 -z-10 bg-white/100 backdrop-blur-xl"></div>


  {/* Top background swirl */}
  <div
    aria-hidden="true"
    className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
  >
    <div
      style={{
        clipPath:
          'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
      }}
      className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
    />
  </div>

  {/* Main content */}
  <div className="max-w-7xl mx-auto">
    <div className="w-full max-w-6xl mx-auto">
      <div className="mx-auto max-w-3xl text-center mb-10">
        <h2 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-gray-900 max-w-4xl mx-auto leading-[1.2]">
       <span className="text-blue-800">Re-imagining</span> Carhiring,
        </h2>
        <p className="mt-4 text-lg sm:text-xl text-gray-400">
        changing the way you rent, forever.
  </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <form
          onSubmit={handleSearch}
          className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 overflow-hidden"
        >
          <div className="grid gap-4 md:grid-cols-4 md:gap-6">
            {/* Location */}
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

            {/* Pickup Date */}
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

            {/* Return Date */}
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

            {/* Submit Button */}
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
  </div>

  {/* Bottom background swirl */}
  <div
    aria-hidden="true"
    className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
  >
    <div
      style={{
        clipPath:
          'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
      }}
      className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
    />
  </div>
</section>

  );
}
