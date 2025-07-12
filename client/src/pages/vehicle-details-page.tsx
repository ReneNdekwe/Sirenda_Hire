import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Vehicle, Review } from "@shared/schema";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ImageLightbox from "@/components/vehicles/image-lightbox";
import {
  Heart,
  Star,
  Users,
  Cog,
  Fuel,
  Briefcase,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  StarHalf,
} from "lucide-react";
import { format, addDays, differenceInDays, parse, startOfDay } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/currency";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function VehicleDetailsPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const vehicleId = parseInt(params.id);

  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Fetch vehicle details
  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${vehicleId}`],
  });

  // Fetch vehicle availability
  const { data: bookedDates } = useQuery<Array<{ start: string; end: string }>>({
    queryKey: [`/api/vehicles/${vehicleId}/availability`],
    enabled: !!vehicleId,
  });

  // Fetch vehicle reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: [`/api/reviews/${vehicleId}`],
    enabled: !!vehicleId,
  });

  const handlePrevImage = () => {
    if (!vehicle || !vehicle.imageUrls) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? (vehicle.imageUrls as string[]).length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!vehicle || !vehicle.imageUrls) return;
    setCurrentImageIndex((prev) =>
      prev === (vehicle.imageUrls as string[]).length - 1 ? 0 : prev + 1
    );
  };

  const handleBookNow = () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!pickupDate || !returnDate) {
      return;
    }

    const searchParams = new URLSearchParams();
    searchParams.set("pickupDate", format(pickupDate, 'yyyy-MM-dd'));
    searchParams.set("returnDate", format(returnDate, 'yyyy-MM-dd'));
    
    navigate(`/booking/${vehicleId}?${searchParams.toString()}`);
  };

  const totalDays = pickupDate && returnDate ? differenceInDays(returnDate, pickupDate) + 1 : 0;
  const totalPrice = vehicle?.pricePerDay ? totalDays * vehicle.pricePerDay : 0;

  const handlePickupDateChange = (date: Date | undefined) => {
    if (!date) {
      setPickupDate(undefined);
      setReturnDate(undefined);
      return;
    }

    const newPickupDate = startOfDay(date);
    setPickupDate(newPickupDate);
    
    if (!returnDate || returnDate <= newPickupDate) {
      setReturnDate(addDays(newPickupDate, 1));
    }
  };

  const isDateBooked = (date: Date) => {
    if (!bookedDates) return false;

    const checkDate = startOfDay(date);

    return bookedDates.some(booking => {
      const start = startOfDay(new Date(booking.start));
      const end = startOfDay(new Date(booking.end));

      return checkDate >= start && checkDate <= end;
    });
  };

  const getNextAvailableDate = (fromDate: Date): Date => {
    const date = new Date(fromDate);
    date.setHours(0, 0, 0, 0);

    while (isDateBooked(date)) {
      date.setDate(date.getDate() + 1);
    }

    return date;
  };

  const isDateRangeAvailable = (start: Date, end: Date) => {
    if (!bookedDates) return true;

    const checkStart = new Date(start);
    const checkEnd = new Date(end);
    checkStart.setHours(0, 0, 0, 0);
    checkEnd.setHours(0, 0, 0, 0);

    return !bookedDates.some(booking => {
      const bookedStart = new Date(booking.start);
      const bookedEnd = new Date(booking.end);
      bookedStart.setHours(0, 0, 0, 0);
      bookedEnd.setHours(0, 0, 0, 0);

      // Check for any overlap
      return (
        (checkStart <= bookedEnd && checkEnd >= bookedStart) ||
        (bookedStart <= checkEnd && bookedEnd >= checkStart)
      );
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8">
                <Skeleton className="h-96 md:w-2/3 rounded-lg" />
                <div className="md:w-1/3 space-y-4">
                  <Skeleton className="h-12 w-4/5" />
                  <Skeleton className="h-6 w-3/5" />
                  <Skeleton className="h-4 w-2/5" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-10 w-20 rounded-full" />
                    <Skeleton className="h-10 w-20 rounded-full" />
                    <Skeleton className="h-10 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-48 mt-4" />
                </div>
              </div>
            </div>
          ) : vehicle ? (
            <>
              {/* Back button */}
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => navigate("/vehicles")}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to all vehicles
              </Button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vehicle images */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-4 gap-2 h-[450px]">
                      <div 
                        className="col-span-4 md:col-span-3 relative h-full bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => setIsLightboxOpen(true)}
                      >
                        {(vehicle.imageUrls as string[] | null) && 
                         Array.isArray(vehicle.imageUrls) && 
                         (vehicle.imageUrls as string[]).length > currentImageIndex && (
                          <img
                            src={(vehicle.imageUrls as string[])[currentImageIndex]}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {/* Navigation arrows */}
                        {Array.isArray(vehicle.imageUrls) && 
                         (vehicle.imageUrls as string[]).length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrevImage();
                              }}
                              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center shadow hover:shadow-md transition-colors backdrop-blur-sm"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="h-5 w-5 text-gray-700" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNextImage();
                              }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center shadow hover:shadow-md transition-colors backdrop-blur-sm"
                              aria-label="Next image"
                            >
                              <ChevronRight className="h-5 w-5 text-gray-700" />
                            </button>
                          </>
                        )}
                      </div>
                      <div className="hidden md:flex md:col-span-1 flex-col gap-2">
                        {(vehicle.imageUrls as string[] | null) && 
                         Array.isArray(vehicle.imageUrls) && 
                         (vehicle.imageUrls as string[]).slice(0, 3).map((url, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`h-[146px] rounded-lg overflow-hidden relative ${
                              currentImageIndex === index ? 'ring-2 ring-primary' : ''
                            }`}
                          >
                            <img
                              src={url}
                              alt={`${vehicle.brand} ${vehicle.model} view ${index + 1}`}
                              className="w-full h-full object-cover transition-transform hover:scale-105"
                            />
                            <div className={`absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors ${
                              currentImageIndex === index ? 'bg-black/10' : ''
                            }`} />
                          </button>
                        ))}
                      </div>
                      <button
                        className="absolute top-4 right-4 bg-white/90 rounded-full w-10 h-10 flex items-center justify-center shadow hover:shadow-md transition-colors backdrop-blur-sm"
                        onClick={() => setLiked(!liked)}
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            liked ? "text-red-500 fill-current" : "text-gray-500"
                          }`}
                        />
                      </button>
                      {vehicle.isFeatured && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-full px-3 py-1 text-sm font-medium shadow-sm">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Image grid instead of thumbnails */}
                    {(vehicle.imageUrls as string[] | null) && 
                     Array.isArray(vehicle.imageUrls) && 
                     (vehicle.imageUrls as string[]).length > 1 && (
                      <div className="p-4">
                        <h3 className="font-medium text-sm mb-3 text-gray-700">Vehicle Photos</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {(vehicle.imageUrls as string[]).map((url, index) => (
                            <button
                              key={index}
                              className={`aspect-square overflow-hidden rounded-lg ${
                                currentImageIndex === index
                                  ? "ring-2 ring-primary"
                                  : "opacity-80 hover:opacity-100"
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                            >
                              <img
                                src={url}
                                alt={`${vehicle.brand} ${vehicle.model} photo ${index + 1}`}
                                className="h-full w-full object-cover transition-transform hover:scale-105"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vehicle details tabs */}
                  <div className="mt-8">
                    <Tabs defaultValue="details">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="features">Features</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                      </TabsList>
                      <TabsContent value="details" className="p-4 bg-white rounded-b-lg shadow-md">
                        <div className="space-y-4">
                          <div>
                            <h1 className="font-semibold text-lg mb-2">Description</h1>
                            <p className="text-gray-700">{vehicle.description || `This ${vehicle.brand} ${vehicle.model} is perfect for your travels in Rwanda. A ${vehicle.year} model with ${vehicle.transmission} transmission, ${vehicle.seats} seats, and ${vehicle.fuel} engine. Great for exploring Kigali and other parts of Rwanda.`}</p>
                          </div>

                          <Separator />

                          <div>
                            <h2 className="font-semibold text-lg mb-2">Specifications</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-gray-500 text-sm">Brand</p>
                                <p className="font-medium">{vehicle.brand}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">Model</p>
                                <p className="font-medium">{vehicle.model}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">Year</p>
                                <p className="font-medium">{vehicle.year}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">Seats</p>
                                <p className="font-medium">{vehicle.seats}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">Transmission</p>
                                <p className="font-medium">{vehicle.transmission}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-sm">Fuel Type</p>
                                <p className="font-medium">{vehicle.fuel}</p>
                              </div>
                              {vehicle.bags && (
                                <div>
                                  <p className="text-gray-500 text-sm">Luggage Capacity</p>
                                  <p className="font-medium">{vehicle.bags} bags</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h3 className="font-semibold text-lg mb-2">Location</h3>
                            <div className="flex items-center">
                              <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                              <p>{vehicle.location}</p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="features" className="p-4 bg-white rounded-b-lg shadow-md">
                        {vehicle.features && 
                         Array.isArray(vehicle.features) && 
                         vehicle.features.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {vehicle.features.map((feature: string, index: number) => (
                              <div key={index} className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No specific features listed for this vehicle.</p>
                        )}
                      </TabsContent>

                      <TabsContent value="reviews" className="p-4 bg-white rounded-b-lg shadow-md">
                        {isLoadingReviews ? (
                          <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1">
                                  <Skeleton className="h-4 w-32 mb-2" />
                                  <Skeleton className="h-4 w-24 mb-4" />
                                  <Skeleton className="h-16 w-full" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : reviews && reviews.length > 0 ? (
                          <div className="space-y-6">
                            {reviews.map((review) => (
                              <div key={review.id} className="pb-4 border-b last:border-0">
                                <div className="flex items-center mb-2">
                                  <Avatar className="h-10 w-10 mr-3">
                                    <AvatarFallback>{review.userId.toString().slice(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">User #{review.userId}</p>
                                    <div className="flex text-yellow-500">
                                      {Array.from({ length: review.rating }).map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-current" />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                                <p className="text-gray-400 text-sm mt-2">
                                  {review.createdAt && new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-500">No reviews yet for this vehicle.</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>

                {/* Booking card */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-20">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <div>
                          {vehicle.brand} {vehicle.model}
                        </div>
                        <div className="text-right">
                          <div className="flex flex-col">
                            <span className="font-bold text-xl text-primary">
                              {formatPrice(vehicle.pricePerDay)}
                              <span className="text-sm font-light text-gray-500 ml-1">/day</span>
                            </span>
                          </div>
                        </div>
                      </CardTitle>
                      <CardDescription>per day</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 gap-1">
                          <Users className="h-3 w-3 text-gray-500" />
                          <span>{vehicle.seats} Seats</span>
                        </Badge>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 gap-1">
                          <Cog className="h-3 w-3 text-gray-500" />
                          <span>{vehicle.transmission}</span>
                        </Badge>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 gap-1">
                          <Fuel className="h-3 w-3 text-gray-500" />
                          <span>{vehicle.fuel}</span>
                        </Badge>
                        {vehicle.bags && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 gap-1">
                            <Briefcase className="h-3 w-3 text-gray-500" />
                            <span>{vehicle.bags} Bags</span>
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center">
                        <div className="flex text-yellow-500 mr-2">
                          {Array.from({ length: Math.floor(vehicle.rating || 0) }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                          {vehicle.rating && vehicle.rating % 1 > 0 && (
                            <StarHalf className="h-4 w-4 fill-current" />
                          )}
                        </div>
                        <span className="text-gray-500 text-sm">
                          ({vehicle.reviewCount || 0} reviews)
                        </span>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Pickup Date</label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <DatePicker
                                    date={pickupDate}
                                    setDate={handlePickupDateChange}
                                    placeholder="Select date"
                                    fromDate={new Date()}
                                    disabled={(date) => {
                                      const today = new Date();
                                      const maxDate = new Date();
                                      maxDate.setDate(today.getDate() + 10);
                                      return date < today || date > maxDate;
                                    }}
                                    bookedDates={bookedDates}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-white border border-gray-200 shadow-lg p-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                  <p className="text-sm text-gray-700">Book your pickup date within the next 10 days</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Return Date</label>
                          <div className="flex-1">
                            <DatePicker
                              date={returnDate}
                              setDate={setReturnDate}
                              placeholder="Return date"
                              fromDate={pickupDate ? new Date(pickupDate.getTime() + 24 * 60 * 60 * 1000) : new Date()}
                              className="border-0 focus:ring-0 focus:ring-offset-0 h-10 text-sm bg-transparent hover:bg-gray-50 rounded-md text-black placeholder:text-black"
                              disabled={(date) => !pickupDate || date < pickupDate || isDateBooked(date)}
                              bookedDates={bookedDates}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center italic">
                          Book up to 10 days in advance <span className="text-red-500">*</span>
                        </p>
                      </div>

                      {totalDays > 0 && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between mb-1">
                            <span>
                              {formatPrice(vehicle.pricePerDay)} × {totalDays} day{totalDays > 1 ? "s" : ""}
                              <span className="text-sm text-gray-500 ml-1">
                                ({format(pickupDate!, "MMM d")} - {format(returnDate!, "MMM d")})
                              </span>
                            </span>
                            <span>{formatPrice(totalPrice)}</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>{formatPrice(totalPrice)}</span>
                          </div>
                        </div>
                      )}

                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        disabled={!pickupDate || !returnDate}
                        onClick={handleBookNow}
                      >
                        {!user ? "Login to Book" : "Book Now"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
              <p className="text-gray-500 mb-6 text-center">
                The vehicle you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate("/vehicles")}>
                Browse All Vehicles
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Image Lightbox */}
      {vehicle && Array.isArray(vehicle.imageUrls) && (
        <ImageLightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={vehicle.imageUrls}
          currentIndex={currentImageIndex}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
        />
      )}
    </div>
  );
}
