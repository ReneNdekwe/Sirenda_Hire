import { Link } from "wouter";
import { CarFront, Linkedin, Instagram, Twitter } from "lucide-react";
import { useStaticAssets } from "./static-assets";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const staticAssets = useStaticAssets();
  
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-6 mb-2 md:mb-0">
            <Link href="/careers" className="text-gray-500 hover:text-primary transition-colors text-sm">
              Careers
            </Link>
            <Link href="/blog" className="text-gray-500 hover:text-primary transition-colors text-sm">
              Blog
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-primary transition-colors text-sm">
              Terms
            </Link>
          </div>
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <img
              src={staticAssets?.favicon || "/uploads/favicon.png"}
              alt="Sirenda Hire"
              style={{ height: "24px", width: "auto" }}
            />
            <span className="text-gray-500 text-sm">
              © {currentYear} Sirenda. All rights reserved.
            </span>
          </div>
          <div className="flex items-center">
            <div className="flex space-x-3 mr-4">
              <a href="https://www.linkedin.com/company/sirenda" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/sirenda.rw/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
