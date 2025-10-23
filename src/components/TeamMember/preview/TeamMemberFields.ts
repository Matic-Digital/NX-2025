import type { FieldConfig } from '@/components/Preview/FieldBreakdown';
import type { TeamMember } from '@/components/TeamMember/TeamMemberSchema';

export const teamMemberFields: FieldConfig<Partial<TeamMember>>[] = [
  {
    name: 'name',
    label: 'Name',
    required: true,
    description: 'The full name of the team member. This appears as the primary heading.',
    color: 'green',
    getValue: (data) => (data.name ? `"${data.name}"` : 'Not set')
  },
  {
    name: 'jobTitle',
    label: 'Job Title',
    required: true,
    description: 'The job title or role of the team member within the organization.',
    color: 'blue',
    getValue: (data) => (data.jobTitle ? `"${data.jobTitle}"` : 'Not set')
  },
  {
    name: 'image',
    label: 'Image',
    required: true,
    description: 'Profile photo of the team member. Should be a professional headshot.',
    color: 'purple',
    getValue: (data) => {
      if (!data.image) {
        return 'Not set';
      }
      return data.image.title ? `Image: ${data.image.title}` : 'Image configured';
    }
  },
  {
    name: 'bio',
    label: 'Bio',
    required: false,
    description:
      'Rich text biography of the team member. Provides background and professional information.',
    color: 'orange',
    getValue: (data) => (data.bio?.json ? 'Bio content configured' : 'Not set')
  },
  {
    name: 'email',
    label: 'Email',
    required: false,
    description: 'Email address for the team member.',
    color: 'cyan',
    getValue: (data) => (data.email ? `"${data.email}"` : 'Not set')
  },
  {
    name: 'linkedIn',
    label: 'LinkedIn',
    required: false,
    description: 'LinkedIn profile URL for the team member.',
    color: 'indigo',
    getValue: (data) => (data.linkedIn ? `"${data.linkedIn}"` : 'Not set')
  }
];
