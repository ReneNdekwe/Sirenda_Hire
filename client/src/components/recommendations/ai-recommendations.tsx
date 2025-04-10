import { useQuery } from "@tanstack/react-query";
import { Vehicle } from "@shared/schema";
import { Link } from "wouter";
import { LightbulbIcon, StarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

// Extended Vehicle type with recommendation data
interface RecommendedVehicle extends Vehicle {
  recommendationScore: number;
  recommendationReason: string;
}

export default function AIRecommendations() {
  const { user } = useAuth();

  // Only fetch recommendations if we have a logged-in client user
  const shouldFetch = user?.userType === 'client';

  const { data: recommendations, isLoading, error } = useQuery<RecommendedVehicle[]>({
    queryKey: ['/api/recommendations'],
    queryFn: async ({ signal }) => {
      const response = await fetch('/api/recommendations', { signal });
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      return response.json();
    },
    enabled: shouldFetch, // Only fetch if user is logged in and is a client
  });

  if (!shouldFetch) {
    return null; // Don't show anything for non-client users or not logged in
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 my-8">
        <div className="flex items-center gap-2 mb-4">
          <LightbulbIcon className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Unable to load recommendations. Please try again later.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 my-8">
        <div className="flex items-center gap-2 mb-4">
          <LightbulbIcon className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Skeleton className="h-24 w-full mb-3 rounded-md" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Skeleton className="h-9 w-1/3" />
                <Skeleton className="h-9 w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 my-8">
        <div className="flex items-center gap-2 mb-4">
          <LightbulbIcon className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Not enough data to generate personalized recommendations yet. 
          Browse more vehicles or make your first booking to get tailored suggestions.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 my-8">
      <div className="flex items-center gap-2 mb-6">
        <LightbulbIcon className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Personalized Recommendations for You</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden">
            <div className="relative h-48 bg-gray-100">
              {vehicle.imageUrls && Array.isArray(vehicle.imageUrls) && vehicle.imageUrls.length > 0 ? (
                <img 
                  src={vehicle.imageUrls[0] as string} 
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white">
                  {Math.round(vehicle.recommendationScore * 100)}% Match
                </Badge>
              </div>
            </div>

            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{vehicle.brand} {vehicle.model}</CardTitle>
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-sm">{vehicle.rating || 'New'}</span>
                </div>
              </div>
              <CardDescription className="flex justify-between">
                <span>${vehicle.pricePerDay} / day</span>
                <span>{vehicle.location}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-2">
              <p className="text-sm text-muted-foreground mb-2">
                {vehicle.recommendationReason}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline">{vehicle.fuel}</Badge>
                <Badge variant="outline">{vehicle.transmission}</Badge>
                <Badge variant="outline">{vehicle.seats} seats</Badge>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex justify-between">
              <Button variant="outline" asChild>
                <Link to={`/vehicles/${vehicle.id}`}>View Details</Link>
              </Button>
              <Button asChild>
                <Link to={`/booking/${vehicle.id}`}>Book Now</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}