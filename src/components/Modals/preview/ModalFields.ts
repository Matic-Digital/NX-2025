import type { Modal } from '@/components/Modals/Modal';
import type { FieldConfig } from '@/components/Preview/FieldBreakdown';

export const modalFields: FieldConfig<Partial<Modal>>[] = [
  {
    name: 'title',
    label: 'Title',
    required: true,
    description: 'The title of the modal.',
    color: 'green',
    getValue: (data) => (data.title ? `"${data.title}"` : 'Not set')
  },
  {
    name: 'description',
    label: 'Description',
    required: true,
    description: 'The description of the modal.',
    color: 'blue',
    getValue: (data) => (data.description ? `"${data.description}"` : 'Not set')
  },
  {
    name: 'form',
    label: 'HubSpot Form',
    required: false,
    description: 'The HubSpot form to display in the modal.',
    color: 'purple',
    getValue: (data) => (data.form?.formId ? `Form ID: ${data.form.formId}` : 'Not set')
  }
];
