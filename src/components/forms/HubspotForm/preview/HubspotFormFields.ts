import type { HubspotForm } from '@/components/Forms/HubspotForm/HubspotFormSchema';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const hubspotFormFields: FieldConfig<Partial<HubspotForm>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the form.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'description',
    label: 'Description',
    required: false,
    description: 'The description of the form.',
    color: 'blue',
    getValue: (data) => (data.description ? `"${data.description}"` : 'Not set')
  },
  {
    name: 'formId',
    label: 'Form ID',
    required: true,
    description: 'The HubSpot form ID.',
    color: 'purple',
    getValue: (data) => (data.formId ? `"${data.formId}"` : 'Not set')
  }
];
