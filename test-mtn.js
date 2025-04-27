import dotenv from 'dotenv';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Load environment variables
dotenv.config();

const SUBSCRIPTION_KEY = process.env.MTN_MOMO_COLLECTION_PRIMARY_KEY;
const BASE_URL = 'https://sandbox.momodeveloper.mtn.com';
const ENVIRONMENT = process.env.MTN_MOMO_ENVIRONMENT || 'sandbox';
const CURRENCY = ENVIRONMENT === 'sandbox' ? 'EUR' : 'RWF';

// Function to generate a new UUID
const generateUUID = () => uuidv4();

// Function to get access token
async function getAccessToken(apiUserId, apiKey) {
  const auth = Buffer.from(`${apiUserId}:${apiKey}`).toString('base64');
  
  try {
    const response = await axios({
      method: 'post',
      url: `${BASE_URL}/collection/token/`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
        'X-Target-Environment': ENVIRONMENT
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw error;
  }
}

// Function to create API user
async function createApiUser() {
  const userId = generateUUID();
  
  try {
    const response = await axios({
      method: 'post',
      url: `${BASE_URL}/v1_0/apiuser`,
      headers: {
        'X-Reference-Id': userId,
        'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
      },
      data: {
        providerCallbackHost: 'http://localhost:5000'
      }
    });

    if (response.status === 201) {
      console.log('API user created successfully');
      return userId;
    }
  } catch (error) {
    console.error('Error creating API user:', error.response?.data || error.message);
    throw error;
  }
}

// Function to get API key
async function getApiKey(userId) {
  try {
    const response = await axios({
      method: 'post',
      url: `${BASE_URL}/v1_0/apiuser/${userId}/apikey`,
      headers: {
        'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
      }
    });

    return response.data.apiKey;
  } catch (error) {
    console.error('Error getting API key:', error.response?.data || error.message);
    throw error;
  }
}

// Function to check API user status
async function checkApiUserStatus(userId) {
  try {
    const response = await axios({
      method: 'get',
      url: `${BASE_URL}/v1_0/apiuser/${userId}`,
      headers: {
        'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error checking API user status:', error.response?.data || error.message);
    throw error;
  }
}

// Function to test payment flow
async function testPayment(accessToken) {
  const paymentRef = generateUUID();
  
  try {
    const paymentRequest = {
      amount: '100',
      currency: CURRENCY,
      externalId: generateUUID(),
      payer: {
        partyIdType: 'MSISDN',
        partyId: '46733123454'
      },
      payerMessage: 'Test payment',
      payeeNote: 'Test payment note'
    };

    console.log('Making payment request with data:', {
      url: `${BASE_URL}/collection/v1_0/requesttopay`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Reference-Id': paymentRef,
        'X-Target-Environment': ENVIRONMENT,
        'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
        'Content-Type': 'application/json'
      },
      data: paymentRequest
    });

    const response = await axios({
      method: 'post',
      url: `${BASE_URL}/collection/v1_0/requesttopay`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Reference-Id': paymentRef,
        'X-Target-Environment': ENVIRONMENT,
        'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
        'Content-Type': 'application/json'
      },
      data: paymentRequest
    });

    if (response.status === 202) {
      console.log('Payment request created');
      // Wait a bit before checking status
      await new Promise(resolve => setTimeout(resolve, 5000));
      return await checkPaymentStatus(paymentRef, accessToken);
    }
  } catch (error) {
    console.error('Error creating payment:', error.response?.data || error.message);
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
    }
    throw error;
  }
}

// Function to check payment status
async function checkPaymentStatus(paymentRef, accessToken) {
  try {
    const response = await axios({
      method: 'get',
      url: `${BASE_URL}/collection/v1_0/requesttopay/${paymentRef}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Target-Environment': ENVIRONMENT,
        'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error checking payment status:', error.response?.data || error.message);
    throw error;
  }
}

// Main function to run the test
async function main() {
  try {
    console.log('Testing MTN MoMo Collection API payment flow...');
    console.log('Environment:', ENVIRONMENT);
    console.log('Subscription Key:', SUBSCRIPTION_KEY);
    
    const userId = process.env.MTN_MOMO_API_KEY;
    const apiKey = process.env.MTN_MOMO_API_SECRET;
    
    if (!userId || !apiKey || !SUBSCRIPTION_KEY) {
      throw new Error('Required MTN MoMo API credentials not found in .env file');
    }
    
    console.log('Using API User ID:', userId);
    console.log('Using API Key:', apiKey);
    
    // Get access token
    const accessToken = await getAccessToken(userId, apiKey);
    console.log('Access token obtained successfully');
    
    // Test payment
    console.log('\nTesting MTN Mobile Money payment...');
    const paymentStatus = await testPayment(accessToken);
    console.log('Payment status:', paymentStatus);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Request headers:', error.response.config.headers);
    }
    process.exit(1);
  }
}

main(); 