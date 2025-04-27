import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { MTN_MOMO_CONFIG } from './config/mtn-momo.config';

dotenv.config();

interface PaymentRequest {
  amount: string;
  currency: string;
  externalId: string;
  payer: {
    partyIdType: string;
    partyId: string;
  };
  payerMessage: string;
  payeeNote: string;
}

interface DisbursementRequest {
  amount: string;
  currency: string;
  externalId: string;
  payee: {
    partyIdType: string;
    partyId: string;
  };
  payerMessage: string;
  payeeNote: string;
}

export class MTNMoMoService {
  private readonly baseUrl: string = 'https://sandbox.momodeveloper.mtn.com';
  private readonly subscriptionKey: string;
  private readonly environment: string = 'sandbox'; // Change to 'production' when going live
  private readonly collectionConfig: typeof MTN_MOMO_CONFIG.collection;
  private readonly disbursementConfig: typeof MTN_MOMO_CONFIG.disbursement;
  private apiUserId: string | null = null;
  private apiKey: string | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    const key = process.env.MTN_MOMO_COLLECTION_PRIMARY_KEY;
    if (!key) {
      throw new Error('MTN_MOMO_COLLECTION_PRIMARY_KEY is not set in environment variables');
    }
    this.subscriptionKey = key;
    this.collectionConfig = MTN_MOMO_CONFIG.collection;
    this.disbursementConfig = MTN_MOMO_CONFIG.disbursement;
  }

  private async initializeCredentials(): Promise<void> {
    if (!this.apiUserId) {
      this.apiUserId = await this.createApiUser();
      this.apiKey = await this.getApiKey(this.apiUserId);
    }
  }

  private async getValidAccessToken(): Promise<string> {
    await this.initializeCredentials();
    
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Get new token
    this.accessToken = await this.getAccessToken(this.apiUserId!, this.apiKey!);
    // Token expires in 1 hour, set expiry to 55 minutes to be safe
    this.tokenExpiry = Date.now() + (55 * 60 * 1000);
    return this.accessToken;
  }

  private async getAccessToken(apiUserId: string, apiKey: string): Promise<string> {
    const auth = Buffer.from(`${apiUserId}:${apiKey}`).toString('base64');
    
    try {
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/collection/token/`,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'X-Target-Environment': this.environment
        }
      });

      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  private async createApiUser(): Promise<string> {
    const userId = uuidv4();
    
    try {
      await axios({
        method: 'post',
        url: `${this.baseUrl}/v1_0/apiuser`,
        headers: {
          'X-Reference-Id': userId,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey
        },
        data: {
          providerCallbackHost: process.env.APP_URL || 'http://localhost:5000'
        }
      });

      return userId;
    } catch (error) {
      console.error('Error creating API user:', error);
      throw error;
    }
  }

  private async getApiKey(userId: string): Promise<string> {
    try {
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/v1_0/apiuser/${userId}/apikey`,
        headers: {
          'Ocp-Apim-Subscription-Key': this.subscriptionKey
        }
      });

      return response.data.apiKey;
    } catch (error) {
      console.error('Error getting API key:', error);
      throw error;
    }
  }

  async initiatePayment(paymentRequest: PaymentRequest): Promise<string> {
    try {
      const accessToken = await this.getValidAccessToken();
      const referenceId = uuidv4();

      console.log('Making payment request with data:', {
        url: `${this.baseUrl}/collection/v1_0/requesttopay`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': this.environment,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'application/json'
        },
        data: paymentRequest
      });

      await axios({
        method: 'post',
        url: `${this.baseUrl}/collection/v1_0/requesttopay`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': this.environment,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'application/json'
        },
        data: paymentRequest
      });

      return referenceId;
    } catch (error) {
      console.error('Error initiating payment:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });
        throw new Error(JSON.stringify({
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        }));
      }
      throw error;
    }
  }

  async checkPaymentStatus(referenceId: string): Promise<string> {
    try {
      const accessToken = await this.getValidAccessToken();

      const response = await axios({
        method: 'get',
        url: `${this.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Target-Environment': this.environment,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey
        }
      });

      return response.data.status;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  async disbursePayment(request: DisbursementRequest): Promise<string> {
    try {
      // Create API user and get credentials
      const userId = await this.createApiUser();
      const apiKey = await this.getApiKey(userId);
      const accessToken = await this.getAccessToken(userId, apiKey);
      
      // Generate reference ID for this payment
      const referenceId = uuidv4();

      // Make disbursement request
      await axios({
        method: 'post',
        url: `${this.baseUrl}/disbursement/v1_0/transfer`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': this.environment,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'application/json'
        },
        data: request
      });

      return referenceId;
    } catch (error) {
      console.error('Error disbursing payment:', error);
      throw error;
    }
  }
} 