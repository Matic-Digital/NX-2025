'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { cn } from '@/lib/utils';

import { Box } from '@/components/global/matic-ds';

import { AirImage } from '@/components/Image/AirImage';
import { getProfileById } from '@/components/Profile/ProfileApi';

import type { Profile as ProfileType } from '@/components/Profile/ProfileSchema';

interface ProfileProps {
  sys: {
    id: string;
  };
  variant?: 'default' | 'compact' | 'card';
  className?: string;
}

export function Profile({ sys, variant = 'default', className }: ProfileProps) {
  const [profileData, setProfileData] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        const data = await getProfileById(sys.id);
        if (data) {
          setProfileData(data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }

    void fetchProfileData();
  }, [sys.id]);

  const profile = useContentfulLiveUpdates(profileData);
  const inspectorProps = useContentfulInspectorMode({ entryId: profile?.sys?.id });

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className={cn('text-gray-500 text-sm', className)}>Profile not found</div>;
  }

  // Compact variant for inline display
  if (variant === 'compact') {
    return (
      <span className={cn('inline-flex items-center gap-2', className)}>
        {profile.asset && (
          <AirImage
            link={profile.asset.link}
            altText={profile.asset.altText ?? profile.name ?? 'Profile'}
            className="h-6 w-6 rounded-full object-cover"
            {...inspectorProps({ fieldId: 'asset' })}
          />
        )}
        <span className="text-sm font-medium" {...inspectorProps({ fieldId: 'name' })}>
          {profile.name}
        </span>
        {profile.profileLocation && (
          <span
            className="text-xs text-gray-500"
            {...inspectorProps({ fieldId: 'profileLocation' })}
          >
            {profile.profileLocation}
          </span>
        )}
      </span>
    );
  }

  // Card variant for standalone display
  if (variant === 'card') {
    return (
      <Box
        direction="col"
        gap={3}
        className={cn('bg-white rounded-lg border p-6 shadow-sm', className)}
      >
        {profile.asset && (
          <AirImage
            link={profile.asset.link}
            altText={profile.asset.altText ?? profile.name ?? 'Profile'}
            className="h-20 w-20 rounded-full object-cover mx-auto"
            {...inspectorProps({ fieldId: 'asset' })}
          />
        )}

        <Box direction="col" gap={1} className="text-center">
          {profile.name && (
            <h3
              className="text-lg font-semibold text-gray-900"
              {...inspectorProps({ fieldId: 'name' })}
            >
              {profile.name}
            </h3>
          )}

          {profile.profileLocation && (
            <p
              className="text-sm text-gray-600"
              {...inspectorProps({ fieldId: 'profileLocation' })}
            >
              {profile.profileLocation}
            </p>
          )}
        </Box>

        {profile.description && (
          <p
            className="text-sm text-gray-700 text-center"
            {...inspectorProps({ fieldId: 'description' })}
          >
            {profile.description}
          </p>
        )}
      </Box>
    );
  }

  // Default variant
  return (
    <Box direction="row" gap={4} className={cn('items-start', className)}>
      {profile.asset && (
        <AirImage
          link={profile.asset.link}
          altText={profile.asset.altText ?? profile.name ?? 'Profile'}
          className="h-16 w-16 rounded-full object-cover flex-shrink-0"
          {...inspectorProps({ fieldId: 'asset' })}
        />
      )}

      <Box direction="col" gap={1} className="flex-1">
        {profile.name && (
          <h4
            className="text-base font-semibold text-gray-900"
            {...inspectorProps({ fieldId: 'name' })}
          >
            {profile.name}
          </h4>
        )}

        {profile.profileLocation && (
          <p className="text-sm text-gray-600" {...inspectorProps({ fieldId: 'profileLocation' })}>
            {profile.profileLocation}
          </p>
        )}

        {profile.description && (
          <p className="text-sm text-gray-700 mt-2" {...inspectorProps({ fieldId: 'description' })}>
            {profile.description}
          </p>
        )}
      </Box>
    </Box>
  );
}
