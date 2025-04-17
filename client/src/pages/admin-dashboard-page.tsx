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
  PieChart,
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

function BookingRow({ booking }: { booking: any }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{booking.userName}</p>
            <p className="text-xs text-gray-500">{booking.userEmail}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{booking.vehicleName}</div>
        <div className="text-xs text-gray-500">{booking.companyName}</div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{booking.startDate}</div>
        <div className="text-xs text-gray-500">{booking.endDate}</div>
      </TableCell>
      <TableCell>
        <div className="font-medium">${booking.totalAmount}</div>
      </TableCell>
      <TableCell>
        <Badge 
          className={cn(
            "px-2 py-1 text-xs",
            booking.status === "Completed" ? "bg-green-100 text-green-800" :
            booking.status === "Confirmed" ? "bg-blue-100 text-blue-800" :
            booking.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
            booking.status === "Cancelled" ? "bg-red-100 text-red-800" : ""
          )}
        >
          {booking.status}
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
              Approve
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Simulated data (would be fetched from API in production)
  const companies = [
    { id: 1, username: "LuxuryCars", companyName: "Luxury Cars Rwanda", email: "info@luxurycars.rw", companyLogo: null, userType: "company" },
    { id: 2, username: "PremiumRentals", companyName: "Premium Rentals", email: "contact@premiumrentals.rw", companyLogo: null, userType: "company" },
    { id: 3, username: "KigaliDrive", companyName: "Kigali Drive", email: "support@kigalidrive.rw", companyLogo: null, userType: "company" },
    { id: 4, username: "RwandaWheels", companyName: "Rwanda Wheels", email: "hello@rwandawheels.rw", companyLogo: null, userType: "company" }
  ] as User[];

  const paymentHistory = [
    { id: 1, companyName: "Luxury Cars Rwanda", email: "info@luxurycars.rw", amount: 10, date: "May 1, 2023", time: "09:45 AM", status: "Completed" },
    { id: 2, companyName: "Premium Rentals", email: "contact@premiumrentals.rw", amount: 10, date: "May 1, 2023", time: "10:30 AM", status: "Completed" },
    { id: 3, companyName: "Kigali Drive", email: "support@kigalidrive.rw", amount: 10, date: "May 1, 2023", time: "11:15 AM", status: "Pending" },
    { id: 4, companyName: "Rwanda Wheels", email: "hello@rwandawheels.rw", amount: 10, date: "May 1, 2023", time: "01:20 PM", status: "Failed" }
  ];

  const recentBookings = [
    { id: 1, userName: "John Doe", userEmail: "john@example.com", vehicleName: "Mercedes-Benz S-Class", companyName: "Luxury Cars Rwanda", startDate: "May 5, 2023", endDate: "May 10, 2023", totalAmount: 450, status: "Confirmed" },
    { id: 2, userName: "Jane Smith", userEmail: "jane@example.com", vehicleName: "BMW 7 Series", companyName: "Premium Rentals", startDate: "May 7, 2023", endDate: "May 9, 2023", totalAmount: 280, status: "Pending" },
    { id: 3, userName: "Robert Johnson", userEmail: "robert@example.com", vehicleName: "Audi A8", companyName: "Kigali Drive", startDate: "May 3, 2023", endDate: "May 8, 2023", totalAmount: 520, status: "Completed" },
    { id: 4, userName: "Emily Williams", userEmail: "emily@example.com", vehicleName: "Toyota Land Cruiser", companyName: "Rwanda Wheels", startDate: "May 6, 2023", endDate: "May 15, 2023", totalAmount: 750, status: "Cancelled" }
  ];

  // Route protection - only accessible to admin
  if (!user || user.userType !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          You don't have permission to access this page. Only administrators can view the admin dashboard.
        </p>
        <Button onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </div>
    );
  }
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
          
          <Separator className="my-4" />
          
          <div className="p-4">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 text-amber-700 font-medium">
                <ShieldCheck className="h-4 w-4" /> 
                <span>Admin Controls</span>
              </div>
              <p className="text-xs text-amber-800 mb-3">Access advanced system settings and controls.</p>
              <Button variant="outline" size="sm" className="w-full border-amber-400 text-amber-700 hover:bg-amber-200">
                System Settings
              </Button>
            </div>
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
            
            {activeTab === "companies" && (
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Company
              </Button>
            )}
          </div>
          
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Companies" 
                  value="24" 
                  icon={Building2} 
                  trend="up" 
                  trendValue="+3 this month"
                  bgClass="bg-gradient-to-r from-blue-500 to-indigo-500"
                />
                <StatCard 
                  title="Active Users" 
                  value="346" 
                  icon={Users} 
                  trend="up" 
                  trendValue="+12% from last month"
                  bgClass="bg-gradient-to-r from-green-500 to-emerald-500"
                />
                <StatCard 
                  title="Total Bookings" 
                  value="1,258" 
                  icon={Calendar} 
                  trend="up" 
                  trendValue="+8% from last month"
                  bgClass="bg-gradient-to-r from-amber-500 to-orange-500"
                />
                <StatCard 
                  title="Monthly Revenue" 
                  value="$2,450" 
                  icon={CircleDollarSign} 
                  trend="up" 
                  trendValue="+15% from last month"
                  bgClass="bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
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
                          <Building2 className="h-4 w-4 text-green-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">New company registered</h4>
                            <span className="text-xs text-gray-500">2 hours ago</span>
                          </div>
                          <p className="text-xs text-gray-500">Kigali Executive Cars registered as a new rental company</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 rounded-full p-2">
                          <Calendar className="h-4 w-4 text-blue-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">New booking created</h4>
                            <span className="text-xs text-gray-500">3 hours ago</span>
                          </div>
                          <p className="text-xs text-gray-500">Mercedes-Benz S-Class booked for 5 days</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="bg-amber-100 rounded-full p-2">
                          <CircleDollarSign className="h-4 w-4 text-amber-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Subscription payment received</h4>
                            <span className="text-xs text-gray-500">5 hours ago</span>
                          </div>
                          <p className="text-xs text-gray-500">Premium Rentals paid $10 monthly subscription</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="bg-purple-100 rounded-full p-2">
                          <Car className="h-4 w-4 text-purple-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">New vehicle listed</h4>
                            <span className="text-xs text-gray-500">1 day ago</span>
                          </div>
                          <p className="text-xs text-gray-500">Luxury Cars Rwanda added Audi Q7</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Payment History Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Payments</CardTitle>
                      <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setActiveTab("payments")}>
                        View all <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistory.slice(0, 3).map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div className="font-medium">{payment.companyName}</div>
                              <div className="text-xs text-gray-500">{payment.email}</div>
                            </TableCell>
                            <TableCell>${payment.amount}</TableCell>
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
                            <TableCell>{payment.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
              
              {/* Platform Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Booking Statistics</CardTitle>
                    <CardDescription>Monthly booking trends across the platform</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <BarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Chart visualization would appear here</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Categories</CardTitle>
                    <CardDescription>Distribution by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Luxury Sedans</span>
                          <span className="text-sm font-medium">35%</span>
                        </div>
                        <Progress value={35} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">SUVs</span>
                          <span className="text-sm font-medium">28%</span>
                        </div>
                        <Progress value={28} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Sport Cars</span>
                          <span className="text-sm font-medium">22%</span>
                        </div>
                        <Progress value={22} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Convertibles</span>
                          <span className="text-sm font-medium">15%</span>
                        </div>
                        <Progress value={15} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {/* Companies Tab */}
          {activeTab === "companies" && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">Company Management</h3>
                      <p className="text-sm text-gray-500">Monitor and manage rental company accounts</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm">
                        <SearchCheck className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Award className="h-4 w-4 mr-2" />
                        Set Featured
                      </Button>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="active">
                    <TabsList className="mb-4">
                      <TabsTrigger value="active">Active Companies</TabsTrigger>
                      <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                      <TabsTrigger value="suspended">Suspended</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="active">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {companies.map((company) => (
                          <CompanyCard key={company.id} company={company} />
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="pending">
                      <div className="text-center py-12">
                        <SquareCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Pending Companies</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          There are no companies waiting for approval at the moment.
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="suspended">
                      <div className="text-center py-12">
                        <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Suspended Companies</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          There are no suspended companies at the moment.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">Payment Transactions</h3>
                      <p className="text-sm text-gray-500">View and manage subscription payments</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm">
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                      <Button variant="outline" size="sm">
                        <SearchCheck className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistory.map((payment) => (
                          <PaymentRow key={payment.id} payment={payment} />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">Booking Management</h3>
                      <p className="text-sm text-gray-500">Monitor and manage all bookings across the platform</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm">
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm">
                        <SearchCheck className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="all">
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All Bookings</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                      <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Customer</TableHead>
                              <TableHead>Vehicle</TableHead>
                              <TableHead>Dates</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recentBookings.map((booking) => (
                              <BookingRow key={booking.id} booking={booking} />
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                    
                    {["pending", "confirmed", "completed", "cancelled"].map((status) => (
                      <TabsContent key={status} value={status}>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Vehicle</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {recentBookings
                                .filter((b) => b.status.toLowerCase() === status)
                                .map((booking) => (
                                  <BookingRow key={booking.id} booking={booking} />
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Other Tabs (placeholder content) */}
          {(activeTab === "users" || activeTab === "vehicles" || activeTab === "analytics" || activeTab === "settings") && (
            <div className="flex items-center justify-center bg-white p-12 rounded-lg shadow-sm border border-gray-100">
              <div className="text-center">
                <Clock className="h-16 w-16 text-primary/20 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  This section is currently under development and will be available soon.
                </p>
                <Button variant="outline" onClick={() => setActiveTab("overview")}>
                  Return to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}