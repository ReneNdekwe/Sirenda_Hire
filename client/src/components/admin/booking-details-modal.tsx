import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";
import { User, Vehicle, Booking } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface BookingDetailsModalProps {
  booking: Booking | null;
  onClose: () => void;
}

type PaymentStatus = "pending" | "authorized" | "captured" | "refunded" | "failed";

export function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
  // Fetch user details
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", booking?.userId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/users/${booking?.userId}`);
      return response.json();
    },
    enabled: !!booking?.userId,
  });

  // Fetch vehicle details
  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery({
    queryKey: ["vehicle", booking?.vehicleId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/vehicles/${booking?.vehicleId}`);
      return response.json();
    },
    enabled: !!booking?.vehicleId,
  });

  // Fetch rental company details
  const { data: rentalCompany, isLoading: isLoadingCompany } = useQuery({
    queryKey: ["user", vehicle?.ownerId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/users/${vehicle?.ownerId}`);
      return response.json();
    },
    enabled: !!vehicle?.ownerId,
  });

  if (!booking) return null;

  return (
    <Dialog open={!!booking} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
            {isLoadingUser ? (
              <Skeleton className="h-20" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user?.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Vehicle Information</h3>
            {isLoadingVehicle ? (
              <Skeleton className="h-20" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Vehicle</p>
                  <p className="font-medium">{vehicle?.brand} {vehicle?.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year</p>
                  <p className="font-medium">{vehicle?.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">License Plate</p>
                  <p className="font-medium">{vehicle?.licensePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{vehicle?.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Rental Company Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Rental Company</h3>
            {isLoadingCompany ? (
              <Skeleton className="h-20" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Company Name</p>
                  <p className="font-medium">{rentalCompany?.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Email</p>
                  <p className="font-medium">{rentalCompany?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{rentalCompany?.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Booking Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Booking Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge 
                  className={cn(
                    "mt-1",
                    booking.status === "completed" && "bg-green-100 text-green-800",
                    booking.status === "confirmed" && "bg-blue-100 text-blue-800",
                    booking.status === "pending" && "bg-yellow-100 text-yellow-800",
                    booking.status === "cancelled" && "bg-red-100 text-red-800",
                    booking.status === "rejected" && "bg-gray-100 text-gray-800"
                  )}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <Badge 
                  className={cn(
                    "mt-1",
                    booking.paymentStatus === "captured" && "bg-green-100 text-green-800",
                    booking.paymentStatus === "pending" && "bg-yellow-100 text-yellow-800",
                    booking.paymentStatus === "failed" && "bg-red-100 text-red-800",
                    booking.paymentStatus === "authorized" && "bg-blue-100 text-blue-800",
                    booking.paymentStatus === "refunded" && "bg-gray-100 text-gray-800"
                  )}
                >
                  {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pickup Date</p>
                <p className="font-medium">{format(new Date(booking.pickupDate), "MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Return Date</p>
                <p className="font-medium">{format(new Date(booking.returnDate), "MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="font-medium">{formatPrice(booking.totalPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{format(new Date(booking.createdAt || new Date()), "MMM d, yyyy h:mm a")}</p>
              </div>
            </div>
          </div>

          {/* Additional Services */}
          {(booking.hasDriver || booking.hasCarWash || booking.hasHomeDelivery) && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Additional Services</h3>
              <div className="grid grid-cols-2 gap-4">
                {booking.hasDriver && (
                  <div>
                    <p className="text-sm text-gray-500">Driver</p>
                    <p className="font-medium">Included</p>
                  </div>
                )}
                {booking.hasCarWash && (
                  <div>
                    <p className="text-sm text-gray-500">Car Wash</p>
                    <p className="font-medium">Included</p>
                  </div>
                )}
                {booking.hasHomeDelivery && (
                  <div>
                    <p className="text-sm text-gray-500">Home Delivery</p>
                    <p className="font-medium">{booking.deliveryAddress}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 