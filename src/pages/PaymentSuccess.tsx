import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const propertyId = params.get('property_id');
        const txRef = params.get('tx_ref');
        
        if (!propertyId || !txRef) {
          throw new Error('Missing payment parameters');
        }

        // In a real app, you would verify the payment with your backend here
        // For now, we'll just show the transaction reference
        setPaymentDetails({
          propertyId,
          txRef,
          amount: params.get('amount'),
          status: 'success',
          timestamp: new Date().toISOString()
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching payment details:', error);
        toast.error('Failed to load payment details');
        // Redirect to dashboard after a delay
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    };

    fetchPaymentDetails();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800 mt-4">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-green-700">
              Thank you for your payment. Your transaction has been completed successfully.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h3 className="font-medium text-gray-900">Transaction Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-500">Transaction ID</div>
                <div className="font-medium text-gray-900">{paymentDetails.txRef}</div>
                
                <div className="text-gray-500">Property ID</div>
                <div className="font-medium text-gray-900">{paymentDetails.propertyId}</div>
                
                {paymentDetails.amount && (
                  <>
                    <div className="text-gray-500">Amount</div>
                    <div className="font-medium text-gray-900">ETB {paymentDetails.amount}</div>
                  </>
                )}
                
                <div className="text-gray-500">Status</div>
                <div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {paymentDetails.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="text-gray-500">Date</div>
                <div className="font-medium text-gray-900">
                  {new Date(paymentDetails.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-green-600 hover:bg-green-700"
              >
                Back to Dashboard
              </Button>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              A receipt has been sent to your email. 
              If you have any questions, please contact our support team.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
