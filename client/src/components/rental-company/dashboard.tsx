import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Vehicle } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SubscriptionInfo from "./subscription-info";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PlusCircle,
  Car,
  Calendar,
  CircleDollarSign,
  BarChart3,
  AlertCircle,
  Home,
  FileCog,
  Settings,
  Users,
  Bell,
  ChevronRight,
  LogOut,
  ArrowUpRight,
  Eye,
  TrendingUp,
  Star,
  Clock,
  CheckCircle2,
  Menu,
  X,
  RefreshCw
} from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import { BookingDetailsModal } from "./booking-details-modal";
import { formatPrice } from "@/lib/currency";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";

interface Booking {
  id: number;
  vehicleId: number;
  userId: number;
  pickupDate: string;
  returnDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  totalPrice: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  paymentStatus: 'pending' | 'authorized' | 'captured' | 'refunded' | 'failed';
  paymentIntentId: string | null;
  hasDriver: boolean;
  hasCarWash: boolean;
  hasHomeDelivery: boolean;
  deliveryAddress: string | null;
}

function SidebarItem({ 
  icon: Icon, 
  label, 
  active = false, 
  href = "#",
  onClick,
}: { 
  icon: any, 
  label: string, 
  active?: boolean, 
  href?: string,
  onClick?: () => void,
}) {
  return (
    <Link href={href}>
      <div
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary/10 cursor-pointer",
          active ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:text-primary"
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </div>
    </Link>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  bgClass = "bg-gradient-to-br from-violet-500 to-purple-500", 
}: { 
  title: string, 
  value: string, 
  icon: any, 
  trend?: "up" | "down" | "neutral", 
  trendValue?: string,
  bgClass?: string,
}) {
  return (
    <Card className="border-none shadow-md overflow-hidden">
      <div className={`${bgClass} absolute top-0 left-0 right-0 h-2`}></div>
      <CardContent className="p-6 pt-8 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className={`p-2 rounded-full ${bgClass} bg-opacity-10`}>
            <Icon className={`h-5 w-5 text-primary`} />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-3xl font-bold mb-1">{value}</div>
          {trend && (
            <div className="flex items-center gap-1 text-xs font-medium">
              {trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
              {trend === "down" && <TrendingUp className="h-3 w-3 rotate-180 text-red-500" />}
              <span 
                className={cn(
                  trend === "up" ? "text-green-500" : 
                  trend === "down" ? "text-red-500" : 
                  "text-gray-500"
                )}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function VehicleCard({ vehicle, onEdit }: { vehicle: Vehicle, onEdit: (id: number) => void }) {
  // Fetch vehicle bookings
  const { data: bookings } = useQuery<Booking[]>({
    queryKey: [`/api/vehicle-bookings/${vehicle.id}`],
    enabled: !!vehicle.id,
  });

  // Check if vehicle is available (no active bookings)
  const isAvailable = !bookings?.some(booking => 
    booking.status !== 'cancelled' && booking.status !== 'completed'
  );

  return (
    <Card className="overflow-hidden border border-gray-200 transition-all hover:shadow-md group">
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {vehicle.imageUrls && Array.isArray(vehicle.imageUrls) && vehicle.imageUrls.length > 0 ? (
          <img 
            src={vehicle.imageUrls[0]} 
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <Car className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <Badge 
          className={cn(
            "absolute top-2 right-2",
            isAvailable 
              ? "bg-green-100 text-green-800 hover:bg-green-200" 
              : "bg-red-100 text-red-800 hover:bg-red-200"
          )}
        >
          {isAvailable ? 'Available' : 'Booked'}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold">{vehicle.brand} {vehicle.model}</h3>
            <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.location}</p>
          </div>
          <p className="font-bold text-primary">{formatPrice(vehicle.pricePerDay)}<span className="text-xs font-normal text-gray-500">/day</span></p>
        </div>
        <div className="flex flex-wrap gap-1 mt-3 mb-4">
          <Badge variant="outline" className="bg-gray-50 font-normal">
            {vehicle.seats} seats
          </Badge>
          <Badge variant="outline" className="bg-gray-50 font-normal">
            {vehicle.transmission}
          </Badge>
          <Badge variant="outline" className="bg-gray-50 font-normal">
            {vehicle.fuel}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-0 px-4 pb-4 flex justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-gray-200 hover:bg-gray-50 hover:text-primary"
          onClick={() => onEdit(vehicle.id)}
        >
          <FileCog className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Link href={`/vehicles/${vehicle.id}`} className="flex-1">
          <Button
            variant="default"
            size="sm"
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['/api/my-vehicles'],
    queryFn: async () => {
      const response = await fetch('/api/my-vehicles', {
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view vehicles');
        }
        throw new Error('Failed to fetch vehicles');
      }
      return response.json();
    },
    enabled: !!user,
    retry: false,
  });

  const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ['/api/rental-company/bookings'],
    queryFn: async () => {
      const response = await fetch('/api/rental-company/bookings', {
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view bookings');
        }
        throw new Error('Failed to fetch bookings');
      }
      return response.json();
    },
    enabled: !!user && user.userType === "company",
    retry: false,
  });

  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['/api/analytics'],
    queryFn: async () => {
      const response = await fetch('/api/analytics', {
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view analytics');
        }
        throw new Error('Failed to fetch analytics');
      }
      return response.json();
    },
    enabled: !!user,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null);
      toast({
        title: "Success",
        description: "You have been logged out successfully"
      });
      navigate('/auth');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive"
      });
    }
  });

  // Add the mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, newStatus }: { bookingId: number; newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected' }) => {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      return response.json();
    },
    onMutate: async ({ bookingId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['/api/rental-company/bookings'] });
      const previousBookings = queryClient.getQueryData<Booking[]>(['/api/rental-company/bookings']);

      if (previousBookings) {
        queryClient.setQueryData<Booking[]>(['/api/rental-company/bookings'], old => 
          old?.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: newStatus }
              : booking
          )
        );
      }

      return { previousBookings };
    },
    onError: (err, variables, context) => {
      if (context?.previousBookings) {
        queryClient.setQueryData(['/api/rental-company/bookings'], context.previousBookings);
      }
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    },
    onSettled: () => {
      // Invalidate both bookings and analytics queries
      queryClient.invalidateQueries({ queryKey: ['/api/rental-company/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
    },
  });

  const handleStatusChange = (bookingId: number, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected') => {
    updateStatusMutation.mutate({ bookingId, newStatus });
  };

  if (!user) return null;

  const handleEditVehicle = (id: number) => {
    navigate(`/edit-vehicle/${id}`);
  };

  const companyName = user.companyName || user.username;

  // Add these at the top level of the Dashboard component, before the return:
  const [statusFilters, setStatusFilters] = useState<{ [vehicleId: number]: string }>({});
  const [dateRanges, setDateRanges] = useState<{ [vehicleId: number]: DateRange }>({});
  const [minPrices, setMinPrices] = useState<{ [vehicleId: number]: string }>({});
  const [maxPrices, setMaxPrices] = useState<{ [vehicleId: number]: string }>({});

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out bg-white border-r border-gray-100",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 flex flex-col items-start gap-3">
          <Link href="/">
            <img
              src="/uploads/Logo.png"
              alt="Sirenda Hire"
              className="h-10 w-auto cursor-pointer mb-2"
              style={{ maxWidth: '120px' }}
            />
          </Link>
        </div>

        <Separator />

        <div className="p-4">
          <nav className="space-y-1">
            <SidebarItem 
              icon={Home} 
              label="Dashboard" 
              active={activeTab === "dashboard"} 
              onClick={() => {
                setActiveTab("dashboard");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem 
              icon={Car} 
              label="My Vehicles" 
              active={activeTab === "vehicles"} 
              onClick={() => {
                setActiveTab("vehicles");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem 
              icon={Calendar} 
              label="Bookings" 
              active={activeTab === "bookings"} 
              onClick={() => {
                setActiveTab("bookings");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem 
              icon={BarChart3} 
              label="Analytics" 
              active={activeTab === "analytics"} 
              onClick={() => {
                setActiveTab("analytics");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem 
              icon={Users} 
              label="Customers" 
              active={activeTab === "customers"} 
              onClick={() => {
                setActiveTab("customers");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              href="/profile"
            />
          </nav>
        </div>

        <Separator className="my-4" />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-2 md:gap-0">
            <div className="flex flex-col md:flex-row md:items-center w-full">
              <div className="flex flex-col items-center md:items-start min-w-[180px] md:mr-6">
                <span className="text-xl font-extrabold leading-tight text-primary text-center md:text-left">{companyName}</span>
                <span className="text-xs text-gray-500 tracking-wide uppercase mt-1 text-center md:text-left">Rental Company Dashboard</span>
              </div>
              <div className="h-0 md:h-10 md:w-px bg-gray-200 md:mx-6" />
              <h1 className="text-2xl font-bold flex-1 text-gray-900 text-center md:text-left mt-2 md:mt-0">
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "vehicles" && "Vehicle Management"}
                {activeTab === "bookings" && "Booking Requests"}
                {activeTab === "analytics" && "Performance Analytics"}
                {activeTab === "customers" && "Customer Management"}
              </h1>
            </div>
            <div className="flex items-center justify-center md:justify-end gap-2 lg:gap-4 mt-2 md:mt-0 ml-0 md:ml-4">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 shadow-sm">
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-primary font-medium hover:bg-primary/10 transition-colors"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/vehicles/reset-availability', {
                        method: 'POST',
                        credentials: 'include'
                      });
                      if (!response.ok) throw new Error('Failed to reset availability');
                      queryClient.invalidateQueries({ queryKey: ['/api/my-vehicles'] });
                      toast({
                        title: "Success",
                        description: "Vehicle availability has been reset",
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to reset vehicle availability",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reset Availability
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-destructive font-medium hover:bg-destructive/10 transition-colors"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
              <Button variant="outline" size="icon" className="rounded-full relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
              </Button>
              <Link href="/profile">
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="bg-primary/10 h-9 w-9 rounded-full flex items-center justify-center">
                    <span className="text-primary font-medium">{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <SubscriptionInfo />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  title="Total Vehicles" 
                  value={vehicles?.length.toString() || "0"} 
                  icon={Car} 
                  bgClass="bg-gradient-to-r from-blue-500 to-indigo-500"
                />
                <StatCard 
                  title="Active Bookings" 
                  value={bookings?.filter(b => b.status === 'confirmed').length.toString() || "0"} 
                  icon={Calendar} 
                  trend="up" 
                  trendValue={`${analytics?.bookingTrend || 0}% from last month`}
                  bgClass="bg-gradient-to-r from-emerald-500 to-green-500"
                />
                <StatCard 
                  title="Total Revenue" 
                  value={formatPrice(analytics?.totalRevenue || 0)} 
                  icon={CircleDollarSign} 
                  trend={analytics?.revenueTrend > 0 ? "up" : "down"} 
                  trendValue={`${analytics?.revenueTrend || 0}% from last month`}
                  bgClass="bg-gradient-to-r from-amber-500 to-orange-500"
                />
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Activity</CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs gap-1">
                      View all <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings?.slice(0, 5).map((booking) => {
                      const vehicle = vehicles?.find(v => v.id === booking.vehicleId);
                      const timeAgo = booking.createdAt 
                        ? formatDistanceToNow(new Date(booking.createdAt), { addSuffix: true })
                        : 'recently';

                      return (
                        <div key={booking.id} className="flex items-start gap-4">
                          <div className={cn(
                            "rounded-full p-2",
                            booking.status === 'pending' && "bg-yellow-100",
                            booking.status === 'confirmed' && "bg-green-100",
                            booking.status === 'completed' && "bg-blue-100",
                            booking.status === 'cancelled' && "bg-red-100",
                            booking.status === 'rejected' && "bg-gray-100"
                          )}>
                            {booking.status === 'pending' && <Clock className="h-4 w-4 text-yellow-700" />}
                            {booking.status === 'confirmed' && <CheckCircle2 className="h-4 w-4 text-green-700" />}
                            {booking.status === 'completed' && <Calendar className="h-4 w-4 text-blue-700" />}
                            {booking.status === 'cancelled' && <X className="h-4 w-4 text-red-700" />}
                            {booking.status === 'rejected' && <AlertCircle className="h-4 w-4 text-gray-700" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">
                                {booking.status === 'pending' && 'New booking request'}
                                {booking.status === 'confirmed' && 'Booking confirmed'}
                                {booking.status === 'completed' && 'Booking completed'}
                                {booking.status === 'cancelled' && 'Booking cancelled'}
                                {booking.status === 'rejected' && 'Booking rejected'}
                              </h4>
                              <span className="text-xs text-gray-500">{timeAgo}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle'} • {formatPrice(booking.totalPrice)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "vehicles" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Your Vehicle Fleet</h2>
                  <p className="text-sm text-gray-500">Manage and track your vehicles</p>
                </div>
                <Link href="/add-vehicle">
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add New Vehicle
                  </Button>
                </Link>
              </div>

              {isLoadingVehicles ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="flex gap-2 mt-4">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-20" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : vehicles && vehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicles.map((vehicle) => (
                    <VehicleCard 
                      key={vehicle.id} 
                      vehicle={vehicle} 
                      onEdit={handleEditVehicle} 
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Car className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No vehicles in your fleet</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    You haven't added any vehicles to your rental fleet yet. Start by adding your first vehicle to attract bookings.
                  </p>
                  <Link href="/add-vehicle">
                    <Button size="lg">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Your First Vehicle
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Booking Requests</h2>
                  <p className="text-sm text-gray-500">Manage your booking requests and reservations</p>
                </div>
              </div>

              <Accordion type="multiple" className="w-full">
                {vehicles?.map((vehicle) => {
                  // Use state objects for per-vehicle filters
                  const statusFilter = statusFilters[vehicle.id] || "";
                  const dateRange = dateRanges[vehicle.id] || { from: undefined, to: undefined };
                  const minPrice = minPrices[vehicle.id] || "";
                  const maxPrice = maxPrices[vehicle.id] || "";

                  // Filter bookings for this vehicle
                  let filteredBookings = bookings?.filter((b: Booking) => b.vehicleId === vehicle.id) || [];
                  if (statusFilter && statusFilter !== 'all') {
                    filteredBookings = filteredBookings.filter(b => b.status === statusFilter);
                  }
                  if (dateRange.from) {
                    filteredBookings = filteredBookings.filter(b => new Date(b.pickupDate) >= dateRange.from!);
                  }
                  if (dateRange.to) {
                    filteredBookings = filteredBookings.filter(b => new Date(b.returnDate) <= dateRange.to!);
                  }
                  if (minPrice) {
                    filteredBookings = filteredBookings.filter(b => b.totalPrice >= parseFloat(minPrice));
                  }
                  if (maxPrice) {
                    filteredBookings = filteredBookings.filter(b => b.totalPrice <= parseFloat(maxPrice));
                  }

                  return (
                    <AccordionItem key={vehicle.id} value={vehicle.id.toString()}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{vehicle.brand} {vehicle.model}</span>
                          <span className="text-xs text-gray-500">({vehicle.year})</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Card className="mb-4">
                          <CardHeader>
                            <CardTitle>Booking history and requests</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {/* Filters */}
                            <div className="flex flex-wrap gap-4 mb-4 items-end">
                              <div className="w-40">
                                <Select value={statusFilter} onValueChange={val => setStatusFilters(f => ({ ...f, [vehicle.id]: val }))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="w-64">
                                <DateRangePicker value={dateRange} onChange={val => setDateRanges(f => ({ ...f, [vehicle.id]: val }))} />
                              </div>
                              <div className="flex gap-2 items-center">
                                <Input
                                  type="number"
                                  min={0}
                                  value={minPrice}
                                  onChange={e => setMinPrices(f => ({ ...f, [vehicle.id]: e.target.value }))}
                                  placeholder="Min Price"
                                  className="w-24"
                                />
                                <span className="mx-1 text-gray-400">-</span>
                                <Input
                                  type="number"
                                  min={0}
                                  value={maxPrice}
                                  onChange={e => setMaxPrices(f => ({ ...f, [vehicle.id]: e.target.value }))}
                                  placeholder="Max Price"
                                  className="w-24"
                                />
                              </div>
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Customer</TableHead>
                                  <TableHead>Dates</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Price</TableHead>
                                  <TableHead></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredBookings.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-400 py-6">
                                      No bookings for this vehicle with current filters.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  filteredBookings.map((booking: Booking) => (
                                    <TableRow key={booking.id}>
                                      <TableCell>{`User #${booking.userId}`}</TableCell>
                                      <TableCell>
                                        {format(new Date(booking.pickupDate), "MMM d, yyyy")} -{" "}
                                        {format(new Date(booking.returnDate), "MMM d, yyyy")}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Badge 
                                            className={cn(
                                              booking.status === "completed" && "bg-green-100 text-green-800",
                                              booking.status === "confirmed" && "bg-blue-100 text-blue-800",
                                              booking.status === "pending" && "bg-yellow-100 text-yellow-800",
                                              booking.status === "cancelled" && "bg-red-100 text-red-800",
                                              booking.status === "rejected" && "bg-gray-100 text-gray-800"
                                            )}
                                          >
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                          </Badge>
                                          {booking.status === "pending" && (
                                            <div className="flex items-center gap-2">
                                              <Button
                                                size="sm"
                                                onClick={() => handleStatusChange(booking.id, "confirmed")}
                                                className="bg-green-500 hover:bg-green-600 text-white"
                                              >
                                                Confirm
                                              </Button>
                                              <Button
                                                size="sm"
                                                onClick={() => handleStatusChange(booking.id, "cancelled")}
                                                className="bg-red-500 hover:bg-red-600 text-white"
                                              >
                                                Decline
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell>{formatPrice(booking.totalPrice)}</TableCell>
                                      <TableCell>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => setSelectedBooking(booking)}
                                        >
                                          View Details
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Performance Analytics</h2>
                  <p className="text-sm text-gray-500">Track your business performance and metrics</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <CircleDollarSign className="h-4 w-4 mr-2" />
                    Financial Reports
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center">
                    <div className="flex flex-col items-center text-center">
                      <BarChart3 className="h-12 w-12 text-primary/20 mb-4" />
                      <p className="text-sm text-gray-500">Analytics visualization coming soon</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Booking Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center">
                    <div className="flex flex-col items-center text-center">
                      <BarChart3 className="h-12 w-12 text-primary/20 mb-4" />
                      <p className="text-sm text-gray-500">Analytics visualization coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Vehicle Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Analytics Coming Soon</h3>
                    <p className="text-gray-500 mb-6 max-w-md">
                      We're working on bringing you detailed analytics and insights for your rental business performance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "customers" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Customer Management</h2>
                  <p className="text-sm text-gray-500">Manage your customer relationships</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">No customers yet</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  As customers book your vehicles, their information will appear here for you to manage.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <BookingDetailsModal 
        booking={selectedBooking} 
        onClose={() => setSelectedBooking(null)} 
      />
    </div>
  );
}