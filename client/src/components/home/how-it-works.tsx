import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Search, Calendar, Car } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Search",
      description: "Find the perfect vehicle by location, date, or vehicle type."
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Book",
      description: "Choose your pickup and return dates for a seamless reservation process."
    },
    {
      icon: <Car className="h-6 w-6" />,
      title: "Drive",
      description: "Pick up your vehicle and enjoy your journey with premium comfort."
    }
  ];

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-10 text-gray-900">
          How booking works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 max-w-4xl">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col">
              <div className="text-primary mb-4">
                {step.icon}
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 relative">
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
            <div className="md:flex items-center justify-between gap-8">
              <div className="mb-6 md:mb-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to experience premium car rentals?</h3>
                <p className="text-gray-600">Join thousands of satisfied customers who trust our service for their travel needs.</p>
              </div>
              <div className="flex-shrink-0">
                <Link href="/vehicles">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Browse Vehicles
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}