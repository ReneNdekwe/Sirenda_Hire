import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CTASection() {
  return (
    <section className="py-16 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="md:flex">
            <div className="md:w-1/2 p-10 md:p-12">
              <span className="inline-block text-sm px-3 py-1 bg-primary/10 text-primary rounded-full mb-4">
                Become a host
              </span>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Ready to start renting out your vehicles?
              </h2>
              <p className="text-gray-600 mb-8">
                Turn your extra cars into income by joining our network of rental providers. Our platform makes it easy to manage bookings and connect with customers seeking quality vehicles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Sign up as a provider
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button variant="outline" className="border-gray-200 hover:border-primary/20 text-gray-700 hover:text-primary">
                    Learn more
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative h-64 md:h-auto">
              <img 
                src="https://images.unsplash.com/photo-1617196701537-7329482cc9fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
                alt="Car rental service" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Ready to find your perfect ride?
          </h3>
          <Link href="/vehicles">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
              Browse vehicles
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
