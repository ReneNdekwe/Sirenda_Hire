import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CarFront, Search, Menu, X, User, Globe, Bell, LogOut, Home, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Notification {
  id: number;
  message: string;
  type: 'booking_approved' | 'booking_rejected' | 'booking_cancelled';
  createdAt: string;
  read: boolean;
}

function NotificationBell() {
  const { user } = useAuth();
  const { data: notifications, refetch } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const markAsRead = async () => {
    try {
      await apiRequest('POST', '/api/notifications/mark-read');
      refetch();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={markAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto">
            {notifications?.length ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-2 rounded-md mb-1",
                    !notification.read && "bg-primary/5"
                  )}
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 p-2">No notifications</p>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 relative isolate overflow-hidden pt-6 pb-4 bg-gradient-to-br from-[#ff80b5] to-[#9089fc]">
      <div className="absolute inset-0 -z-10 bg-white/100 backdrop-blur-xl"></div>
      <div className="w-full">
        <div className="w-full max-w-[95%] mx-auto px-4 sm:px-8 lg:px-5 h-5 flex items-center justify-between">
          <div className="w-full flex items-center justify-between">
            <Link href="/">
              <img
                src="/uploads/Logo.png"
                alt="Sirenda Hire"
                style={{ height: "36px", width: "auto" }}
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-6 text-sm">
                <Link href="/vehicles">
                  <span className={cn(
                    "font-medium cursor-pointer px-3 py-2",
                    location === "/vehicles" ? "text-primary" : "text-gray-600 hover:text-gray-900"
                  )}>
                    Browse
                  </span>
                </Link>
                <Link href="/about-page">
                  <span className={cn(
                    "font-medium cursor-pointer px-3 py-2",
                    location === "/about-page" ? "text-primary" : "text-gray-600 hover:text-gray-900"
                  )}>
                    About Sirenda
                  </span>
                </Link>
                {user?.userType === "company" && (
                  <Link href="/dashboard">
                    <span className={cn(
                      "font-medium cursor-pointer px-3 py-2",
                      location === "/dashboard" ? "text-primary" : "text-gray-600 hover:text-gray-900"
                    )}>
                      Dashboard
                    </span>
                  </Link>
                )}
              </div>

              {user ? (
                <div className="flex items-center gap-4">
                  {user.userType === "client" && <NotificationBell />}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-full border-gray-200 flex items-center gap-2 pl-3 pr-2 h-10 hover:bg-gray-50 transition-colors">
                        <Menu className="h-4 w-4 text-gray-600" />
                        <Avatar className="h-7 w-7 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {user.fullName?.substring(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 mt-2 rounded-xl shadow-lg border border-gray-100">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                              {user.fullName?.substring(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{user.fullName || user.username}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        {user.userType === "company" ? (
                          <>
                            <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                              <Link href="/dashboard">
                                <div className="w-full flex items-center gap-3 cursor-pointer">
                                  <div className="p-2 rounded-lg bg-primary/10">
                                    <Search className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">Dashboard</p>
                                    <p className="text-xs text-gray-500">View your rental business</p>
                                  </div>
                                </div>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                              <Link href="/add-vehicle">
                                <div className="w-full flex items-center gap-3 cursor-pointer">
                                  <div className="p-2 rounded-lg bg-primary/10">
                                    <CarFront className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">List a vehicle</p>
                                    <p className="text-xs text-gray-500">Add new vehicle to your fleet</p>
                                  </div>
                                </div>
                              </Link>
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                            <Link href="/my-bookings">
                              <div className="w-full flex items-center gap-3 cursor-pointer">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <Search className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">My bookings</p>
                                  <p className="text-xs text-gray-500">View your rental history</p>
                                </div>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                          <Link href="/profile">
                            <div className="w-full flex items-center gap-3 cursor-pointer">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Profile</p>
                                <p className="text-xs text-gray-500">Manage your account</p>
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      </div>
                      <DropdownMenuSeparator />
                      <div className="p-2">
                        <DropdownMenuItem
                          onClick={() => logoutMutation.mutate()}
                          className="cursor-pointer p-3 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700"
                        >
                          <div className="w-full flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100">
                              <LogOut className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">Sign out</p>
                              <p className="text-xs text-red-500">Log out of your account</p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/auth">
                    <Button variant="outline" size="sm" className="rounded-full border-gray-200 text-gray-700">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90">
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="sm" className="rounded-full border-gray-200 flex items-center gap-2 pl-3 pr-2 h-10">
                  <Menu className="h-4 w-4 text-gray-600" />
                  {user ? (
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {user.fullName?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="h-4 w-4 text-gray-600" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-[300px] p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Access your account settings and navigation options
                </SheetDescription>
                <div className="flex flex-col h-full">
                  <div className="flex flex-col pt-6 px-6">
                    {user ? (
                      <div className="border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-3 mb-6">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                              {user.fullName?.substring(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{user.fullName || user.username}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {user.userType === "client" && (
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Bell className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Notifications</p>
                                <p className="text-xs text-gray-500">View your notifications</p>
                              </div>
                            </div>
                          )}
                          {user.userType === "company" ? (
                            <>
                              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                                  <div className="p-2 rounded-lg bg-primary/10">
                                    <Search className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">Dashboard</p>
                                    <p className="text-xs text-gray-500">View your rental business</p>
                                  </div>
                                </div>
                              </Link>
                              <Link href="/add-vehicle" onClick={() => setIsOpen(false)}>
                                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                                  <div className="p-2 rounded-lg bg-primary/10">
                                    <CarFront className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">List a vehicle</p>
                                    <p className="text-xs text-gray-500">Add new vehicle to your fleet</p>
                                  </div>
                                </div>
                              </Link>
                            </>
                          ) : (
                            <Link href="/my-bookings" onClick={() => setIsOpen(false)}>
                              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <Search className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">My bookings</p>
                                  <p className="text-xs text-gray-500">View your rental history</p>
                                </div>
                              </div>
                            </Link>
                          )}
                          <Link href="/profile" onClick={() => setIsOpen(false)}>
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Profile</p>
                                <p className="text-xs text-gray-500">Manage your account</p>
                              </div>
                            </div>
                          </Link>
                          <div 
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 cursor-pointer"
                            onClick={() => {
                              logoutMutation.mutate();
                              setIsOpen(false);
                            }}
                          >
                            <div className="p-2 rounded-lg bg-red-100">
                              <LogOut className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium text-red-600">Sign out</p>
                              <p className="text-xs text-red-500">Log out of your account</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className={cn(user ? "pt-6" : "")}>
                      <div className="text-sm font-semibold text-gray-900 mb-4">Navigation</div>
                      <div className="space-y-2">
                        <Link href="/" onClick={() => setIsOpen(false)}>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Home className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Home</p>
                              <p className="text-xs text-gray-500">Back to homepage</p>
                            </div>
                          </div>
                        </Link>
                        <Link href="/vehicles" onClick={() => setIsOpen(false)}>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <CarFront className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Browse vehicles</p>
                              <p className="text-xs text-gray-500">Find your perfect ride</p>
                            </div>
                          </div>
                        </Link>
                        <Link href="/about-page" onClick={() => setIsOpen(false)}>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Info className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">About Sirenda</p>
                              <p className="text-xs text-gray-500">Learn more about us</p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {!user && (
                      <div className="mt-auto pt-6 space-y-3">
                        <Link href="/auth" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" size="sm" className="w-full rounded-full border-gray-200 text-gray-700">
                            Log in
                          </Button>
                        </Link>
                        <Link href="/auth" onClick={() => setIsOpen(false)}>
                          <Button size="sm" className="w-full rounded-full">
                            Sign up
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
