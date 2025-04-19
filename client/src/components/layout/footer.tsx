import { Link } from "wouter";
import { CarFront, Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-2 md:mb-0">
          <img
  src="/uploads/Favicon.png"
  alt="Sirenda Hire"
  style={{ height: "12px", width: "auto" }}
/>
          </div>
          <div className="container text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Sirenda. All rights reserved.
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
          </div>
        </div>
      </div>
    </footer>
  );
}
