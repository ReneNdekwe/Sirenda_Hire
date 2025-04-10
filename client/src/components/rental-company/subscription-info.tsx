import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface SubscriptionDetails {
  status: string;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  daysRemaining: number;
  monthlyFee: number;
}

export default function SubscriptionInfo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);

  useEffect(() => {
    if (user?.userType !== 'company') return;
    
    const fetchSubscriptionDetails = async () => {
      try {
        setLoading(true);
        const res = await apiRequest('GET', '/api/subscription/details');
        const data = await res.json();
        setSubscriptionDetails(data);
      } catch (error) {
        console.error('Error fetching subscription details:', error);
        toast({
          title: 'Error',
          description: 'Could not fetch subscription details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptionDetails();
  }, [user, toast]);
  
  const setupTrial = async () => {
    try {
      setProcessing(true);
      const res = await apiRequest('POST', '/api/subscription/setup');
      const data = await res.json();
      
      toast({
        title: 'Success',
        description: 'Your 30-day free trial has been activated!',
      });
      
      // Refresh subscription details
      const detailsRes = await apiRequest('GET', '/api/subscription/details');
      const detailsData = await detailsRes.json();
      setSubscriptionDetails(detailsData);
    } catch (error) {
      console.error('Error setting up trial:', error);
      toast({
        title: 'Error',
        description: 'Could not set up trial subscription',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };
  
  const makePayment = async () => {
    try {
      setProcessing(true);
      
      // In a real app, this would redirect to Stripe checkout
      // For now, we'll just simulate a payment
      const res = await apiRequest('POST', '/api/subscription/payment');
      const data = await res.json();
      
      toast({
        title: 'Success',
        description: 'Payment successful. Your subscription has been renewed!',
      });
      
      // Refresh subscription details
      const detailsRes = await apiRequest('GET', '/api/subscription/details');
      const detailsData = await detailsRes.json();
      setSubscriptionDetails(detailsData);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Error',
        description: 'Could not process payment',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (!subscriptionDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Required</CardTitle>
          <CardDescription>
            You need to set up a subscription to list your vehicles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Start with a 30-day free trial, then pay just $10/month</p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={setupTrial}
            disabled={processing}
            className="w-full"
          >
            {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Start 30-Day Free Trial
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Subscription Status
          {subscriptionDetails.status === 'trial' && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
              Trial
            </span>
          )}
          {subscriptionDetails.status === 'active' && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
              Active
            </span>
          )}
          {subscriptionDetails.status === 'expired' && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
              Expired
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {subscriptionDetails.status === 'trial' && 'Your free trial period is active'}
          {subscriptionDetails.status === 'active' && 'Your subscription is active'}
          {subscriptionDetails.status === 'expired' && 'Your subscription has expired'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscriptionDetails.status === 'trial' && subscriptionDetails.trialEndsAt && (
          <div className="flex items-start space-x-2">
            <Bell className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Trial ends on {format(new Date(subscriptionDetails.trialEndsAt), 'MMMM dd, yyyy')}</p>
              <p className="text-sm text-muted-foreground">
                {subscriptionDetails.daysRemaining} days remaining - ${subscriptionDetails.monthlyFee}/month after trial
              </p>
            </div>
          </div>
        )}
        
        {subscriptionDetails.status === 'active' && subscriptionDetails.subscriptionEndsAt && (
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Subscription renews on {format(new Date(subscriptionDetails.subscriptionEndsAt), 'MMMM dd, yyyy')}</p>
              <p className="text-sm text-muted-foreground">
                {subscriptionDetails.daysRemaining} days remaining - ${subscriptionDetails.monthlyFee}/month
              </p>
            </div>
          </div>
        )}
        
        {subscriptionDetails.status === 'expired' && (
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Your subscription has expired</p>
              <p className="text-sm text-muted-foreground">
                Renew now to continue listing your vehicles - ${subscriptionDetails.monthlyFee}/month
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {(subscriptionDetails.status === 'expired' || 
         (subscriptionDetails.status === 'trial' && subscriptionDetails.daysRemaining <= 5)) && (
          <Button 
            onClick={makePayment}
            disabled={processing} 
            className="w-full"
          >
            {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {subscriptionDetails.status === 'expired' ? 'Renew Subscription' : 'Subscribe Now'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}