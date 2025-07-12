import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Booking } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";
import { Phone } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";

interface UserDetails {
  id: number;
  fullName: string;
  phone: string | null;
  email: string;
}

interface BookingDetailsModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
  const { data: user } = useQuery<UserDetails>({
    queryKey: [`/api/users/${booking?.userId}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!booking?.userId
  });

  if (!booking) return null;

  return (
    <Dialog open={!!booking} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            View detailed information about this booking
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <span className="font-medium">Name:</span> {user?.fullName || `User #${booking.userId}`}
              </p>
              {user?.phone && (
                <p className="text-sm flex items-center gap-2">
                  <span className="font-medium">Phone:</span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {user.phone}
                  </span>
                </p>
              )}
              {user?.email && (
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Status</h4>
              <Badge 
                className={cn(
                  "mt-1",
                  booking.status === "completed" && "bg-green-100 text-green-800",
                  booking.status === "confirmed" && "bg-blue-100 text-blue-800",
                  booking.status === "pending" && "bg-yellow-100 text-yellow-800",
                  booking.status === "cancelled" && "bg-red-100 text-red-800"
                )}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Pickup Date</h4>
              <p className="mt-1">{format(new Date(booking.pickupDate), "MMM d, yyyy")}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Return Date</h4>
              <p className="mt-1">{format(new Date(booking.returnDate), "MMM d, yyyy")}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Total Price</h4>
              <p className="mt-1">{formatPrice(booking.totalPrice)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Vehicle ID</h4>
              <p className="mt-1">#{booking.vehicleId}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Created At</h4>
              <p className="mt-1">{format(new Date(booking.createdAt || new Date()), "MMM d, yyyy h:mm a")}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
              <p className="mt-1">{format(new Date(booking.updatedAt || new Date()), "MMM d, yyyy h:mm a")}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 