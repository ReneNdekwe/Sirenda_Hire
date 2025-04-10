import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Booking, Vehicle } from "@shared/schema";
import { format } from "date-fns";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ChevronRight, Calendar, Car, AlertCircle, Loader2 } from "lucide-react";

export default function MyBookingsPage() {
  const { user } = useAuth();

  const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ['/api/my-bookings'],
    enabled: !!user,
  });

  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
    enabled: !!bookings && bookings.length > 0,
  });

  // Get vehicle details for a booking
  const getVehicleDetails = (vehicleId: number) => {
    return vehicles?.find((v) => v.id === vehicleId);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
    }
  };

  const isLoading = isLoadingBookings || isLoadingVehicles;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">My Bookings</h1>
            <p className="text-gray-500">Manage and view your vehicle booking history</p>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-48" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            </div>
          ) : !bookings || bookings.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>No bookings yet</CardTitle>
                <CardDescription>
                  You haven't made any bookings yet. Browse our vehicles and book your first rental.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="/vehicles">
                  <Button>Browse Vehicles</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Current & Upcoming Bookings</CardTitle>
                    <CardDescription>Your pending and confirmed bookings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookings
                            .filter(b => b.status === 'pending' || b.status === 'confirmed')
                            .map((booking) => {
                              const vehicle = getVehicleDetails(booking.vehicleId);
                              return (
                                <TableRow key={booking.id}>
                                  <TableCell className="font-medium">
                                    {vehicle ? (
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 bg-gray-200 rounded overflow-hidden mr-2">
                                          {vehicle.imageUrls && vehicle.imageUrls[0] && (
                                            <img
                                              src={vehicle.imageUrls[0] as string}
                                              alt={`${vehicle.brand} ${vehicle.model}`}
                                              className="h-full w-full object-cover"
                                            />
                                          )}
                                        </div>
                                        <span>
                                          {vehicle.brand} {vehicle.model}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 bg-gray-200 rounded overflow-hidden mr-2 flex items-center justify-center">
                                          <Car className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <span>Vehicle #{booking.vehicleId}</span>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {format(new Date(booking.pickupDate), "MMM d, yyyy")} -{" "}
                                    {format(new Date(booking.returnDate), "MMM d, yyyy")}
                                  </TableCell>
                                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                  <TableCell>${booking.totalPrice}</TableCell>
                                  <TableCell>
                                    {vehicle && (
                                      <Link href={`/vehicles/${vehicle.id}`}>
                                        <Button variant="ghost" size="sm">
                                          Details
                                          <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                      </Link>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <Calendar className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No upcoming bookings</h3>
                        <p className="text-gray-500 mb-4">
                          You don't have any pending or confirmed bookings at the moment.
                        </p>
                        <Link href="/vehicles">
                          <Button>Browse Vehicles</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {bookings.filter(b => b.status === 'completed' || b.status === 'cancelled').length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking History</CardTitle>
                      <CardDescription>Your past bookings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookings
                            .filter(b => b.status === 'completed' || b.status === 'cancelled')
                            .map((booking) => {
                              const vehicle = getVehicleDetails(booking.vehicleId);
                              return (
                                <TableRow key={booking.id}>
                                  <TableCell className="font-medium">
                                    {vehicle ? (
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 bg-gray-200 rounded overflow-hidden mr-2">
                                          {vehicle.imageUrls && vehicle.imageUrls[0] && (
                                            <img
                                              src={vehicle.imageUrls[0] as string}
                                              alt={`${vehicle.brand} ${vehicle.model}`}
                                              className="h-full w-full object-cover"
                                            />
                                          )}
                                        </div>
                                        <span>
                                          {vehicle.brand} {vehicle.model}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 bg-gray-200 rounded overflow-hidden mr-2 flex items-center justify-center">
                                          <Car className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <span>Vehicle #{booking.vehicleId}</span>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {format(new Date(booking.pickupDate), "MMM d, yyyy")} -{" "}
                                    {format(new Date(booking.returnDate), "MMM d, yyyy")}
                                  </TableCell>
                                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                  <TableCell>${booking.totalPrice}</TableCell>
                                  <TableCell>
                                    {vehicle && (
                                      <Link href={`/vehicles/${vehicle.id}`}>
                                        <Button variant="ghost" size="sm">
                                          Details
                                          <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                      </Link>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
