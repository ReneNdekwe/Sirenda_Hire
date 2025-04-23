import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Vehicle } from "@shared/schema";
import VehicleCard from "@/components/vehicles/vehicle-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import Hero from "@/components/home/hero";
import BrowseByOccasion from "@/components/home/browse-by-occasion";

export default function HomePage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const isClient = user && user.userType === 'client';

  // Fetch available vehicles
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Custom Hero Component with Rwandan locations */}
        <Hero />

        {/* Browse by Occasion Section */}
        <BrowseByOccasion />

        {/* Vehicle listings section */}
        <section className="relative isolate overflow-hidden pt-6 pb-4 bg-gradient-to-br from-[#ff80b5] to-[#9089fc]">
          <div className="absolute inset-0 -z-10 bg-white/100 backdrop-blur-xl"></div>
          <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              
              {/* Browse controls */}
              <div className="flex justify-between items-center flex-wrap gap-2 mb-10">
                <h3 className="text-2xl font-bold tracking-tight">Available Vehicles</h3>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/vehicles')}
                    className="font-medium"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    All Filters
                  </Button>
                </div>
              </div>

              {/* Vehicle grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-4">
                        <div className="flex justify-between mb-3">
                          <div>
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <div className="text-right">
                            <Skeleton className="h-5 w-16 mb-1" />
                          </div>
                        </div>
                        <Skeleton className="h-9 w-full mt-3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : vehicles && vehicles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {vehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500">No vehicles available at the moment.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => window.location.reload()}
                  >
                    Refresh
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
