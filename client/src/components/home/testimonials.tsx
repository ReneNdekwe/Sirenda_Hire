import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      content: "The booking process was incredibly simple, and the vehicle was even better than the pictures. Will definitely be using this service again for my next trip!",
      author: {
        name: "David W.",
        location: "New York",
        avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        initials: "DW"
      },
      rating: 5,
      date: "October 2023"
    },
    {
      content: "As a rental company, joining this platform has significantly increased our bookings. The interface is easy to use and the support team is always helpful.",
      author: {
        name: "Sarah J.",
        location: "Miami",
        avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        initials: "SJ"
      },
      rating: 5,
      date: "November 2023"
    },
    {
      content: "I rented a Porsche for my anniversary weekend and it made the trip unforgettable. The car was immaculate and the service was exceptional from start to finish.",
      author: {
        name: "Michael T.",
        location: "Chicago",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        initials: "MT"
      },
      rating: 5,
      date: "December 2023"
    }
  ];

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-10 text-gray-900">
          What guests are saying
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 border border-gray-200">
                    <AvatarImage src={testimonial.author.avatar} alt={testimonial.author.name} />
                    <AvatarFallback className="bg-gray-100 text-gray-600">{testimonial.author.initials}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">{testimonial.author.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.author.location}</p>
                  </div>
                </div>
                <div className="text-gray-500 text-sm">
                  {testimonial.date}
                </div>
              </div>
              
              <div className="flex items-center gap-0.5 text-primary">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-700 leading-relaxed text-sm">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
