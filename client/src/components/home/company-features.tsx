import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BarChart3, Globe, Gauge, Lock } from "lucide-react";

export default function CompanyFeatures() {
  const features = [
    {
      icon: <Gauge className="h-8 w-8 text-primary-foreground" />,
      title: "Streamlined Management",
      description: "Manage your fleet, bookings, and customer communications all in one place."
    },
    {
      icon: <Globe className="h-8 w-8 text-primary-foreground" />,
      title: "Increased Visibility",
      description: "Reach more customers with enhanced listings and promotional features."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary-foreground" />,
      title: "Performance Analytics",
      description: "Track your business performance with detailed reports and analytics."
    },
    {
      icon: <Lock className="h-8 w-8 text-primary-foreground" />,
      title: "Secure Payments",
      description: "Receive payments securely and on time with our integrated payment system."
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-bold text-2xl md:text-3xl mb-2">For Rental Companies</h2>
          <p className="text-white text-opacity-80 max-w-2xl mx-auto">Join our network of premium car rental providers and grow your business</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-primary-light bg-opacity-20 rounded-lg p-6">
              <div className="text-cyan-300 mb-4">
                {feature.icon}
              </div>
              <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
              <p className="text-white text-opacity-80">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/auth">
            <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              Register Your Company
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
