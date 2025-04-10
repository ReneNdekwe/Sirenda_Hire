import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Vehicle } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import VehicleForm from "@/components/rental-company/vehicle-form";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2 } from "lucide-react";

export default function EditVehiclePage() {
  const params = useParams<{ id: string }>();
  const vehicleId = parseInt(params.id);

  const { data: vehicle, isLoading, error } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${vehicleId}`],
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="max-w-2xl mx-auto">
              <Skeleton className="h-10 w-48 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Vehicle</h2>
              <p className="text-gray-600 mb-4">
                We couldn't load the vehicle information. It may have been deleted or you may not have permission to edit it.
              </p>
            </div>
          ) : vehicle ? (
            <VehicleForm vehicle={vehicle} isEdit={true} />
          ) : (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
