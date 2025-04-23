import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function BrowseByOccasion() {
  const occasions = [
    {
      image: "/uploads/occasions/family-vacation.jpg",
      title: "Family Vacation",
      href: "/vehicles?occasion=family"
    },
    {
      image: "/uploads/occasions/safari.jpg",
      title: "Rwanda Safari",
      href: "/vehicles?occasion=safari"
    },
    {
      image: "/uploads/occasions/airport.jpg",
      title: "Airport Pickup",
      href: "/vehicles?occasion=airport"
    },
    {
      image: "/uploads/occasions/wedding.jpg",
      title: "Weddings",
      href: "/vehicles?occasion=wedding"
    },
    {
      image: "/uploads/occasions/business.jpg",
      title: "Business",
      href: "/vehicles?occasion=business"
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Occasion</h2>
          <p className="text-gray-600">Find the perfect vehicle for your needs</p>
        </div>

        <div className="flex justify-center items-center gap-8 flex-wrap">
          {occasions.map((occasion, index) => (
            <Link key={index} href={occasion.href}>
              <div className="group flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-primary/20 overflow-hidden">
                  <img 
                    src={occasion.image} 
                    alt={occasion.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-base font-medium text-gray-700 group-hover:text-primary transition-colors">
                  {occasion.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 