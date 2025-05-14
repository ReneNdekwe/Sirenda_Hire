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
    <section className="relative isolate overflow-hidden pt-10 pb-6">
      <div className="absolute inset-0 -z-10 bg-white/100 backdrop-blur-xl"></div>

      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 -z-20"
        style={{
          background: 'linear-gradient(125deg,#1338BE,#e73c7e,#1338BE)',
          backgroundSize: '300% 300%',
          animation: 'gradient 10s ease infinite'
        }}
      />

      <style>
        {`
          @keyframes gradient {
            0% {
              background-position: 150% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          @keyframes moveGradient {
            0% {
              background-position: 200% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `}
      </style>

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
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Hero Content */}
          <div className="space-y-12">
            <div className="text-center">
              <h1 className="text-4xl sm:text-4xl lg:text-4xl font-extrabold tracking-tight leading-[1.2]">
                <span 
                  style={{
                    background: 'linear-gradient(to left, #00A1DE 0%, #FAD201 33%,rgb(217, 215, 215) 66%, #00A1DE 100%)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'moveGradient 4s linear infinite'
                  }}
                >
                  Rent a car in Rwanda in a few steps!
                </span>
              </h1>
              
            </div>

            {/* Modern Process Cards - Hidden on mobile */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-blue-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-all duration-300">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">Choose Vehicle</h3>
                  <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">Browse our premium collection</p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-purple-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-all duration-300">
                    <span className="text-2xl font-bold text-purple-600">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">Select Dates</h3>
                  <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">Pick your rental period</p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-pink-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-all duration-300">
                    <span className="text-2xl font-bold text-pink-600">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors duration-300">Book & Enjoy</h3>
                  <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">Start your journey</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Date Picker Form */}
          <div className="bg-white/100 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-8">
            <form onSubmit={handleSearch} className="space-y-8">
              <div>
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

              <div className="grid grid-cols-2 gap-6">
                <div>
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

                <div>
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
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-6"
              >
                <Search className="h-4 w-4 mr-2" />
                <span>Search Vehicles</span>
              </Button>
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
