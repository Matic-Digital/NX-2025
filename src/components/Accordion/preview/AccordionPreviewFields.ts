import type { Accordion } from '@/components/Accordion/AccordionSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const accordionFields: FieldConfig<Partial<Accordion>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The main title for the accordion section. This appears as the primary heading.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'itemsCollection',
    label: 'Accordion Items',
    required: true,
    description: 'A collection of AccordionItem components that make up the accordion content.',
    color: 'blue',
    getValue: (data) =>
      data.itemsCollection?.items?.length
        ? `AccordionItems configured (${data.itemsCollection.items.length})`
        : 'Not set'
  }
];
