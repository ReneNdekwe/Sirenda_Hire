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
  CheckCircle2
} from "lucide-react";
import { format } from 'date-fns';

interface Booking {
  id: number;
  vehicleId: number;
  userId: number;
  pickupDate: string;
  returnDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
  customerName?: string;
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
          <p className="font-bold text-primary">${vehicle.pricePerDay}<span className="text-xs font-normal text-gray-500">/day</span></p>
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

  if (!user) return null;

  const handleEditVehicle = (id: number) => {
    navigate(`/edit-vehicle/${id}`);
  };

  const companyName = user.companyName || user.username;

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
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

      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: ['/api/rental-company/bookings'] });
      
      toast({
        title: "Success",
        description: `Booking status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      <div className="w-full lg:w-64 border-r border-gray-100 lg:min-h-screen bg-white">
        <div className="p-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {companyName}
          </h2>
          <p className="text-xs text-gray-500 mt-1">Rental Company Dashboard</p>
        </div>

        <Separator />

        <div className="p-4">
          <nav className="space-y-1">
            <SidebarItem 
              icon={Home} 
              label="Dashboard" 
              active={activeTab === "dashboard"} 
              onClick={() => setActiveTab("dashboard")}
            />
            <SidebarItem 
              icon={Car} 
              label="My Vehicles" 
              active={activeTab === "vehicles"} 
              onClick={() => setActiveTab("vehicles")}
            />
            <SidebarItem 
              icon={Calendar} 
              label="Bookings" 
              active={activeTab === "bookings"} 
              onClick={() => setActiveTab("bookings")}
            />
            <SidebarItem 
              icon={BarChart3} 
              label="Analytics" 
              active={activeTab === "analytics"} 
              onClick={() => setActiveTab("analytics")}
            />
            <SidebarItem 
              icon={Users} 
              label="Customers" 
              active={activeTab === "customers"} 
              onClick={() => setActiveTab("customers")}
            />
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              href="/profile"
            />
          </nav>
        </div>

        <Separator className="my-4" />

        <div className="p-4">
          {user.subscriptionStatus === 'active' ? (
            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 text-green-700 font-medium">
                <CheckCircle2 className="h-4 w-4" /> 
                <span>Active Subscription</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">Your rental company subscription is active. Enjoy all premium features.</p>
            </div>
          ) : user.subscriptionStatus === 'trial' ? (
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 text-blue-700 font-medium">
                <Star className="h-4 w-4" /> 
                <span>Trial Period</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">You're currently in your 30-day free trial. Subscribe to continue after trial ends.</p>
              <Link href="#subscription">
                <Button variant="outline" size="sm" className="w-full border-blue-600 text-blue-700 hover:bg-blue-700 hover:text-white">
                  View Subscription
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 text-red-700 font-medium">
                <AlertCircle className="h-4 w-4" /> 
                <span>Expired Subscription</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">Your subscription has expired. Renew now to continue listing your vehicles.</p>
              <Link href="#subscription">
                <Button variant="outline" size="sm" className="w-full border-red-600 text-red-700 hover:bg-red-700 hover:text-white">
                  Renew Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "vehicles" && "Vehicle Management"}
              {activeTab === "bookings" && "Booking Requests"}
              {activeTab === "analytics" && "Performance Analytics"}
              {activeTab === "customers" && "Customer Management"}
            </h1>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="mr-2"
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
                Reset Availability
              </Button>

              {/* Add Cancel Booking button when viewing bookings */}
              {activeTab === "bookings" && selectedBooking && (
                <Button 
                  variant="destructive"
                  className="ml-2"
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/bookings/${selectedBooking.id}/status`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({ status: 'cancelled' })
                      });
                      
                      if (!response.ok) throw new Error('Failed to cancel booking');
                      
                      queryClient.invalidateQueries({ queryKey: ['/api/rental-company/bookings'] });
                      queryClient.invalidateQueries({ queryKey: ['/api/my-vehicles'] });
                      
                      toast({
                        title: "Success",
                        description: "Booking has been cancelled",
                      });
                      
                      setSelectedBooking(null);
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to cancel booking",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Cancel Booking
                </Button>
              )}
              <Button variant="outline" size="icon" className="rounded-full relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
              </Button>
              <Button 
                variant="outline" 
                className="gap-2" 
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="h-4 w-4" />
                Logout
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
                  value={`$${analytics?.totalRevenue || 0}`} 
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
                    <div className="flex items-start gap-4">
                      <div className="bg-green-100 rounded-full p-2">
                        <Clock className="h-4 w-4 text-green-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">New booking request</h4>
                          <span className="text-xs text-gray-500">2 hours ago</span>
                        </div>
                        <p className="text-xs text-gray-500">New booking request for Mercedes-Benz S-Class</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Star className="h-4 w-4 text-blue-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">New review received</h4>
                          <span className="text-xs text-gray-500">1 day ago</span>
                        </div>
                        <p className="text-xs text-gray-500">You received a 5-star review for Porsche 911</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-amber-100 rounded-full p-2">
                        <CircleDollarSign className="h-4 w-4 text-amber-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Payment received</h4>
                          <span className="text-xs text-gray-500">2 days ago</span>
                        </div>
                        <p className="text-xs text-gray-500">You received payment of $420 for BMW 4 Series booking</p>
                      </div>
                    </div>
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

              {vehicles?.map((vehicle) => (
                <Card key={vehicle.id}>
                  <CardHeader>
                    <CardTitle>{vehicle.brand} {vehicle.model}</CardTitle>
                    <CardDescription>Booking history and requests</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                        {bookings?.filter((b: Booking) => b.vehicleId === vehicle.id).map((booking: Booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>{booking.customerName || `User #${booking.userId}`}</TableCell>
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
                                    booking.status === "cancelled" && "bg-red-100 text-red-800"
                                  )}
                                >
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </Badge>
                                {booking.status === "pending" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleStatusChange(booking.id, "confirmed")}
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                  >
                                    Confirm
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>${booking.totalPrice}</TableCell>
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
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
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
    </div>
  );
}