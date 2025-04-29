import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionDetails {
  status: string;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  daysRemaining: number;
  monthlyFee: number;
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch('/api/subscription/details', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription details');
      }

      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subscription details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Manage your rental company's subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Status</h3>
              <p className="text-lg">{subscription?.status || 'Inactive'}</p>
            </div>
            
            {subscription?.trialEndsAt && (
              <div>
                <h3 className="font-medium">Trial Ends</h3>
                <p className="text-lg">{new Date(subscription.trialEndsAt).toLocaleDateString()}</p>
              </div>
            )}

            {subscription?.subscriptionEndsAt && (
              <div>
                <h3 className="font-medium">Subscription Ends</h3>
                <p className="text-lg">{new Date(subscription.subscriptionEndsAt).toLocaleDateString()}</p>
              </div>
            )}

            <div>
              <h3 className="font-medium">Days Remaining</h3>
              <p className="text-lg">{subscription?.daysRemaining || 0} days</p>
            </div>

            <div>
              <h3 className="font-medium">Monthly Fee</h3>
              <p className="text-lg">${subscription?.monthlyFee || 0}/month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 