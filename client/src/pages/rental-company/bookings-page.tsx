import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
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
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Booking } from "@shared/schema";

export default function RentalCompanyBookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch bookings
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/my-bookings"],
    queryFn: async () => {
      const response = await fetch("/api/my-bookings", {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please log in to view bookings");
        }
        throw new Error("Failed to fetch bookings");
      }
      return response.json();
    },
    enabled: !!user && user.userType === "company",
    retry: false,
  });

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) => {
      const res = await apiRequest(
        "PUT",
        `/api/bookings/${bookingId}/status`,
        { status }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-bookings"] });
      toast({
        title: "Booking status updated",
        description: "The booking status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking status",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (bookingId: number, status: string) => {
    updateStatusMutation.mutate({ bookingId, status });
  };

  if (!user || user.userType !== "company") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Access Denied</h1>
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V9m0 0V6m0 3h3m-3 0H9" />
            </svg>
          </div>
          <p className="text-gray-600 mb-6 text-center">
            This page is only accessible to rental companies. Please log in with a rental company account.
          </p>
          <div className="flex justify-center">
            <a 
              href="/auth" 
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Booking Requests</h1>
            <p className="text-gray-600">
              Manage and respond to booking requests for your vehicles
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Total Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings?.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">
                            {booking.vehicleId} {/* You might want to fetch and display vehicle details */}
                          </div>
                        </TableCell>
                        <TableCell>{booking.userId}</TableCell>
                        <TableCell>
                          {format(new Date(booking.pickupDate), "MMM d, yyyy")} -{" "}
                          {format(new Date(booking.returnDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>${booking.totalPrice}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              booking.status === "confirmed" && "bg-green-100 text-green-800",
                              booking.status === "rejected" && "bg-red-100 text-red-800",
                              booking.status === "pending" && "bg-yellow-100 text-yellow-800"
                            )}
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {booking.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-500 hover:bg-green-600 text-white"
                                onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => handleStatusUpdate(booking.id, "rejected")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 