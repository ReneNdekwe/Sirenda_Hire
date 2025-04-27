import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface MTNMoMoPaymentProps {
  bookingId: number;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MTNMoMoPayment({ bookingId, amount, onSuccess, onCancel }: MTNMoMoPaymentProps) {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // For sandbox testing, use the test number
    if (import.meta.env.DEV || import.meta.env.MTN_MOMO_ENVIRONMENT === 'sandbox') {
      return '250788123456'; // MTN MoMo sandbox test number
    }
    
    // If the number starts with 250, keep it as is
    if (digits.startsWith('250')) {
      return digits;
    }
    
    // If the number starts with 0, replace with 250
    if (digits.startsWith('0')) {
      return '250' + digits.slice(1);
    }
    
    // If the number starts with 7, prepend 250
    if (digits.startsWith('7')) {
      return '250' + digits;
    }
    
    // Default case: prepend 250
    return '250' + digits;
  };

  const validatePhoneNumber = (value: string): boolean => {
    const formatted = formatPhoneNumber(value);
    // For sandbox, only accept the test number
    if (import.meta.env.DEV || import.meta.env.MTN_MOMO_ENVIRONMENT === 'sandbox') {
      return formatted === '250788123456';
    }
    // For production, validate Rwanda numbers
    return /^250[0-9]{9}$/.test(formatted);
  };

  const handlePayment = async () => {
    if (!phoneNumber) {
      toast({
        title: 'Error',
        description: 'Please enter your MTN MoMo phone number',
        variant: 'destructive',
      });
      return;
    }

    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    
    if (!validatePhoneNumber(formattedPhoneNumber)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid Rwanda phone number (e.g., 07XX XX XX XX)',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/payments/mtn-momo/initiate', {
        bookingId,
        phoneNumber: formattedPhoneNumber,
        amount,
      });
      const data = await response.json();
      setReferenceId(data.referenceId);

      // Start polling for payment status
      const pollInterval = setInterval(async () => {
        const statusResponse = await apiRequest('GET', `/api/payments/mtn-momo/status/${data.referenceId}`);
        const statusData = await statusResponse.json();
        
        if (statusData.status === 'SUCCESSFUL') {
          clearInterval(pollInterval);
          toast({
            title: 'Success',
            description: 'Payment successful!',
          });
          onSuccess();
        } else if (statusData.status === 'FAILED') {
          clearInterval(pollInterval);
          toast({
            title: 'Error',
            description: 'Payment failed. Please try again.',
            variant: 'destructive',
          });
        }
      }, 5000); // Poll every 5 seconds

      // Clear interval after 5 minutes (timeout)
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 5 * 60 * 1000);

    } catch (error) {
      console.error('Error initiating payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>MTN Mobile Money Payment</CardTitle>
        <CardDescription>
          Enter your MTN MoMo phone number to complete the payment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="07XX XX XX XX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {import.meta.env.DEV || import.meta.env.MTN_MOMO_ENVIRONMENT === 'sandbox' ? (
              <p>For testing, use the number: 250788123456</p>
            ) : (
              <p>Enter your MTN MoMo phone number starting with 07 or 250</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handlePayment} 
          disabled={loading}
          className="bg-[#FFD700] hover:bg-[#FFC000] text-black"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Pay Now'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 