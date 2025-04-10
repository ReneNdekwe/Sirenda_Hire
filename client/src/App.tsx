import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import VehiclesPage from "@/pages/vehicles-page";
import VehicleDetailsPage from "@/pages/vehicle-details-page";
import BookingPage from "@/pages/booking-page";
import DashboardPage from "@/pages/dashboard-page";
import AddVehiclePage from "@/pages/add-vehicle-page";
import EditVehiclePage from "@/pages/edit-vehicle-page";
import MyBookingsPage from "@/pages/my-bookings-page";
import ProfilePage from "@/pages/profile-page";
import AdminDashboardPage from "@/pages/admin-dashboard-page";
import { ProtectedRoute, CompanyRoute, AdminRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import ComingSoonPage from "@/pages/coming-soon-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/vehicles" component={VehiclesPage} />
      <Route path="/vehicles/:id" component={VehicleDetailsPage} />
      <Route path="/coming-soon" component={ComingSoonPage} />
      <ProtectedRoute path="/booking/:vehicleId" component={BookingPage} />
      <ProtectedRoute path="/my-bookings" component={MyBookingsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <CompanyRoute path="/dashboard" component={DashboardPage} />
      <CompanyRoute path="/add-vehicle" component={AddVehiclePage} />
      <CompanyRoute path="/edit-vehicle/:id" component={EditVehiclePage} />
      <AdminRoute path="/admin" component={AdminDashboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
