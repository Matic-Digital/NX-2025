import type { FieldConfig } from '@/components/Preview/FieldBreakdown';
import type { Testimonials } from '@/components/Testimonials/TestimonialsSchema';

export const testimonialsFields: FieldConfig<Partial<Testimonials>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the testimonials section.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'itemsCollection',
    label: 'Testimonial Items',
    required: true,
    description: 'Collection of individual testimonial items to display.',
    color: 'blue',
    getValue: (data) => {
      const count = data.itemsCollection?.items?.length ?? 0;
      return count > 0 ? `${count} testimonial${count === 1 ? '' : 's'}` : 'No items';
    }
  }
];
