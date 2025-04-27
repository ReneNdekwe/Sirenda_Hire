export const MTN_MOMO_CONFIG = {
  apiKey: process.env.MTN_MOMO_API_KEY || 'sandbox-api-key',
  apiSecret: process.env.MTN_MOMO_API_SECRET || 'sandbox-api-secret',
  environment: process.env.MTN_MOMO_ENVIRONMENT || 'sandbox',
  collection: {
    baseUrl: process.env.MTN_MOMO_COLLECTION_URL || 'https://sandbox.momodeveloper.mtn.com/collection/v1_0',
    primaryKey: process.env.MTN_MOMO_COLLECTION_PRIMARY_KEY || 'sandbox-collection-primary-key',
    secondaryKey: process.env.MTN_MOMO_COLLECTION_SECONDARY_KEY || 'sandbox-collection-secondary-key',
    targetEnvironment: process.env.MTN_MOMO_ENVIRONMENT || 'sandbox',
  },
  disbursement: {
    baseUrl: process.env.MTN_MOMO_DISBURSEMENT_URL || 'https://sandbox.momodeveloper.mtn.com/disbursement/v1_0',
    primaryKey: process.env.MTN_MOMO_DISBURSEMENT_PRIMARY_KEY || 'sandbox-disbursement-primary-key',
    secondaryKey: process.env.MTN_MOMO_DISBURSEMENT_SECONDARY_KEY || 'sandbox-disbursement-secondary-key',
    targetEnvironment: process.env.MTN_MOMO_ENVIRONMENT || 'sandbox',
  },
  currency: process.env.MTN_MOMO_ENVIRONMENT === 'sandbox' ? "EUR" : "RWF",
  paymentStatus: {
    SUCCESSFUL: "SUCCESSFUL",
    FAILED: "FAILED",
    PENDING: "PENDING",
  },
} as const; 