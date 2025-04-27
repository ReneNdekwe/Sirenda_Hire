import { generateMTNCredentials } from '../utils/generate-mtn-credentials';

async function main() {
  try {
    console.log('Generating MTN MoMo API credentials...');
    const credentials = await generateMTNCredentials();
    
    console.log('\nSuccessfully generated credentials:');
    console.log('-----------------------------------');
    console.log('API Key:', credentials.apiKey);
    console.log('API Secret:', credentials.apiSecret);
    console.log('\nAdd these to your .env file:');
    console.log(`MTN_MOMO_API_KEY=${credentials.apiKey}`);
    console.log(`MTN_MOMO_API_SECRET=${credentials.apiSecret}`);
    console.log('\nIMPORTANT: Save these credentials securely and never commit them to version control!');
  } catch (error) {
    console.error('Failed to generate credentials:', error);
    process.exit(1);
  }
}

main(); 