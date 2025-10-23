'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';
import Link from 'next/link';

import { ArrowUpRight } from 'lucide-react';

import {
  getImageSourceForContentType,
  getUrlForContentType
} from '@/components/Collection/utils/ContentTypeDetection';
import { AirImage } from '@/components/Image/AirImage';
import { getPageById } from '@/components/Page/PageApi';
import { getPageListById } from '@/components/PageList/PageListApi';
import { getPostById } from '@/components/Post/PostApi';
import { getProductById } from '@/components/Product/ProductApi';
import { getServiceById } from '@/components/Service/ServiceApi';
import { getSolutionById } from '@/components/Solution/SolutionApi';

import type { ContentType } from '@/components/Collection/utils/ContentTypeDetection';
import type { Page } from '@/components/Page/PageSchema';
import type { PageList } from '@/components/PageList/PageListSchema';
import type { Post } from '@/components/Post/PostSchema';
import type { Product } from '@/components/Product/ProductSchema';
import type { Service } from '@/components/Service/ServiceSchema';
import type { Solution } from '@/components/Solution/SolutionSchema';

interface SearchCardProps {
  sys: {
    id: string;
  };
  title?: string;
  description?: string;
  slug?: string;
  mainImage?: unknown;
  openGraphImage?: unknown;
  categories?: string[];
  contentType: ContentType;
}

export function SearchCard(props: SearchCardProps) {
  const [itemData, setItemData] = useState<
    Page | PageList | Post | Product | Solution | Service | null
  >(null);
  const [loading, setLoading] = useState(!props.title);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we don't have the required data
    if (!props.title) {
      async function fetchItemData() {
        try {
          setLoading(true);
          setError(null);

          const fetchFunctions = {
            Page: () => getPageById(props.sys.id),
            PageList: () => getPageListById(props.sys.id),
            Post: () => getPostById(props.sys.id),
            Product: () => getProductById(props.sys.id),
            Solution: () => getSolutionById(props.sys.id),
            Service: () => getServiceById(props.sys.id)
          };

          const fetchFunction = fetchFunctions[props.contentType];
          if (fetchFunction) {
            const data = await fetchFunction();
            if (data) {
              setItemData(data);
            } else {
              setError(`${props.contentType} not found`);
            }
          } else {
            setError(`Unknown content type: ${props.contentType}`);
          }
        } catch {
          setError(`Failed to load ${props.contentType}`);
        } finally {
          setLoading(false);
        }
      }

      void fetchItemData();
    }
  }, [props.sys.id, props.title, props.contentType]);

  // Use provided props data if available, otherwise use fetched data
  const item = useContentfulLiveUpdates(
    itemData ?? (props as Page | PageList | Post | Product | Solution | Service)
  );
  const inspectorProps = useContentfulInspectorMode({ entryId: item?.sys?.id });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-muted-foreground">Item not found</div>
      </div>
    );
  }

  // Use utility functions for cleaner code
  const imageSource = getImageSourceForContentType(item, props.contentType) as {
    link?: string;
    altText?: string;
  } | null;
  const itemUrl = getUrlForContentType(item, props.contentType);

  return (
    <Link href={itemUrl} {...inspectorProps({ fieldId: 'slug' })} className="group block w-full">
      <div className="flex items-start gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded overflow-hidden">
          <AirImage
            link={imageSource?.link}
            altText={imageSource?.altText ?? String(item.title)}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-primary uppercase font-medium">{props.contentType}</span>
            {props.contentType === 'Post' && props.categories && props.categories.length > 0 && (
              <>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">{props.categories[0]}</span>
              </>
            )}
          </div>

          <h3
            className="text-lg font-semibold text-gray-900 group-hover:text-primary line-clamp-1 mb-2"
            {...inspectorProps({ fieldId: 'title' })}
          >
            {String(item.title)}
          </h3>

          {(() => {
            const description = (item as Record<string, unknown>).description;
            // Only render if description is a string or number
            const isValidDescription =
              typeof description === 'string' || typeof description === 'number';
            return isValidDescription ? (
              <p
                className="text-sm text-gray-600 line-clamp-2"
                {...inspectorProps({ fieldId: 'description' })}
              >
                {String(description)}
              </p>
            ) : null;
          })()}
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0">
          <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  );
}
