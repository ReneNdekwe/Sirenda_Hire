import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import VehicleForm from "@/components/rental-company/vehicle-form";

export default function AddVehiclePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <VehicleForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
