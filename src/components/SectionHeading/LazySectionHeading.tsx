'use client';

import { useEffect, useState } from 'react';
import { SectionHeading } from '@/components/SectionHeading/SectionHeading';
import { getSectionHeadingById } from '@/lib/contentful-api/section-heading';
import type { SectionHeading as SectionHeadingType } from '@/types/contentful/SectionHeading';

interface LazySectionHeadingProps {
  sectionHeadingId: string;
  componentType?: string;
  isDarkMode?: boolean;
  isProductContext?: boolean;
  hasSolutionItems?: boolean;
}

export function LazySectionHeading({
  sectionHeadingId,
  componentType,
  isDarkMode,
  isProductContext,
  hasSolutionItems
}: LazySectionHeadingProps) {
  const [sectionHeading, setSectionHeading] = useState<SectionHeadingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSectionHeading() {
      try {
        setLoading(true);
        const data = await getSectionHeadingById(sectionHeadingId, false);
        setSectionHeading(data);
      } catch (err) {
        console.error('Failed to fetch section heading:', err);
        setError('Failed to load section heading');
      } finally {
        setLoading(false);
      }
    }

    void fetchSectionHeading();
  }, [sectionHeadingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading section heading...</div>
      </div>
    );
  }

  if (error || !sectionHeading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{error ?? 'Section heading not found'}</div>
      </div>
    );
  }

  return (
    <SectionHeading
      key={`lazy-loaded-${sectionHeadingId}`}
      {...sectionHeading}
      componentType={componentType}
      isDarkMode={isDarkMode}
      isProductContext={isProductContext}
      hasSolutionItems={hasSolutionItems}
    />
  );
}
