'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates
} from '@contentful/live-preview/react';

import { AirImage } from '@/components/Image/AirImage';
import { getProfileById } from '@/components/Profile/ProfileApi';

import { Box } from '@/components/global/matic-ds';

import type { Profile as ProfileType } from '@/components/Profile/ProfileSchema';

interface ProfileProps {
  sys: {
    id: string;
  };
  className?: string;
}

// Support both minimal sys data and full Profile data
type ProfileAllProps = ProfileProps | (ProfileType & { className?: string });

export function Profile(props: ProfileAllProps) {
  // Check if we have full Profile data (server-side rendered) or just reference (client-side)
  const hasFullData = 'title' in props || 'name' in props;
  const [profileData, setProfileData] = useState<ProfileType | null>(hasFullData ? (props as ProfileType) : null);
  const [loading, setLoading] = useState(!hasFullData);
  const className = 'className' in props ? props.className : undefined;
  const sys = 'sys' in props ? props.sys : (props as ProfileType).sys;

  useEffect(() => {
    // COMPLETELY DISABLE client-side fetching - only use server-side data
    if (hasFullData) {
      console.log('Profile: Using server-side enriched data');
      setLoading(false);
      return; // Already have server-side data
    }

    // If we don't have full data, show skeleton indefinitely
    // This prevents client-side API calls that cause GraphQL errors
    console.warn('Profile missing server-side data - showing skeleton. ID:', sys.id);
    setLoading(false); // Stop loading to show the minimal data skeleton
  }, [sys.id, hasFullData]);

  const profile = useContentfulLiveUpdates(profileData);
  const inspectorProps = useContentfulInspectorMode({ entryId: profile?.sys?.id });

  if (loading) {
    return <div className={className}>Loading...</div>;
  }

  if (!profile) {
    return <div className={className}>Profile not found</div>;
  }

  return (
    <Box className={`px-0 gap-4 bg-surface ${className ?? ''}`} direction="row">
      {profile.asset && (
        <Box className="w-48 min-h-16 overflow-hidden flex-shrink-0">
        <AirImage
          link={profile.asset.link}
          altText={profile.asset.altText ?? profile.name ?? 'Profile'}
          className="w-full h-full object-cover"
          {...inspectorProps({ fieldId: 'asset' })}
        />
        </Box>
      )}

      <Box direction="col" className="gap-2 p-4">
        {profile.name && (
          <div className="font-semibold text-lg text-gray-900" {...inspectorProps({ fieldId: 'name' })}>
            {profile.name}
          </div>
        )}

        {profile.profileLocation && (
          <div className="text-sm text-gray-600" {...inspectorProps({ fieldId: 'profileLocation' })}>
            {profile.profileLocation}
          </div>
        )}

        {profile.description && (
          <div className="text-sm text-gray-700 mt-2" {...inspectorProps({ fieldId: 'description' })}>
            {profile.description}
          </div>
        )}
      </Box>
    </Box>
  );
}
