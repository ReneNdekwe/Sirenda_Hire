import { useQuery } from "@tanstack/react-query";
import { Vehicle } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function FeaturedVehicles() {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;

  const { data: featuredVehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles/featured'],
  });

  const totalPages = featuredVehicles ? Math.ceil(featuredVehicles.length / itemsPerPage) : 0;
  
  const currentVehicles = featuredVehicles
    ? featuredVehicles.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
    : [];

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Featured vehicles
          </h2>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8 rounded-full border-gray-200 text-gray-700"
              onClick={handlePrevious}
              disabled={currentPage === 0 || isLoading || totalPages === 0}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8 rounded-full border-gray-200 text-gray-700"
              onClick={handleNext}
              disabled={currentPage >= totalPages - 1 || isLoading || totalPages === 0}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : totalPages === 0 ? (
          <div className="text-center py-16 border-t border-gray-100">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No featured vehicles found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We're constantly updating our inventory with premium vehicles. Check back soon or browse all available vehicles.
            </p>
            <Link href="/vehicles">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Browse All Vehicles
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentVehicles.map((vehicle) => (
              <VehicleCardAirbnb key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="pt-4 pb-2 text-center text-gray-500 text-sm">
            {currentPage + 1} of {totalPages}
          </div>
        )}
      </div>
    </section>
  );
}

function VehicleCardAirbnb({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link href={`/vehicles/${vehicle.id}`}>
      <a className="group block">
        <div className="aspect-[4/3] relative overflow-hidden rounded-xl mb-2">
          {vehicle.imageUrls && vehicle.imageUrls[0] ? (
            <img
              src={vehicle.imageUrls[0] as string}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-2xl font-semibold">{vehicle.brand.charAt(0)}{vehicle.model.charAt(0)}</span>
            </div>
          )}
          {vehicle.isFeatured && (
            <div className="absolute top-2 left-2 z-10">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-black/60 text-white">
                Featured
              </span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
              {vehicle.brand} {vehicle.model}
            </h3>
            
            {vehicle.location && (
              <p className="text-gray-500 text-sm mt-1">
                {vehicle.location}
              </p>
            )}
            
            <div className="flex items-center mt-1 text-sm">
              <div className="flex items-center text-gray-700">
                <Star className="h-3.5 w-3.5 fill-current text-primary" />
                <span className="ml-1 font-medium">{vehicle.rating || '5.0'}</span>
                <span className="mx-1 text-gray-400">·</span>
                <span className="text-gray-500">({vehicle.reviewCount || 0} reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              ${vehicle.pricePerDay}
              <span className="text-sm font-normal text-gray-500">/day</span>
            </p>
          </div>
        </div>
      </a>
    </Link>
  );
}
