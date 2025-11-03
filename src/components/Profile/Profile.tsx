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

export function Profile({ sys, className }: ProfileProps) {
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
    return <div className={className}>Loading...</div>;
  }

  if (!profile) {
    return <div className={className}>Profile not found</div>;
  }

  return (
    <Box className={className + 'px-0 gap-4 bg-surface'} direction="row">
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
          <div {...inspectorProps({ fieldId: 'name' })}>
            {profile.name}
          </div>
        )}

        {profile.profileLocation && (
          <div {...inspectorProps({ fieldId: 'profileLocation' })}>
            {profile.profileLocation}
          </div>
        )}

        {profile.description && (
          <div {...inspectorProps({ fieldId: 'description' })}>
            {profile.description}
          </div>
        )}
      </Box>
    </Box>
  );
}
