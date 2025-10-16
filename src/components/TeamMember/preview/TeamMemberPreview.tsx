'use client';

import { useState } from 'react';
import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { Button } from '@/components/ui/button';

import { AirImage } from '@/components/Image/AirImage';
import { FieldBreakdown } from '@/components/Preview/FieldBreakdown';
import { teamMemberFields } from '@/components/TeamMember/preview/TeamMemberFields';
import { TeamMemberModal } from '@/components/TeamMember/TeamMemberModal';

import type { TeamMember as TeamMemberType } from '@/components/TeamMember/TeamMemberSchema';

/**
 * TeamMember Preview Component
 *
 * This component is used in Contentful Live Preview to display TeamMember components
 * with a live preview and field breakdown.
 */
export function TeamMemberPreview(props: Partial<TeamMemberType>) {
  // Contentful Live Preview integration
  const liveTeamMember = useContentfulLiveUpdates(props);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Component Preview */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Live Preview</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                TeamMember
              </span>
            </div>
            <div className="overflow-hidden">
              {(() => {
                // Check if we have all required fields for a valid TeamMember
                const hasRequiredFields =
                  liveTeamMember?.sys &&
                  liveTeamMember?.name &&
                  liveTeamMember?.jobTitle &&
                  liveTeamMember?.image;

                if (hasRequiredFields) {
                  return (
                    <div className="p-8">
                      <div className="max-w-2xl mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-gray-600">
                          Preview (team member card)
                        </h3>

                        {/* Team Member Card Preview */}
                        <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-white">
                          {liveTeamMember.image && (
                            <div className="relative w-32 h-32 rounded-full overflow-hidden">
                              <AirImage
                                link={liveTeamMember.image.link}
                                altText={liveTeamMember.image.altText ?? liveTeamMember.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="text-center">
                            <h4 className="text-xl font-bold text-gray-900">
                              {liveTeamMember.name}
                            </h4>
                            <p className="text-sm text-gray-600">{liveTeamMember.jobTitle}</p>
                          </div>
                          <Button onClick={() => setIsModalOpen(true)} variant="outline">
                            View Details
                          </Button>
                        </div>

                        {/* Modal Preview */}
                        {isModalOpen && (
                          <TeamMemberModal
                            isOpen={isModalOpen}
                            onOpenChange={setIsModalOpen}
                            teamMember={liveTeamMember as TeamMemberType}
                          />
                        )}
                      </div>
                    </div>
                  );
                }

                // Show preview placeholder when fields are missing
                return (
                  <div className="p-8 text-center text-gray-500">
                    <p>Preview will appear when all required fields are configured:</p>
                    <ul className="mt-2 text-sm">
                      {!liveTeamMember?.name && <li>• Name is required</li>}
                      {!liveTeamMember?.jobTitle && <li>• Job Title is required</li>}
                      {!liveTeamMember?.image && <li>• Image is required</li>}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Field Breakdown */}
          <FieldBreakdown
            title="TeamMember Fields"
            fields={teamMemberFields}
            data={liveTeamMember}
          />
        </div>
      </div>
    </div>
  );
}
