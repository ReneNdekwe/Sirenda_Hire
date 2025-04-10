import { useAuth } from "@/hooks/use-auth";
import Dashboard from "@/components/rental-company/dashboard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.userType !== 'company') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Access Denied</h1>
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V9m0 0V6m0 3h3m-3 0H9" />
            </svg>
          </div>
          <p className="text-gray-600 mb-6 text-center">
            This dashboard is only accessible to rental companies. Please log in with a rental company account.
          </p>
          <div className="flex justify-center">
            <a 
              href="/auth" 
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Directly render the Dashboard component with no header/footer
  // The dashboard now has its own layout with sidebar
  return <Dashboard />;
}
