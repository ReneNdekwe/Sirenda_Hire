import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { motion } from 'framer-motion';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Clock, Briefcase, Building2, CheckCircle2 } from 'lucide-react';
import JobApplicationForm from '@/components/careers/JobApplicationForm';
import { toast } from 'sonner';

interface JobDetails {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  postedDate: string;
  createdAt: string;
  updatedAt: string;
}

const JobDetails: React.FC = () => {
  const [, setLocation] = useLocation();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get job ID from URL
  const [location] = useLocation();
  const jobId = location.split('/').pop();

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }
      const data = await response.json();
      setJobDetails(data);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to fetch job details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
            <p className="text-gray-600 mb-8">The job you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => setLocation('/careers')}>Back to Careers</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Button
            variant="ghost"
            className="mb-8 -ml-4"
            onClick={() => setLocation('/careers')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Careers
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{jobDetails.title}</h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      {jobDetails.department}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {jobDetails.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {jobDetails.type}
                    </div>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setShowApplicationForm(true)}
                >
                  Apply Now
                </Button>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">About the Role</h2>
                <p className="text-gray-600 mb-8">{jobDetails.description}</p>

                <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                <ul className="space-y-2 mb-8">
                  {jobDetails.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{requirement}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-center">
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => setShowApplicationForm(true)}
                  >
                    Apply for this Position
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />

      {showApplicationForm && (
        <JobApplicationForm
          jobTitle={jobDetails.title}
          jobId={jobDetails.id}
          onClose={() => setShowApplicationForm(false)}
        />
      )}
    </div>
  );
};

export default JobDetails; 