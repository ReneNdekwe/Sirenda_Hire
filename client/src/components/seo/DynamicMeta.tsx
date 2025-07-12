import { Helmet } from 'react-helmet-async';

interface DynamicMetaProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  url?: string;
}

export function DynamicMeta({
  title = "Sirenda - Cars for rent in Rwanda",
  description = "Find affordable car rentals in Rwanda. Book cars in Kigali and across Rwanda. Compare prices, book online, and get the best deals on car hire.",
  image = "https://vehicles.blob.core.windows.net/static-assets/Logo.png?sp=r&st=2025-06-04T17:46:26Z&se=2027-07-01T01:46:26Z&spr=https&sv=2024-11-04&sr=b&sig=vOBNhbKd%2BVcoLhiUc%2FsmEMvqzH%2BKEqJYUhRiWp2xO9M%3D",
  type = "website",
  url = "https://sirenda.rw"
}: DynamicMetaProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
} 