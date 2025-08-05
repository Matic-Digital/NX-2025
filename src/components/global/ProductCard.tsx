'use client';

import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';
import { Box } from '@/components/global/matic-ds';
import Image from 'next/image';
import type { Product, ProductSys } from '@/types/contentful/Product';
import Link from 'next/link';
import { getProductsByIds } from '@/lib/contentful-api/product';
import { useEffect, useState } from 'react';

export const ProductCard = (props: ProductSys) => {
  const inspectorProps = useContentfulInspectorMode({ entryId: props.sys?.id });
  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const products = await getProductsByIds([props.sys.id]);
        if (products.length > 0 && products[0]) {
          setProductData(products[0]);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchProductData();
  }, [props.sys.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!productData) {
    return <div>Product not found</div>;
  }
  return (
    <Link
      href={`/${productData.slug}`}
      {...inspectorProps({ fieldId: 'slug' })}
      className="group flex flex-col"
    >
      <Box direction="col" gap={4}>
        <Box className="group-hover:bg-primary w-fit bg-black p-[0.38rem]">
          <Image
            src={productData.icon?.url ?? ''}
            alt={productData.title}
            className=""
            width={60}
            height={60}
          />
        </Box>
        <Box direction="col" gap={2}>
          <Box direction="row" gap={2} className="items-center">
            <h3 className="text-headline-sm group-hover:text-primary">{productData.title}</h3>
            <div className="opacity-0 group-hover:opacity-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="29"
                viewBox="0 0 30 29"
                fill="none"
              >
                <path
                  d="M5.99963 6H23.9996M23.9996 6V23M23.9996 6L5.99963 23"
                  stroke="#FE5000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Box>
          <p className="text-body-sm group-hover:text-primary">{productData.description}</p>
        </Box>
      </Box>
    </Link>
  );
};
