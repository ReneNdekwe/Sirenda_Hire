import axios from 'axios';
import { MTN_MOMO_CONFIG } from '../config/mtn-momo.config.js';

async function testMTNConnection() {
  try {
    console.log('Testing MTN Mobile Money Connection...');
    console.log('Environment:', MTN_MOMO_CONFIG.environment);
    
    // Test API User Status
    const apiUserUrl = `https://${MTN_MOMO_CONFIG.environment === 'sandbox' ? 'sandbox.' : ''}momodeveloper.mtn.com/v1_0/apiuser`;
    const subscriptionKey = MTN_MOMO_CONFIG.environment === 'sandbox' 
      ? MTN_MOMO_CONFIG.collection.secondaryKey 
      : MTN_MOMO_CONFIG.collection.primaryKey;

    console.log('\n1. Testing API User Status...');
    const headers = {
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'X-Target-Environment': MTN_MOMO_CONFIG.environment
    };

    // Get API User Status
    const statusResponse = await axios.get(apiUserUrl, { headers });
    console.log('API User Status:', statusResponse.data);

    // Test Collection API
    console.log('\n2. Testing Collection API...');
    const collectionUrl = `https://${MTN_MOMO_CONFIG.environment === 'sandbox' ? 'sandbox.' : ''}momodeveloper.mtn.com/collection/v1_0/requesttopay`;
    
    const collectionHeaders = {
      ...headers,
      'Authorization': `Basic ${Buffer.from(`${MTN_MOMO_CONFIG.apiKey}:${MTN_MOMO_CONFIG.apiSecret}`).toString('base64')}`,
      'X-Reference-Id': 'test-' + Date.now(),
      'Content-Type': 'application/json'
    };

    const testRequest = {
      amount: "100",
      currency: MTN_MOMO_CONFIG.currency,
      externalId: "test-" + Date.now(),
      payer: {
        partyIdType: "MSISDN",
        partyId: "250788123456" // Test number
      },
      payerMessage: "Test payment",
      payeeNote: "Test payment"
    };

    try {
      const collectionResponse = await axios.post(collectionUrl, testRequest, { headers: collectionHeaders });
      console.log('Collection API Response:', collectionResponse.data);
    } catch (error) {
      console.log('Collection API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }

    console.log('\nTest completed!');
  } catch (error) {
    console.error('Error testing MTN connection:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
}

// Run the test
testMTNConnection()
  .then(() => process.exit(0))
  .catch(() => process.exit(1)); 