import { Link } from "wouter";
import { CarFront, Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-2 md:mb-0">
            <CarFront className="h-4 w-4 text-primary mr-1.5" />
            <span className="text-gray-900 font-medium text-sm">Car Rental Platform</span>
          </div>
          
          <div className="flex items-center">
            <div className="flex space-x-3 mr-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
            
            <span className="text-gray-500 text-xs">© {currentYear}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
