import axios from 'axios';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

interface ProvisioningResponse {
  apiKey: string;
  apiSecret: string;
}

// Helper function to wait for a specified time
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateMTNCredentials(): Promise<ProvisioningResponse> {
  try {
    // Generate a UUID for the reference ID
    const referenceId = crypto.randomUUID();
    
    // The provisioning API endpoint
    const provisioningUrl = 'https://sandbox.momodeveloper.mtn.com/v1_0/apiuser';
    
    // Headers required for the provisioning request
    const headers = {
      'X-Reference-Id': referenceId,
      'X-Target-Environment': 'sandbox',
      'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_COLLECTION_SECONDARY_KEY,
      'Content-Type': 'application/json'
    };

    // Step 1: Create API User
    console.log('Creating API user...');
    const createResponse = await axios.post(
      provisioningUrl,
      {
        providerCallbackHost: 'localhost:5000',
      },
      { headers }
    );
    console.log('API user creation response status:', createResponse.status);

    // Wait for 5 seconds to allow the user to be created
    console.log('Waiting for user activation...');
    await delay(5000);

    // Step 2: Get API User Status
    console.log('Checking API user status...');
    const statusResponse = await axios.get(
      `${provisioningUrl}/${referenceId}`,
      { headers }
    );
    console.log('API user status:', statusResponse.data);

    // Step 3: Get API Key
    console.log('Getting API key...');
    const apiKeyResponse = await axios.post(
      `${provisioningUrl}/${referenceId}/apikey`,
      {},
      { headers }
    );

    if (!apiKeyResponse.data || !apiKeyResponse.data.apiKey) {
      console.error('API Key Response:', apiKeyResponse.data);
      throw new Error('Failed to get API key from response');
    }

    // In sandbox environment, the API key serves as both the key and secret
    const credentials = {
      apiKey: apiKeyResponse.data.apiKey,
      apiSecret: apiKeyResponse.data.apiKey
    };

    console.log('Successfully generated credentials');
    return credentials;

  } catch (error) {
    console.error('Error generating MTN MoMo credentials:', error);
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

// Check if this file is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  generateMTNCredentials()
    .then(credentials => {
      console.log('\nSuccessfully generated MTN MoMo Credentials:');
      console.log('-----------------------------------');
      console.log('API Key:', credentials.apiKey);
      console.log('API Secret:', credentials.apiSecret);
      console.log('\nAdd these to your .env file:');
      console.log(`MTN_MOMO_API_KEY=${credentials.apiKey}`);
      console.log(`MTN_MOMO_API_SECRET=${credentials.apiSecret}`);
      console.log('\nIMPORTANT: Save these credentials securely and never commit them to version control!');
    })
    .catch(error => {
      console.error('Failed to generate credentials:', error);
      process.exit(1);
    });
}

export { generateMTNCredentials }; 