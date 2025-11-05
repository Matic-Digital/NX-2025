import { useEffect, useState } from 'react';

// Import removed - using API route instead

import type { Collection } from '@/components/Collection/CollectionSchema';
import type { Product } from '@/components/Product/ProductSchema';

interface UseProductsDataProps {
  collection: Collection | null;
  collectionData?: Collection;
}

export function useProductsData({ collection, collectionData }: UseProductsDataProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const finalCollection = collection ?? collectionData;

  // Check if we have server-enriched collection data
  const hasServerData = finalCollection && Object.keys(finalCollection).length > 3;

  // Fetch products when collection content type is "Product" - but only if we have server-enriched Collection config
  useEffect(() => {
    if (!hasServerData) {
      console.warn('Collection missing server-side data - showing skeleton. Collection ID:', finalCollection?.sys?.id);
      setIsLoading(false);
      return;
    }

    if (finalCollection?.contentType?.includes('Product')) {
      const fetchProducts = async () => {
        try {
          setIsLoading(true);
          // Use API route to get server-side enriched Products
          const response = await fetch('/api/components/Product/all');
          if (response.ok) {
            const data = await response.json();
            setProducts(data.products ?? []);
          } else {
            throw new Error('Failed to fetch products from API');
          }
        } catch (error) {
          console.warn('Collection: Error fetching products:', error);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchProducts();
    } else {
      setIsLoading(false);
    }
  }, [finalCollection, hasServerData]);

  return {
    products,
    isLoading,
    setProducts
  };
}
