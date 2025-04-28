import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { User, Vehicle, Booking, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  Car,
  Building2,
  Calendar,
  CircleDollarSign,
  Settings,
  Home,
  AreaChart,
  ChevronRight,
  ShieldCheck,
  Bell,
  ArrowUpRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  SquareCheck,
  SearchCheck,
  Award,
  BarChart,
  ArrowDownUp,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { format } from 'date-fns';
import { apiRequest } from "@/lib/apiRequest";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28', '#ff8042'];

const SUBSCRIPTION_TIERS = [
  {
    name: "Basic",
    price: 15000,
    features: [
      "Up to 3 vehicles",
      "Basic analytics",
      "Email support",
      "Standard listing"
    ]
  },
  {
    name: "Pro",
    price: 30000,
    features: [
      "Up to 10 vehicles",
      "Advanced analytics",
      "Priority support",
      "Featured listings",
      "Custom branding"
    ]
  },
  {
    name: "Enterprise",
    price: 50000,
    features: [
      "Up to 25 vehicles",
      "Full analytics suite",
      "24/7 support",
      "Premium listings",
      "API access",
      "Custom integrations"
    ]
  }
];

// Mini-component for sidebar menu items
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

// Stats card component for reusability
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
              {trend === "up" && <ArrowUpRight className="h-3 w-3 text-green-500" />}
              {trend === "down" && <ArrowUpRight className="h-3 w-3 rotate-180 text-red-500" />}
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

// Component for company cards
function CompanyCard({ company }: { company: User }) {
  return (
    <Card className="overflow-hidden border border-gray-200 transition-all hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              {company.companyLogo ? (
                <img 
                  src={company.companyLogo} 
                  alt={company.companyName || company.username} 
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <Building2 className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">{company.companyName || company.username}</h3>
              <p className="text-sm text-gray-500">{company.email}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Joined</p>
            <p className="font-medium">Jan 15, 2023</p>
          </div>
          <div>
            <p className="text-gray-500">Vehicles</p>
            <p className="font-medium">12</p>
          </div>
          <div>
            <p className="text-gray-500">Revenue</p>
            <p className="font-medium">$4,250</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-medium text-green-600">Paid</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t">
        <div className="flex justify-between w-full">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <ArrowDownUp className="h-4 w-4 mr-1" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem>
                <XCircle className="h-4 w-4 mr-2" />
                Suspend
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <CircleDollarSign className="h-4 w-4 mr-2" />
                View Payments
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}

function PaymentRow({ payment }: { payment: any }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{payment.companyName}</p>
            <p className="text-xs text-gray-500">{payment.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">${payment.amount}</div>
        <div className="text-xs text-gray-500">Monthly subscription</div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{payment.date}</div>
        <div className="text-xs text-gray-500">{payment.time}</div>
      </TableCell>
      <TableCell>
        <Badge 
          className={cn(
            "px-2 py-1 text-xs",
            payment.status === "Completed" ? "bg-green-100 text-green-800" :
            payment.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
            payment.status === "Failed" ? "bg-red-100 text-red-800" : ""
          )}
        >
          {payment.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch real data from API endpoints
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['/api/admin/analytics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      return response.json();
    },
  });

  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['/api/admin/companies'],
    queryFn: async () => {
      const response = await fetch('/api/admin/companies', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      return response.json();
    },
  });

  const { data: usersData = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await apiRequest<User[]>("/api/admin/users");
      return response;
    },
  });

  const { data: vehiclesData = [], isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ["admin-vehicles"],
    queryFn: async () => {
      const response = await apiRequest<Vehicle[]>("/api/admin/vehicles");
      return response;
    },
  });

  const { data: bookingsData = [], isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const response = await apiRequest<Booking[]>("/api/admin/bookings");
      return response;
    },
  });

  const getUserName = (userId: number) => {
    const user = usersData.find((u: User) => u.id === userId);
    return user ? user.username : `User ${userId}`;
  };

  const getVehicleName = (vehicleId: number) => {
    const vehicle = vehiclesData.find((v: Vehicle) => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model}` : `Vehicle ${vehicleId}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Route protection
  if (!user || user.userType !== "admin") {
  return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Admin Access Required</h1>
          <p className="text-muted-foreground">
            This section is only accessible to system administrators.
          </p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
          </div>
          </div>
    );
  }

  const BookingRow = ({ booking }: { booking: Booking }) => {
    return (
      <TableRow>
        <TableCell>
          <div className="font-medium">{getUserName(booking.userId)}</div>
          <div className="text-sm text-muted-foreground">ID: {booking.userId}</div>
      </TableCell>
      <TableCell>
          <div className="font-medium">{getVehicleName(booking.vehicleId)}</div>
          <div className="text-sm text-muted-foreground">ID: {booking.vehicleId}</div>
      </TableCell>
      <TableCell>
          <div className="font-medium">{format(new Date(booking.pickupDate), "MMM d, yyyy")}</div>
          <div className="text-sm text-muted-foreground">{format(new Date(booking.returnDate), "MMM d, yyyy")}</div>
      </TableCell>
      <TableCell>
          <div className="font-medium">{formatPrice(booking.totalPrice)}</div>
          <div className="text-sm text-muted-foreground">{booking.paymentStatus}</div>
      </TableCell>
      <TableCell>
          <Badge variant={getStatusVariant(booking.status)}>
          {booking.status}
        </Badge>
      </TableCell>
      <TableCell>
          <span className="text-xs text-gray-500">
            {format(booking.createdAt ? new Date(booking.createdAt) : new Date(), "MMM d, h:mm a")}
          </span>
      </TableCell>
    </TableRow>
  );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-100 min-h-[calc(100vh-64px)] bg-white hidden lg:block">
          <div className="p-6">
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Admin Dashboard
            </h2>
            <p className="text-xs text-gray-500 mt-1">Business Operations</p>
          </div>
          
          <Separator />
          
          <div className="p-4">
            <nav className="space-y-1">
              <SidebarItem 
                icon={Home} 
                label="Overview" 
                active={activeTab === "overview"} 
                onClick={() => setActiveTab("overview")}
              />
              <SidebarItem 
                icon={Building2} 
                label="Companies" 
                active={activeTab === "companies"} 
                onClick={() => setActiveTab("companies")}
              />
              <SidebarItem 
                icon={Users} 
                label="Users" 
                active={activeTab === "users"} 
                onClick={() => setActiveTab("users")}
              />
              <SidebarItem 
                icon={Car} 
                label="Vehicles" 
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
                icon={CircleDollarSign} 
                label="Payments" 
                active={activeTab === "payments"} 
                onClick={() => setActiveTab("payments")}
              />
              <SidebarItem 
                icon={BarChart3} 
                label="Analytics" 
                active={activeTab === "analytics"} 
                onClick={() => setActiveTab("analytics")}
              />
              <SidebarItem 
                icon={Settings} 
                label="Settings" 
                active={activeTab === "settings"} 
                onClick={() => setActiveTab("settings")}
              />
            </nav>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "companies" && "Rental Companies"}
                {activeTab === "users" && "User Management"}
                {activeTab === "vehicles" && "Vehicle Listings"}
                {activeTab === "bookings" && "Booking Management"}
                {activeTab === "payments" && "Payment History"}
                {activeTab === "analytics" && "Platform Analytics"}
                {activeTab === "settings" && "Platform Settings"}
              </h1>
              <p className="text-gray-500">
                {activeTab === "overview" && "Monitor platform performance and activity"}
                {activeTab === "companies" && "Manage rental companies and their subscriptions"}
                {activeTab === "users" && "View and manage user accounts"}
                {activeTab === "vehicles" && "Explore all vehicle listings"}
                {activeTab === "bookings" && "Track and manage booking requests"}
                {activeTab === "payments" && "Review payment transactions"}
                {activeTab === "analytics" && "Analyze platform metrics and trends"}
                {activeTab === "settings" && "Configure platform settings"}
              </p>
            </div>
          </div>
          
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Users" 
                  value={analytics?.totalUsers || "0"} 
                  icon={Users} 
                  trend="up" 
                  trendValue="+12% from last month"
                  bgClass="bg-gradient-to-r from-blue-500 to-indigo-500"
                />
                <StatCard 
                  title="Rental Companies" 
                  value={analytics?.totalCompanies || "0"} 
                  icon={Building2} 
                  trend="up" 
                  trendValue="+3 this month"
                  bgClass="bg-gradient-to-r from-green-500 to-emerald-500"
                />
                <StatCard 
                  title="Total Vehicles" 
                  value={analytics?.totalVehicles || "0"} 
                  icon={Car} 
                  trend="up" 
                  trendValue="+8% from last month"
                  bgClass="bg-gradient-to-r from-amber-500 to-orange-500"
                />
                <StatCard 
                  title="Total Revenue" 
                  value={`$${analytics?.totalRevenue || "0"}`} 
                  icon={CircleDollarSign} 
                  trend="up" 
                  trendValue="+15% from last month"
                  bgClass="bg-gradient-to-r from-purple-500 to-pink-500"
                />
                <StatCard 
                  title="Monthly Bookings" 
                  value={analytics?.monthlyBookings || "0"} 
                  icon={Calendar} 
                  trend="up" 
                  trendValue="+20% from last month"
                  bgClass="bg-gradient-to-r from-cyan-500 to-blue-500"
                />
                <StatCard 
                  title="Average Booking Value" 
                  value={`$${Math.round(analytics?.avgBookingValue || 0)}`} 
                  icon={CircleDollarSign} 
                  trend="up" 
                  trendValue="+5% from last month"
                  bgClass="bg-gradient-to-r from-rose-500 to-pink-500"
                />
                <StatCard 
                  title="Active Listings" 
                  value={analytics?.activeListings || "0"} 
                  icon={Car} 
                  trend="up" 
                  trendValue="+10% from last month"
                  bgClass="bg-gradient-to-r from-violet-500 to-purple-500"
                />
                <StatCard 
                  title="Conversion Rate" 
                  value={`${analytics?.conversionRate || "0"}%`} 
                  icon={BarChart} 
                  trend="up" 
                  trendValue="+2% from last month"
                  bgClass="bg-gradient-to-r from-teal-500 to-emerald-500"
                />
              </div>
              
              {/* Trends Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trends</CardTitle>
                    <CardDescription>Monthly revenue over the past 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={analytics?.monthlyStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="month" 
                            tickFormatter={(value) => format(new Date(value), 'MMM yyyy')}
                          />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`$${value}`, 'Revenue']}
                            labelFormatter={(label) => format(new Date(label), 'MMMM yyyy')}
                          />
                          <Bar dataKey="revenue" fill="#8884d8" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Booking Distribution</CardTitle>
                    <CardDescription>Distribution of bookings by vehicle type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analytics?.bookingDistribution?.rows || []}
                            dataKey="count"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {(analytics?.bookingDistribution?.rows || []).map((_: unknown, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [`${value} bookings`, 'Count']}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                        </div>
                  </CardContent>
                </Card>
                          </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform activities and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookingsData?.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-start gap-4">
                        <div className="bg-blue-100 rounded-full p-2">
                          <Calendar className="h-4 w-4 text-blue-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">New booking created</h4>
                            <span className="text-xs text-gray-500">
                              {format(booking.createdAt ? new Date(booking.createdAt) : new Date(), "MMM d, h:mm a")}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {getVehicleName(booking.vehicleId)} booked by {getUserName(booking.userId)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {usersData?.slice(0, 3).map((user) => (
                      <div key={user.id} className="flex items-start gap-4">
                        <div className="bg-green-100 rounded-full p-2">
                          <UserPlus className="h-4 w-4 text-green-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">New user registered</h4>
                            <span className="text-xs text-gray-500">
                              {format(user.createdAt ? new Date(user.createdAt) : new Date(), "MMM d, h:mm a")}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {user.username} ({user.userType})
                          </p>
                        </div>
                      </div>
                    ))}
                    {vehiclesData?.slice(0, 3).map((vehicle) => (
                      <div key={vehicle.id} className="flex items-start gap-4">
                        <div className="bg-purple-100 rounded-full p-2">
                          <Car className="h-4 w-4 text-purple-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">New vehicle listed</h4>
                            <p className="text-xs text-gray-500">
                              {vehicle.brand} {vehicle.model} by {getUserName(vehicle.ownerId)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                  </CardContent>
                </Card>
            </div>
          )}
                
          {/* Companies Tab */}
          {activeTab === "companies" && (
            <div className="space-y-6">
                <Card>
                <CardHeader>
                  <CardTitle>Rental Companies</CardTitle>
                  <CardDescription>Manage rental companies and their subscriptions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                        <TableHead>Contact</TableHead>
                          <TableHead>Status</TableHead>
                        <TableHead>Vehicles</TableHead>
                        <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {isLoadingCompanies ? (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <div className="flex items-center justify-center py-4">
                              <Skeleton className="h-4 w-[250px]" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        companies?.map((company: User) => (
                          <TableRow key={company.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Building2 className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{company.companyName}</p>
                                  <p className="text-xs text-gray-500">{company.username}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{company.email}</p>
                              <p className="text-xs text-gray-500">{company.phone}</p>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={cn(
                                  "px-2 py-1 text-xs",
                                  company.subscriptionStatus === "active" ? "bg-green-100 text-green-800" :
                                  company.subscriptionStatus === "trial" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-red-100 text-red-800"
                                )}
                              >
                                {company.subscriptionStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                  {vehiclesData?.filter((v: Vehicle) => v.ownerId === company.id).length || 0}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <ArrowDownUp className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Suspend
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
                <Card>
                  <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage user accounts</CardDescription>
                  </CardHeader>
                  <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingUsers ? (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <div className="flex items-center justify-center py-4">
                              <Skeleton className="h-4 w-[250px]" />
                        </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        usersData?.map((user: User) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                                  <p className="font-medium">{user.fullName}</p>
                                  <p className="text-xs text-gray-500">{user.username}</p>
                        </div>
                      </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{user.email}</p>
                              <p className="text-xs text-gray-500">{user.phone}</p>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={cn(
                                  "px-2 py-1 text-xs",
                                  user.userType === "admin" ? "bg-purple-100 text-purple-800" :
                                  user.userType === "company" ? "bg-blue-100 text-blue-800" :
                                  "bg-gray-100 text-gray-800"
                                )}
                              >
                                {user.userType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800 px-2 py-1 text-xs">
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <ArrowDownUp className="h-4 w-4" />
                      </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Verify
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Ban
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Vehicles Tab */}
          {activeTab === "vehicles" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Listings</CardTitle>
                  <CardDescription>Explore all vehicle listings</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Owner</TableHead>
                          <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {isLoadingVehicles ? (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <div className="flex items-center justify-center py-4">
                              <Skeleton className="h-4 w-[250px]" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        vehiclesData?.map((vehicle: Vehicle) => (
                          <TableRow key={vehicle.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Car className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                                  <p className="text-xs text-gray-500">{vehicle.year}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">
                                {companies?.find((c: User) => c.id === vehicle.ownerId)?.companyName}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={cn(
                                  "px-2 py-1 text-xs",
                                  vehicle.availability ? "bg-green-100 text-green-800" :
                                  "bg-red-100 text-red-800"
                                )}
                              >
                                {vehicle.availability ? "Available" : "Unavailable"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">${vehicle.pricePerDay}/day</div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <ArrowDownUp className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Verify
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      </TableBody>
                    </Table>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Management</CardTitle>
                  <CardDescription>Track and manage booking requests</CardDescription>
                </CardHeader>
                <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Customer</TableHead>
                              <TableHead>Vehicle</TableHead>
                              <TableHead>Dates</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                      {isLoadingBookings ? (
                              <TableRow>
                          <TableCell colSpan={6}>
                            <div className="flex items-center justify-center py-4">
                              <Skeleton className="h-4 w-[250px]" />
                            </div>
                          </TableCell>
                              </TableRow>
                      ) : (
                        bookingsData?.map((booking: Booking) => (
                                  <BookingRow key={booking.id} booking={booking} />
                        ))
                      )}
                            </TableBody>
                          </Table>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Subscription Tiers */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Tiers</CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SUBSCRIPTION_TIERS.map((tier) => (
                  <Card key={tier.name} className={cn(
                    "relative",
                    user?.subscriptionTier === tier.name.toLowerCase() && "border-primary"
                  )}>
                    <CardHeader>
                      <CardTitle>{tier.name}</CardTitle>
                      <CardDescription>
                        <span className="text-2xl font-bold">{tier.price.toLocaleString('en-RW')} RWF</span>
                        <span className="text-gray-500">/month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        variant={user?.subscriptionTier === tier.name.toLowerCase() ? "default" : "outline"}
                        onClick={() => {
                          // TODO: Implement subscription change
                          console.log(`Upgrade to ${tier.name}`);
                        }}
                      >
                        {user?.subscriptionTier === tier.name.toLowerCase() ? "Current Plan" : "Upgrade"}
                </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}