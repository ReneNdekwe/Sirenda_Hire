import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedCategories() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          Car Categories
        </h2>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="h-24 w-24 md:h-28 md:w-28 rounded-lg mb-4" />
                <Skeleton className="h-4 w-16 md:w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {categories?.map((category) => (
              <Link key={category.id} href={`/vehicles?categoryId=${category.id}`}>
                <a className="flex flex-col items-center group text-center">
                  <div className="h-24 w-24 md:h-28 md:w-28 rounded-lg overflow-hidden bg-gray-100 mb-2 relative">
                    {category.imageUrl ? (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500 text-2xl font-semibold">{category.name[0]}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  </div>
                  
                  <span className="text-sm font-medium mt-1 text-gray-700 group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                  
                  {category.priceFrom && (
                    <span className="text-xs text-gray-500 mt-1">
                      From ${category.priceFrom}/day
                    </span>
                  )}
                </a>
              </Link>
            ))}
            
            <Link href="/vehicles">
              <a className="flex flex-col items-center group text-center">
                <div className="h-24 w-24 md:h-28 md:w-28 rounded-lg overflow-hidden bg-gray-100 mb-2 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium mt-1 text-gray-700 group-hover:text-primary transition-colors">
                  View All
                </span>
              </a>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
