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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/currency";

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

  // Filter bookings by status
  const pendingBookings = bookings?.filter(b => b.status === 'pending') || [];
  const confirmedBookings = bookings?.filter(b => b.status === 'confirmed') || [];
  const completedBookings = bookings?.filter(b => b.status === 'completed') || [];
  const cancelledBookings = bookings?.filter(b => b.status === 'cancelled') || [];

  const renderBookingsTable = (bookings: Booking[]) => {
    if (bookings.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No bookings found</h3>
          <p className="text-gray-500 mb-4">
            You don't have any bookings in this category.
          </p>
          <Link href="/vehicles">
            <Button>Browse Vehicles</Button>
          </Link>
        </div>
      );
    }

    return (
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
          {bookings.map((booking) => {
            const vehicle = getVehicleDetails(booking.vehicleId);
            const imageUrls = vehicle?.imageUrls ? (Array.isArray(vehicle.imageUrls) ? vehicle.imageUrls as string[] : []) : [];
            return (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">
                  {vehicle ? (
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-200 rounded overflow-hidden mr-2">
                        {imageUrls.length > 0 && (
                          <img
                            src={imageUrls[0]}
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
                <TableCell>{formatPrice(booking.totalPrice)}</TableCell>
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
    );
  };

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
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="pending" className="relative">
                    Pending
                    {pendingBookings.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-yellow-100 text-yellow-800 text-xs flex items-center justify-center">
                        {pendingBookings.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="confirmed" className="relative">
                    Confirmed
                    {confirmedBookings.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-100 text-green-800 text-xs flex items-center justify-center">
                        {confirmedBookings.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="relative">
                    Completed
                    {completedBookings.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center">
                        {completedBookings.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" className="relative">
                    Cancelled
                    {cancelledBookings.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-100 text-red-800 text-xs flex items-center justify-center">
                        {cancelledBookings.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Bookings</CardTitle>
                      <CardDescription>Your bookings awaiting confirmation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderBookingsTable(pendingBookings)}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="confirmed">
                  <Card>
                    <CardHeader>
                      <CardTitle>Confirmed Bookings</CardTitle>
                      <CardDescription>Your upcoming confirmed bookings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderBookingsTable(confirmedBookings)}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="completed">
                  <Card>
                    <CardHeader>
                      <CardTitle>Completed Bookings</CardTitle>
                      <CardDescription>Your past completed bookings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderBookingsTable(completedBookings)}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="cancelled">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cancelled Bookings</CardTitle>
                      <CardDescription>Your cancelled bookings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderBookingsTable(cancelledBookings)}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
