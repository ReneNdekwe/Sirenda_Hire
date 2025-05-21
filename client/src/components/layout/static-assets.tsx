import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useStaticAssets() {
  const { data: staticAssets } = useQuery({
    queryKey: ['/api/static-assets'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/static-assets');
      return await res.json();
    },
  });

  useEffect(() => {
    if (staticAssets?.favicon) {
      const faviconElement = document.getElementById('favicon') as HTMLLinkElement;
      if (faviconElement) {
        faviconElement.href = staticAssets.favicon;
      }
    }
  }, [staticAssets]);

  return staticAssets;
}

export default function StaticAssets() {
  useStaticAssets();
  return null;
} 