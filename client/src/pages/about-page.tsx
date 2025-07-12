import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { MapPin, Mail, Phone, Clock } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          </div>
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="text-center lg:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    About Sirenda
                  </h1>
                  <p className="text-lg text-gray-600">
                    <span className="text-primary font-semibold">Born in 2025</span> (yes, we're younger than your old plugs--yet already shifting gears on Rwanda's mobility), Sirenda is <span className="font-semibold">Rwanda's top spot for car rentals</span> that don't require a dozen phone calls and a cousin who "knows a guy." Our mission? To <span className="text-primary font-semibold">connect car owners and renters</span> without the usual drama. Whether you're listing your ride or hunting for the perfect wheels to flex at a wedding, Sirenda's got your back.
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Location</h3>
                        <p className="text-gray-600">Kigali, Rwanda</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Email</h3>
                        <p className="text-gray-600">support@sirenda.rw</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Phone</h3>
                        <p className="text-gray-600">+250 784 810 776</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Business Hours</h3>
                        <p className="text-gray-600">24/7</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Sirenda vs Traditional Car Rental
              </h2>
              
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                  <div className="p-8">
                    <h3 className="text-2xl font-semibold mb-6 text-primary">Sirenda</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                        <span>Easy online booking process</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                        <span>Transparent pricing with no hidden fees</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                        <span>Flexible rental periods</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                        <span>24/7 customer support</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                        <span>Wide selection of vehicles</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-600">Traditional Rental</h3>
                    <ul className="space-y-4 text-gray-500">
                      <li className="flex items-start">
                        <span className="text-red-500 mr-3">×</span>
                        <span>Long waiting times at rental offices</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-3">×</span>
                        <span>Complex pricing with hidden charges</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-3">×</span>
                        <span>Limited operating hours</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-3">×</span>
                        <span>Limited vehicle options</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-3">×</span>
                        <span>Rigid rental policies</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">10+</div>
                <div className="text-gray-600">Vehicles Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-gray-600">Customer Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">4.5</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Experience Better Car Rental?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of satisfied customers who trust Sirenda for their car rental needs in Rwanda.
              </p>
              <Link href="/vehicles">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg">
                  Browse Available Cars
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 