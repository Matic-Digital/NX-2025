import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AirImage } from '@/components/media/AirImage';
import { ArrowUpRight } from 'lucide-react';
import type { TeamMember } from '@/types/contentful/TeamMember';
import { Box } from '@/components/global/matic-ds';

interface TeamMemberModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamMember: TeamMember;
}

export function TeamMemberModal({ isOpen, onOpenChange, teamMember }: TeamMemberModalProps) {
  const renderBio = () => {
    if (!teamMember.bio?.json) return null;

    // Simple text extraction from Contentful rich text JSON
    const extractText = (node: unknown): string => {
      if (typeof node === 'string') return node;
      if (typeof node === 'object' && node !== null) {
        const nodeObj = node as Record<string, unknown>;
        if (nodeObj.nodeType === 'text') {
          return (nodeObj.value as string) ?? '';
        }
        if (Array.isArray(nodeObj.content)) {
          return nodeObj.content.map(extractText).join('');
        }
      }
      return '';
    };

    const bioText = extractText(teamMember.bio.json);
    return bioText;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[75vw] gap-0 overflow-hidden rounded-none p-0 md:max-w-[90vw] lg:max-w-[75vw]">
        <DialogTitle className="sr-only">{teamMember.name} - Team Member Details</DialogTitle>
        <Box
          direction={{ base: 'col', md: 'row' }}
          gap={0}
          className="max-h-[90vh] min-h-[500px] overflow-y-auto md:min-h-[600px]"
        >
          {/* Left side - Image */}
          <div className="relative w-full md:w-[45%] lg:w-[50%]">
            <AirImage
              link={teamMember.image?.link}
              altText={teamMember.image?.altText ?? teamMember.name}
              className="h-full min-h-[300px] w-full object-cover md:min-h-full"
            />
          </div>

          {/* Right side - Content */}
          <Box
            direction="col"
            gap={6}
            className="min-h-[400px] w-full overflow-y-auto px-6 py-8 sm:px-8 md:w-[55%] md:px-12 md:py-12 lg:w-[50%]"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{teamMember.name}</h2>
              <p className="text-lg text-gray-600">{teamMember.jobTitle}</p>
            </div>

            {renderBio() && (
              <div className="text-sm leading-relaxed text-gray-700 sm:text-base">
                <p>{renderBio()}</p>
              </div>
            )}

            {teamMember.linkedIn && (
              <div className="pt-2">
                <Button variant="outline" asChild className="inline-flex items-center gap-2">
                  <a href={teamMember.linkedIn} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
              </div>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
