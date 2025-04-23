import { useState, useEffect } from "react";
import { useParams, useSearch, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Vehicle } from "@shared/schema";
import { format, parse, differenceInDays, addDays, startOfDay, endOfDay } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Car, Calendar, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/currency";

export default function BookingPage() {
  const params = useParams<{ vehicleId: string }>();
  const searchParams = new URLSearchParams(useSearch());
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const vehicleId = parseInt(params.vehicleId);

  const [pickupDate, setPickupDate] = useState<Date | undefined>(() => {
    const dateStr = searchParams.get("pickupDate");
    if (!dateStr) return undefined;
    return parse(dateStr, 'yyyy-MM-dd', new Date());
  });

  const [returnDate, setReturnDate] = useState<Date | undefined>(() => {
    const dateStr = searchParams.get("returnDate");
    if (!dateStr) return undefined;
    return parse(dateStr, 'yyyy-MM-dd', new Date());
  });

  const [hasDriver, setHasDriver] = useState(false);
  const [hasCarWash, setHasCarWash] = useState(false);
  const [hasHomeDelivery, setHasHomeDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Fetch vehicle availability
  const { data: bookedDates } = useQuery<Array<{ start: string; end: string }>>({
    queryKey: [`/api/vehicles/${vehicleId}/availability`],
    enabled: !!vehicleId,
  });

  const isDateBooked = (date: Date) => {
    if (!bookedDates) return false;

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return bookedDates.some(booking => {
      const start = new Date(booking.start);
      const end = new Date(booking.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

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

  const handlePickupDateChange = (date: Date | undefined) => {
    if (!date) {
      setPickupDate(undefined);
      setReturnDate(undefined);
      return;
    }

    const newPickupDate = startOfDay(date);
    setPickupDate(newPickupDate);

    // If return date is before new pickup date or on a booked date, find next available date
    if (!returnDate || returnDate <= newPickupDate || isDateBooked(returnDate)) {
      let nextDate = addDays(newPickupDate, 1);
      while (isDateBooked(nextDate)) {
        nextDate = addDays(nextDate, 1);
      }
      setReturnDate(nextDate);
    }
  };

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [bookingStep, setBookingStep] = useState<"form" | "confirmation" | "success">("form");

  // Fetch vehicle details
  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${vehicleId}`],
  });

  const totalDays = pickupDate && returnDate ? differenceInDays(returnDate, pickupDate) : 0;
  const basePrice = vehicle?.pricePerDay ? totalDays * vehicle.pricePerDay : 0;
  const driverFee = hasDriver ? totalDays * 8 : 0; // 10000 RWF per day for driver
  const carWashFee = hasCarWash ? 5 : 0; // 5000 RWF flat fee for car wash
  const deliveryFee = hasHomeDelivery ? 5 : 0; // 5000 RWF flat fee for delivery
  const totalPrice = basePrice + driverFee + carWashFee + deliveryFee;

  // Create booking mutation
  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!vehicle || !pickupDate || !returnDate || !user) {
        throw new Error("Missing required booking information");
      }

      if (hasHomeDelivery && !deliveryAddress.trim()) {
        throw new Error("Delivery address is required when home delivery is selected");
      }

      const bookingData = {
        vehicleId: vehicle.id,
        userId: user.id,
        pickupDate: format(pickupDate, 'yyyy-MM-dd'),
        returnDate: format(returnDate, 'yyyy-MM-dd'),
        totalPrice,
        hasDriver,
        hasCarWash,
        hasHomeDelivery,
        deliveryAddress: hasHomeDelivery ? deliveryAddress : null,
        status: "pending",
      };

      const res = await apiRequest("POST", "/api/bookings", bookingData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-bookings"] });
      setBookingStep("success");
    },
    onError: (error) => {
      toast({
        title: "Booking failed",
        description: error.message || "Could not complete your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBookNow = async () => {
    if (!pickupDate || !returnDate) {
      toast({
        title: "Missing information",
        description: "Please select pickup and return dates",
        variant: "destructive",
      });
      return;
    }

    // Check if the dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (pickupDate < today) {
      toast({
        title: "Invalid dates",
        description: "Pickup date cannot be in the past",
        variant: "destructive",
      });
      return;
    }

    if (returnDate <= pickupDate) {
      toast({
        title: "Invalid dates",
        description: "Return date must be after pickup date",
        variant: "destructive",
      });
      return;
    }

    if (!isDateRangeAvailable(pickupDate, returnDate)) {
      toast({
        title: "Dates unavailable",
        description: "The selected dates are not available. Please choose different dates.",
        variant: "destructive",
      });
      return;
    }

    if (!termsAccepted) {
      toast({
        title: "Terms and conditions",
        description: "Please accept the terms and conditions to continue",
        variant: "destructive",
      });
      return;
    }

    setBookingStep("confirmation");
  };

  const confirmBooking = () => {
    bookingMutation.mutate();
  };

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => {
              if (bookingStep === "confirmation") {
                setBookingStep("form");
              } else {
                navigate(`/vehicles/${vehicleId}`);
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {bookingStep === "confirmation" ? "Back to booking details" : "Back to vehicle"}
          </Button>

          {isLoading ? (
            <div className="max-w-3xl mx-auto">
              <Skeleton className="h-8 w-64 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Skeleton className="h-64 w-full mb-4" />
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div>
                  <Skeleton className="h-64 w-full" />
                </div>
              </div>
            </div>
          ) : vehicle ? (
            <div className="max-w-3xl mx-auto">
              {bookingStep === "form" && (
                <>
                  <h1 className="text-2xl font-bold mb-6">Book Your Vehicle</h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Booking Details</CardTitle>
                          <CardDescription>
                            Please confirm your booking information
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                              {vehicle.imageUrls && Array.isArray(vehicle.imageUrls) && vehicle.imageUrls[0] && (
                                <img
                                  src={vehicle.imageUrls[0] as string}
                                  alt={`${vehicle.brand} ${vehicle.model}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {vehicle.brand} {vehicle.model} ({vehicle.year})
                              </h3>
                              <div className="text-gray-500 flex items-center">
                                <Car className="h-4 w-4 mr-1" />
                                <span>
                                  {vehicle.seats} seats • {vehicle.transmission} •{" "}
                                  {vehicle.fuel}
                                </span>
                              </div>
                              <p className="text-primary font-semibold mt-1">
                                {formatPrice(vehicle.pricePerDay)} per day
                              </p>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Pickup Date
                                </label>
                                <DatePicker
                                  date={pickupDate}
                                  setDate={handlePickupDateChange}
                                  placeholder="Select date"
                                  disabled={(date: Date): boolean => {
                                    return date < new Date() || isDateBooked(date);
                                  }}
                                  bookedDates={bookedDates}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Return Date
                                </label>
                                <DatePicker
                                  date={returnDate}
                                  setDate={setReturnDate}
                                  placeholder="Select date"
                                  fromDate={pickupDate}
                                  disabled={(date: Date): boolean => {
                                    if (!pickupDate) return true;
                                    // Check if any dates between pickup and return are booked
                                    const checkDate = new Date(date);
                                    for (let d = new Date(pickupDate); d <= checkDate; d.setDate(d.getDate() + 1)) {
                                      if (isDateBooked(new Date(d))) return true;
                                    }
                                    return false;
                                  }}
                                  bookedDates={bookedDates}
                                />
                              </div>
                            </div>

                            <div className="p-3 bg-blue-50 rounded-md flex items-start text-blue-700">
                              <Calendar className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                              <p className="text-sm">
                                Pickup and return will be at{" "}
                                <span className="font-semibold">{vehicle.location}</span>. Please
                                arrive on time for your scheduled appointment.
                              </p>
                            </div>
                          </div>

                          <Separator />

                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="terms"
                              checked={termsAccepted}
                              onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Accept terms and conditions
                              </label>
                              <p className="text-sm text-gray-500">
                                I agree to the rental terms and conditions, including the
                                cancellation policy and insurance requirements.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full bg-primary text-white hover:bg-primary/90"
                            disabled={!pickupDate || !returnDate || !termsAccepted || (hasHomeDelivery && !deliveryAddress.trim())}
                            onClick={handleBookNow}
                          >
                            Continue to Payment
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>

                    <div>
                      <Card>
                        <CardHeader>
                          <CardTitle>Price Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span>
                                {formatPrice(vehicle.pricePerDay)} × {totalDays || 0} day
                                {totalDays !== 1 ? "s" : ""}
                              </span>
                              <span>{formatPrice(basePrice)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>Rental Fee</span>
                              <span>{formatPrice(basePrice)}</span>
                            </div>
                          </div>

                          {hasDriver && (
                            <div className="flex justify-between text-sm">
                              <span>Driver Fee ({formatPrice(8)}/day)</span>
                              <span>{formatPrice(driverFee)}</span>
                            </div>
                          )}

                          {hasCarWash && (
                            <div className="flex justify-between text-sm">
                              <span>Car Wash Fee</span>
                              <span>{formatPrice(carWashFee)}</span>
                            </div>
                          )}

                          {hasHomeDelivery && (
                            <div className="flex justify-between text-sm">
                              <span>Delivery Fee</span>
                              <span>{formatPrice(deliveryFee)}</span>
                            </div>
                          )}

                          <Separator />

                          <div className="space-y-4 mt-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="driver"
                                checked={hasDriver}
                                onCheckedChange={(checked) => setHasDriver(checked as boolean)}
                              />
                              <label
                                htmlFor="driver"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Add Professional Driver ({formatPrice(8)}/day)
                              </label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="carWash"
                                checked={hasCarWash}
                                onCheckedChange={(checked) => setHasCarWash(checked as boolean)}
                              />
                              <label
                                htmlFor="carWash"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Add Car Wash Service ({formatPrice(5)})
                              </label>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="homeDelivery"
                                  checked={hasHomeDelivery}
                                  onCheckedChange={(checked) => {
                                    setHasHomeDelivery(checked as boolean);
                                    if (!checked) {
                                      setDeliveryAddress("");
                                    }
                                  }}
                                />
                                <label
                                  htmlFor="homeDelivery"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Add Home Delivery Service ({formatPrice(5)})
                                </label>
                              </div>
                              {hasHomeDelivery && (
                                <div className="ml-6">
                                  <Input
                                    placeholder="Enter delivery address"
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    className="w-full"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <Separator />

                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>{formatPrice(totalPrice)}</span>
                          </div>

                          <div className="pt-2 text-xs text-gray-500">
                            <p>
                              Prices are in RWF. Additional fees may apply at pickup
                              (fuel, insurance options, etc).
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              )}

              {bookingStep === "confirmation" && (
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>Confirm Your Booking</CardTitle>
                    <CardDescription>
                      Please review your booking details before proceeding
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 p-4 rounded-md">
                      <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                        {vehicle.imageUrls && Array.isArray(vehicle.imageUrls) && vehicle.imageUrls[0] && (
                          <img
                            src={vehicle.imageUrls[0] as string}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </h3>
                        <div className="text-gray-600">
                          {pickupDate && returnDate && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                              <span>
                                {format(pickupDate, "MMM d, yyyy")} -{" "}
                                {format(returnDate, "MMM d, yyyy")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Rental Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                          <div>
                            <span className="text-gray-500">Pickup:</span>{" "}
                            {pickupDate && format(pickupDate, "EEE, MMM d, yyyy")}
                          </div>
                          <div>
                            <span className="text-gray-500">Return:</span>{" "}
                            {returnDate && format(returnDate, "EEE, MMM d, yyyy")}
                          </div>
                          <div>
                            <span className="text-gray-500">Duration:</span>{" "}
                            {totalDays} day{totalDays !== 1 ? "s" : ""}
                          </div>
                          <div>
                            <span className="text-gray-500">Location:</span> {vehicle.location}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Payment Summary</h3>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between mb-1">
                            <span>
                              {formatPrice(vehicle.pricePerDay)} × {totalDays} day{totalDays !== 1 ? "s" : ""}
                            </span>
                            <span>{formatPrice(totalPrice)}</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>{formatPrice(totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-md text-yellow-800 flex">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p className="text-sm">
                        This is a demo application. No real payment will be processed and no
                        actual vehicle will be reserved.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-4 p-6">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setBookingStep("form")}
                      className="min-w-[120px]"
                    >
                      Back
                    </Button>
                    <Button
                      size="lg"
                      onClick={confirmBooking}
                      disabled={bookingMutation.isPending}
                      className="min-w-[120px] bg-primary text-white hover:bg-primary/90"
                    >
                      {bookingMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Confirm Booking
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {bookingStep === "success" && (
                <Card className="max-w-2xl mx-auto">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">Booking Submitted!</CardTitle>
                    <CardDescription>
                      Your booking is pending confirmation from the rental company
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-semibold mb-2">Booking Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                        <div>
                          <span className="text-gray-500">Vehicle:</span>{" "}
                          {vehicle.brand} {vehicle.model}
                        </div>
                        <div>
                          <span className="text-gray-500">Pickup:</span>{" "}
                          {pickupDate && format(pickupDate, "EEE, MMM d, yyyy")}
                        </div>
                        <div>
                          <span className="text-gray-500">Return:</span>{" "}
                          {returnDate && format(returnDate, "EEE, MMM d, yyyy")}
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span> {vehicle.location}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-md flex items-start text-blue-700">
                      <Calendar className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold mb-1">Next Steps:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Bring your driver's license and payment card at pickup</li>
                          <li>Arrive at the rental location on your pickup date</li>
                          <li>Inspect the vehicle before driving away</li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center gap-4 p-6">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/my-bookings")}
                      className="min-w-[160px]"
                    >
                      View My Bookings
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => navigate("/vehicles")}
                      className="min-w-[160px] bg-primary text-white hover:bg-primary/90"
                    >
                      Browse More Vehicles
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow max-w-md mx-auto">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
              <p className="text-gray-500 mb-6 text-center">
                The vehicle you're trying to book doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate("/vehicles")}>
                Browse All Vehicles
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}