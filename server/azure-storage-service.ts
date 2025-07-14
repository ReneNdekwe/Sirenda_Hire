import { BlobServiceClient, ContainerClient, BlobSASPermissions } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';

export class AzureStorageService {
  private blobServiceClient: BlobServiceClient;
  private vehicleImagesContainer: ContainerClient;
  private staticAssetsContainer: ContainerClient;
  private blogImagesContainer: ContainerClient;

  constructor() {
    // Get connection string from environment variable
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING is not defined');
    }

    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.vehicleImagesContainer = this.blobServiceClient.getContainerClient('vehicle-images');
    this.staticAssetsContainer = this.blobServiceClient.getContainerClient('static-assets');
    this.blogImagesContainer = this.blobServiceClient.getContainerClient('blog-images');
  }

  async initialize() {
    // Create containers if they don't exist
    await this.vehicleImagesContainer.createIfNotExists();
    await this.staticAssetsContainer.createIfNotExists();
    await this.blogImagesContainer.createIfNotExists();
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const blobName = `${uuidv4()}-${file.originalname}`;
      const blockBlobClient = this.vehicleImagesContainer.getBlockBlobClient(blobName);

      // Upload the file
      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype
        }
      });

      // Generate a SAS token for temporary access
      const sasToken = await this.generateSasToken(blobName, 'vehicle-images');
      
      // Get the base URL without any SAS token
      const baseUrl = blockBlobClient.url;
      console.log('Base URL:', baseUrl); // Debug log
      console.log('SAS Token:', sasToken); // Debug log
      
      // Return the URL with SAS token
      const fullUrl = `${baseUrl}?${sasToken}`;
      console.log('Full URL:', fullUrl); // Debug log
      
      if (!fullUrl) {
        throw new Error('Failed to generate image URL');
      }
      
      return fullUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  }

  async uploadStaticAsset(file: Express.Multer.File): Promise<string> {
    try {
      const blobName = file.originalname;
      const blockBlobClient = this.staticAssetsContainer.getBlockBlobClient(blobName);

      // Upload the file
      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype
        }
      });

      // Generate a SAS token for temporary access
      const sasToken = await this.generateSasToken(blobName, 'static-assets');
      
      // Get the base URL without any SAS token
      const baseUrl = blockBlobClient.url;
      console.log('Base URL:', baseUrl); // Debug log
      console.log('SAS Token:', sasToken); // Debug log
      
      // Return the URL with SAS token
      const fullUrl = `${baseUrl}?${sasToken}`;
      console.log('Full URL:', fullUrl); // Debug log
      
      if (!fullUrl) {
        throw new Error('Failed to generate static asset URL');
      }
      
      return fullUrl;
    } catch (error) {
      console.error('Error in uploadStaticAsset:', error);
      throw error;
    }
  }

  async uploadBlogImage(file: Express.Multer.File): Promise<string> {
    try {
      const blobName = `${uuidv4()}-${file.originalname}`;
      const blockBlobClient = this.blogImagesContainer.getBlockBlobClient(blobName);

      // Upload the file
      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype
        }
      });

      // Generate a SAS token for temporary access
      const sasToken = await this.generateSasToken(blobName, 'blog-images');
      
      // Get the base URL without any SAS token
      const baseUrl = blockBlobClient.url;
      console.log('Base URL:', baseUrl); // Debug log
      console.log('SAS Token:', sasToken); // Debug log
      
      // Return the URL with SAS token
      const fullUrl = `${baseUrl}?${sasToken}`;
      console.log('Full URL:', fullUrl); // Debug log
      
      if (!fullUrl) {
        throw new Error('Failed to generate image URL');
      }
      
      return fullUrl;
    } catch (error) {
      console.error('Error in uploadBlogImage:', error);
      throw error;
    }
  }

  async uploadProfilePicture(file: Express.Multer.File): Promise<string> {
    // Use the profile-pictures container
    const containerClient = this.blobServiceClient.getContainerClient('profile-pictures');
    const blobName = `${uuidv4()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype }
    });

    // Generate a SAS token for temporary access (or use public access if set)
    const sasToken = await this.generateSasToken(blobName, 'profile-pictures');
    return `${blockBlobClient.url}?${sasToken}`;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    // Extract blob name from URL
    const blobName = imageUrl.split('/').pop()?.split('?')[0];
    if (!blobName) {
      throw new Error('Invalid image URL');
    }

    const blockBlobClient = this.vehicleImagesContainer.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  }

  // Public method to get the static assets container
  getStaticAssetsContainer(): ContainerClient {
    return this.staticAssetsContainer;
  }

  // Make generateSasToken public
  async generateSasToken(blobName: string, containerName: string): Promise<string> {
    try {
      const container = 
        containerName === 'vehicle-images' ? this.vehicleImagesContainer :
        containerName === 'static-assets' ? this.staticAssetsContainer :
        containerName === 'blog-images' ? this.blogImagesContainer :
        containerName === 'profile-pictures' ? this.blobServiceClient.getContainerClient('profile-pictures') :
        this.vehicleImagesContainer; // fallback
      
      const blockBlobClient = container.getBlockBlobClient(blobName);
      const sasOptions = {
        permissions: BlobSASPermissions.parse("r"), // Read only
        expiresOn: new Date(new Date().valueOf() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      };

      const sasUrl = await blockBlobClient.generateSasUrl(sasOptions);
      console.log('Generated SAS URL:', sasUrl); // Debug log
      
      // Extract just the SAS token part
      const sasToken = sasUrl.split('?')[1];
      if (!sasToken) {
        throw new Error('Failed to generate SAS token');
      }
      
      return sasToken;
    } catch (error) {
      console.error('Error in generateSasToken:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const azureStorageService = new AzureStorageService(); 