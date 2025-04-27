import { MTNMoMoService } from '../mtn-momo-service';
import { MTN_MOMO_CONFIG } from '../config/mtn-momo.config';

async function testMTNConnection() {
  const mtnMomoService = new MTNMoMoService();

  try {
    console.log('Testing MTN Mobile Money Connection...');
    console.log('Environment:', MTN_MOMO_CONFIG.environment);
    console.log('Currency:', MTN_MOMO_CONFIG.currency);
    
    // Test a payment request
    const testRequest = {
      amount: "100",
      currency: MTN_MOMO_CONFIG.currency,
      externalId: Date.now().toString(),
      payer: {
        partyIdType: "MSISDN",
        partyId: "250788123456"
      },
      payerMessage: "Test payment",
      payeeNote: "Test payment"
    };

    console.log('\nInitiating test payment...');
    console.log('Request:', testRequest);

    const referenceId = await mtnMomoService.initiatePayment(testRequest);
    console.log('\nPayment initiated successfully!');
    console.log('Reference ID:', referenceId);

    // Check payment status
    console.log('\nChecking payment status...');
    const status = await mtnMomoService.checkPaymentStatus(referenceId);
    console.log('Payment Status:', status);

  } catch (error: any) {
    console.error('Error testing MTN connection:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    process.exit(1);
  }
}

// Run the test
testMTNConnection()
  .then(() => {
    console.log('\nTest completed successfully!');
    process.exit(0);
  })
  .catch(() => process.exit(1)); 