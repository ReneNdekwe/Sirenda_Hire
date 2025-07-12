import { useState, useEffect } from "react";
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
import { format, addDays } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LOCATIONS = [
  "Kigali City Center",
  "Kacyiru",
  "Remera",
  "Kimironko",
  "Kicukiro"
];

export default function Hero() {
  const [, navigate] = useLocation();
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);

  // Set default dates when component mounts
  useEffect(() => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    setPickupDate(today);
    setReturnDate(tomorrow);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();

    if (location) {
      searchParams.set("location", location);
    }

    if (pickupDate) {
      searchParams.set("pickupDate", format(pickupDate, 'yyyy-MM-dd'));
    }

    if (returnDate) {
      searchParams.set("returnDate", format(returnDate, 'yyyy-MM-dd'));
    }

    navigate(`/vehicles?${searchParams.toString()}`);
  };

  return (
    <section className="relative isolate overflow-hidden pt-6 pb-6">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50"></div>

      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 -z-20 opacity-20"
        style={{
          backgroundImage: 'url("/uploads/hero.avif")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Decorative elements */}
      <div className="absolute inset-0 -z-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.08),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(168,85,247,0.08),rgba(255,255,255,0))]"></div>
      </div>

      {/* Abstract shapes */}
      <div className="absolute inset-0 -z-40 overflow-hidden">
        {/* Floating circles */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[100px] animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-purple-400/20 blur-[100px] animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-400/20 blur-[100px] animate-float"></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-500/10 to-transparent transform rotate-45 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-purple-500/10 to-transparent transform -rotate-45 -translate-x-1/2 translate-y-1/2"></div>
        
        {/* Dots pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-30px) scale(1.1);
            }
          }
          @keyframes float-delayed {
            0%, 100% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-40px) scale(1.15);
            }
          }
          .animate-float {
            animation: float 12s ease-in-out infinite;
          }
          .animate-float-delayed {
            animation: float-delayed 15s ease-in-out infinite;
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
        <div className="flex flex-col items-center justify-center min-h-[40vh] py-4">
          <div className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.2] text-black mb-3">
              <span className="block sm:inline">
                <span className="text-green-600">Book it</span>
                <span>.</span>
              </span>
              <span className="block sm:inline sm:ml-2">Go anywhere.</span>
            </h1>
            <p className="text-md sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Rent a car with doorstep delivery. Your journey starts here.
            </p>
          </div>

          <div className="w-full max-w-4xl bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 md:gap-1 items-stretch md:items-center">
              <div className="flex-1 w-full">
                <Select onValueChange={setLocation}>
                  <SelectTrigger className="w-full border-0 focus:ring-0 focus:ring-offset-0 h-10 text-sm bg-transparent hover:bg-gray-50 rounded-md">
                    <SelectValue placeholder="Pick-up location">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="truncate text-black">
                          {location || "Pick-up location"}
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

              <div className="w-full h-px md:w-px md:h-6 bg-gray-200 md:mx-1"></div>

              <div className="flex-1 w-full">
                <DatePicker
                  date={pickupDate}
                  setDate={setPickupDate}
                  placeholder="Pick-up date"
                  className="border-0 focus:ring-0 focus:ring-offset-0 h-10 text-sm bg-transparent hover:bg-gray-50 rounded-md text-black placeholder:text-black"
                  fromDate={new Date()}
                  disabled={(date) => {
                    const today = new Date();
                    const maxDate = new Date();
                    maxDate.setDate(today.getDate() + 10);
                    return date < today || date > maxDate;
                  }}
                />
              </div>

              <div className="w-full h-px md:w-px md:h-6 bg-gray-200 md:mx-1"></div>

              <div className="flex-1 w-full">
                <DatePicker
                  date={returnDate}
                  setDate={setReturnDate}
                  placeholder="Return date"
                  fromDate={pickupDate ? new Date(pickupDate.getTime() + 24 * 60 * 60 * 1000) : new Date()}
                  className="border-0 focus:ring-0 focus:ring-offset-0 h-10 text-sm bg-transparent hover:bg-gray-50 rounded-md text-black placeholder:text-black"
                  disabled={(date) => !pickupDate || date < pickupDate}
                />
              </div>

              <div className="w-full h-px md:w-px md:h-6 bg-gray-200 md:mx-1"></div>

              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 px-6 h-10 w-full md:w-auto"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </form>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center italic">
            Book up to 10 days in advance <span className="text-red-500">*</span>
          </p>
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

