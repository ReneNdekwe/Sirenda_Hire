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
import { CarFront, Search, Menu, X, User, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative isolate overflow-hidden pt-6 pb-4 bg-gradient-to-br from-[#ff80b5] to-[#9089fc]">
      <div className="absolute inset-0 -z-10 bg-white/90 backdrop-blur-xl"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 h-10 flex items-center justify-between">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/home">
        <img
  src="/uploads/Logo.png"
  alt="Sirenda Hire"
  style={{ height: "16px", width: "auto" }}
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
            <Link href="/how-it-works">
              <span className={cn(
                "font-medium cursor-pointer px-3 py-2",
                location === "/how-it-works" ? "text-primary" : "text-gray-600 hover:text-gray-900"
              )}>
                How it works
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full border-gray-200 flex items-center gap-2 pl-3 pr-2 h-10">
                  <Menu className="h-4 w-4 text-gray-600" />
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user.fullName?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
                {user.userType === "company" ? (
                  <>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/dashboard">
                        <div className="w-full flex items-center gap-2 cursor-pointer">
                          <Search className="h-4 w-4" />
                          <span>Dashboard</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/add-vehicle">
                        <div className="w-full flex items-center gap-2 cursor-pointer">
                          <CarFront className="h-4 w-4" />
                          <span>List a vehicle</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/my-bookings">
                      <div className="w-full flex items-center gap-2 cursor-pointer">
                        <Search className="h-4 w-4" />
                        <span>My bookings</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile">
                    <div className="w-full flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  className="cursor-pointer text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <CarFront className="h-6 w-6 text-primary" />
                    <span className="font-medium text-lg text-gray-900">CarRental</span>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full h-8 w-8">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>

              <div className="flex flex-col pt-6 px-6">
                {user ? (
                  <div className="border-b border-gray-100 pb-6">
                    <div className="text-sm font-semibold text-gray-900 mb-6">
                      {user.userType === "company" ? "Company account" : "Account"}
                    </div>
                    <div className="space-y-5 text-gray-600">
                      {user.userType === "company" ? (
                        <>
                          <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                            <div className="flex items-center gap-3 cursor-pointer hover:text-gray-900">
                              <Search className="h-5 w-5" />
                              <span>Dashboard</span>
                            </div>
                          </Link>
                          <Link href="/add-vehicle" onClick={() => setIsOpen(false)}>
                            <div className="flex items-center gap-3 cursor-pointer hover:text-gray-900">
                              <CarFront className="h-5 w-5" />
                              <span>List a vehicle</span>
                            </div>
                          </Link>
                        </>
                      ) : (
                        <Link href="/my-bookings" onClick={() => setIsOpen(false)}>
                          <div className="flex items-center gap-3 cursor-pointer hover:text-gray-900">
                            <Search className="h-5 w-5" />
                            <span>My bookings</span>
                          </div>
                        </Link>
                      )}
                      <Link href="/profile" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center gap-3 cursor-pointer hover:text-gray-900">
                          <User className="h-5 w-5" />
                          <span>Profile</span>
                        </div>
                      </Link>
                      <div 
                        className="flex items-center gap-3 cursor-pointer hover:text-gray-900"
                        onClick={() => {
                          logoutMutation.mutate();
                          setIsOpen(false);
                        }}
                      >
                        <Globe className="h-5 w-5" />
                        <span>Sign out</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className={cn(user ? "pt-6" : "")}>
                  <div className="text-sm font-semibold text-gray-900 mb-6">
                    Navigation
                  </div>
                  <div className="space-y-5 text-gray-600">
                    <Link href="/" onClick={() => setIsOpen(false)}>
                      <div className="flex items-center gap-3 cursor-pointer hover:text-gray-900">
                        <span>Home</span>
                      </div>
                    </Link>
                    <Link href="/vehicles" onClick={() => setIsOpen(false)}>
                      <div className="flex items-center gap-3 cursor-pointer hover:text-gray-900">
                        <span>Browse vehicles</span>
                      </div>
                    </Link>
                    <Link href="/how-it-works" onClick={() => setIsOpen(false)}>
                      <div className="flex items-center gap-3 cursor-pointer hover:text-gray-900">
                        <span>How it works</span>
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
    </header>
  );
}
