'use client';

import HubspotForm from '@/components/HubspotForm/HubspotForm';

export default function DynamicFormDemo() {
  const handleSubmit = (data: Record<string, unknown>) => {
    console.log('Form submitted:', data);
    alert('Form submitted successfully! Check console for data.');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Dynamic HubSpot Form Demo
        </h1>
        
        <HubspotForm
          formId="1d392e69-b470-4703-afa6-19b01f490b84"
          onSubmit={handleSubmit}
          className="w-full"
        />
      </div>
    </div>
  );
}
