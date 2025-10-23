'use client';

import { useEffect, useState } from 'react';
import { useContentfulInspectorMode } from '@contentful/live-preview/react';
import Image from 'next/image';
import Link from 'next/link';

import { Box } from '@/components/global/matic-ds';

import { checkPageBelongsToPageList } from '@/components/PageList/PageListApi';
import { getProductsByIds } from '@/components/Product/ProductApi';
import { ProductCardSkeleton } from '@/components/Product/ProductCardSkeleton';

import type { Product, ProductSys } from '@/components/Product/ProductSchema';

export const ProductCard = (props: ProductSys) => {
  const inspectorProps = useContentfulInspectorMode({ entryId: props.sys?.id });
  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [productUrl, setProductUrl] = useState<string>('');

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

  // Generate correct URL for Product by looking up its parent PageList
  useEffect(() => {
    const generateProductUrl = async () => {
      if (!productData) return;

      try {
        // Find the parent PageList for this Product
        const parentPageList = await checkPageBelongsToPageList(productData.sys.id, false);

        if (parentPageList?.slug) {
          // Use the PageList slug + Product slug format
          setProductUrl(`/${parentPageList.slug}/${productData.slug}`);
        } else {
          // Fallback to the old format if no parent PageList found
          setProductUrl(`/products/${productData.slug}`);
        }
      } catch (error) {
        console.error(`Error finding parent PageList for Product ${productData.slug}:`, error);
        // Fallback to the old format on error
        setProductUrl(`/products/${productData.slug}`);
      }
    };

    void generateProductUrl();
  }, [productData]);

  if (loading) {
    return <ProductCardSkeleton />;
  }

  if (!productData) {
    return <div>Product not found</div>;
  }
  return (
    <Link
      href={productUrl || `/${productData.slug}`}
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
