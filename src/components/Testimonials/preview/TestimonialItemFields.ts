import type { FieldConfig } from '@/components/Preview/FieldBreakdown';
import type { TestimonialItem } from '@/components/Testimonials/TestimonialsSchema';

export const testimonialItemFields: FieldConfig<Partial<TestimonialItem>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'Optional title for the testimonial.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'quote',
    label: 'Quote',
    required: true,
    description: 'The testimonial quote or feedback text.',
    color: 'blue',
    getValue: (data) =>
      data.quote
        ? `"${data.quote.substring(0, 100)}${data.quote.length > 100 ? '...' : ''}"`
        : 'Not set'
  },
  {
    name: 'authorName',
    label: 'Author Name',
    required: false,
    description: 'Name of the person giving the testimonial.',
    color: 'purple',
    getValue: (data) => (data.authorName ? `"${data.authorName}"` : 'Not set')
  },
  {
    name: 'authorTitle',
    label: 'Author Title',
    required: false,
    description: 'Job title or role of the testimonial author.',
    color: 'orange',
    getValue: (data) => (data.authorTitle ? `"${data.authorTitle}"` : 'Not set')
  },
  {
    name: 'headshot',
    label: 'Headshot',
    required: false,
    description: 'Profile photo of the testimonial author.',
    color: 'cyan',
    getValue: (data) => {
      if (!data.headshot) {
        return 'Not set';
      }
      return data.headshot.title ? `Image: ${data.headshot.title}` : 'Image configured';
    }
  }
];
