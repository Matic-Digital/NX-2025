import { useEffect, useState } from 'react';

import { getAllProducts } from '@/components/Product/ProductApi';

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

  // Fetch products when collection content type is "Product"
  useEffect(() => {
    if (finalCollection?.contentType?.includes('Product')) {
      const fetchProducts = async () => {
        try {
          setIsLoading(true);
          const productsResponse = await getAllProducts();
          setProducts(productsResponse ?? []);
        } catch (error) {
          console.error('Error fetching products:', error);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchProducts();
    }
  }, [finalCollection]);

  return {
    products,
    isLoading,
    setProducts
  };
}
