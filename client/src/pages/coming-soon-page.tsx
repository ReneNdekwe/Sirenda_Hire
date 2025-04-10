import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Settings, Sparkles } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Simple header */}
      <header className="border-b border-gray-100 py-4">
        <div className="container flex justify-between items-center">
          <Link href="/">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              CarHire
            </h1>
          </Link>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container flex flex-col items-center justify-center py-20 text-center max-w-3xl mx-auto">
        <div className="bg-primary/10 p-4 rounded-full mb-8">
          <Sparkles className="w-12 h-12 text-primary" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Coming Soon
        </h1>
        
        <p className="text-lg text-gray-600 mb-10 max-w-md">
          We're working hard to bring you this feature. Stay tuned for updates!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-12">
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
            <Calendar className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-lg font-bold mb-2">Development in Progress</h3>
            <p className="text-gray-500 text-sm">Our team is actively building this feature.</p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
            <Clock className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-lg font-bold mb-2">Launch Soon</h3>
            <p className="text-gray-500 text-sm">We're aiming to launch this feature soon.</p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
            <Settings className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-lg font-bold mb-2">Fine-tuning</h3>
            <p className="text-gray-500 text-sm">We're perfecting every aspect of this feature.</p>
          </div>
        </div>
        
        <Link href="/">
          <Button size="lg">
            Return to Dashboard
          </Button>
        </Link>
      </main>
      
      {/* Footer */}
      <footer className="py-6 border-t border-gray-100">
        <div className="container text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} CarHire. All rights reserved.
        </div>
      </footer>
    </div>
  );
}