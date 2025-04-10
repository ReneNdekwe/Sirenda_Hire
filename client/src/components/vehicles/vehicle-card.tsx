import { useState } from "react";
import { Link } from "wouter";
import { Vehicle } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Users, Cog, Fuel, Briefcase, StarHalf, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const [liked, setLiked] = useState(false);

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
  };

  const yearText = vehicle.year ? ` • ${vehicle.year}` : '';

  return (
    <div className="group bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all duration-300">
      <div className="relative">
        <div className="h-40 bg-gray-100 overflow-hidden">
          {vehicle.imageUrls && Array.isArray(vehicle.imageUrls) && vehicle.imageUrls.length > 0 ? (
            <img
              src={vehicle.imageUrls[0] as string}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <span className="text-primary/40 text-xl font-semibold">{vehicle.brand.charAt(0)}{vehicle.model.charAt(0)}</span>
            </div>
          )}
        </div>
        
        {vehicle.isFeatured && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-primary to-primary/80 text-white rounded-full px-2 py-0.5 text-xs font-medium tracking-wide shadow-sm">
            Featured
          </div>
        )}
        
        <button
          className={cn(
            "absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center shadow-sm hover:shadow-md focus:outline-none transition-all z-10",
            liked ? "text-red-500 scale-110" : "text-gray-400 hover:text-red-500"
          )}
          onClick={toggleLike}
          aria-label="Like vehicle"
        >
          <Heart className={cn("h-4 w-4 transition-transform", liked && "fill-current scale-110")} />
        </button>
      </div>

      <div className="p-4">
        {vehicle.location && (
          <div className="flex items-center text-gray-500 text-xs mb-2">
            <MapPin className="h-3 w-3 mr-1 text-primary/70" />
            <span className="truncate font-light">{vehicle.location}</span>
          </div>
        )}
        
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-base text-gray-900 group-hover:text-primary transition-colors">
              {vehicle.brand} {vehicle.model}<span className="text-gray-500 text-xs font-light ml-1">{yearText}</span>
            </h3>
            <div className="flex items-center mt-1">
              <div className="flex text-yellow-500">
                {Array.from({ length: Math.floor(vehicle.rating || 0) }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-current" />
                ))}
                {vehicle.rating && vehicle.rating % 1 > 0 && (
                  <StarHalf className="h-3 w-3 fill-current" />
                )}
                {Array.from({ length: Math.max(0, 5 - Math.ceil(vehicle.rating || 0)) }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 text-gray-200" />
                ))}
              </div>
              <span className="text-gray-500 text-xs ml-1 font-light">
                {vehicle.reviewCount || 0} reviews
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-primary">
                ${vehicle.pricePerDay}
                <span className="text-xs font-light text-gray-500 ml-1">/day</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary hover:bg-primary/10 gap-1 text-xs py-0">
            <Users className="h-2.5 w-2.5" />
            <span>{vehicle.seats}</span>
          </Badge>
          <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary hover:bg-primary/10 gap-1 text-xs py-0">
            <Cog className="h-2.5 w-2.5" />
            <span>{vehicle.transmission}</span>
          </Badge>
          <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary hover:bg-primary/10 gap-1 text-xs py-0">
            <Fuel className="h-2.5 w-2.5" />
            <span>{vehicle.fuel}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link href={`/vehicles/${vehicle.id}`}>
            <Button variant="outline" size="sm" className="w-full border-primary/20 text-primary hover:bg-primary/5 text-xs px-2 font-medium">
              View Details
            </Button>
          </Link>
          <Link href={`/booking/${vehicle.id}`}>
            <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs px-2 font-bold">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
