'use client';

import { useState, useEffect } from 'react';
import HubspotForm from '@/components/HubspotForm/HubspotForm';
import { FormMetadataDisplay } from '@/components/HubspotForm/FormMetadataDisplay';
import type { HubSpotFormData } from '@/components/HubspotForm/fields/types';

export default function DynamicFormDemo() {
  const [formMetadata, setFormMetadata] = useState<HubSpotFormData | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const formId = "1d392e69-b470-4703-afa6-19b01f490b84";

  const handleSubmit = (data: Record<string, unknown>) => {
    console.log('Form submitted:', data);
    alert('Form submitted successfully! Check console for data.');
  };

  // Fetch form metadata for display
  useEffect(() => {
    const fetchFormMetadata = async () => {
      try {
        setLoadingMetadata(true);
        const response = await fetch(`/api/hubspot/form/${formId}`);
        if (response.ok) {
          const data = await response.json() as HubSpotFormData;
          setFormMetadata(data);
        }
      } catch (error) {
        console.error('Failed to fetch form metadata:', error);
      } finally {
        setLoadingMetadata(false);
      }
    };

    void fetchFormMetadata();
  }, [formId]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Dynamic HubSpot Form Demo
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <HubspotForm
              formId={formId}
              onSubmit={handleSubmit}
              className="w-full"
            />
          </div>

          {/* Metadata Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Form Metadata & API Response</h2>
            {loadingMetadata ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">Loading metadata...</span>
              </div>
            ) : formMetadata ? (
              <FormMetadataDisplay hubspotData={formMetadata} />
            ) : (
              <div className="p-4 text-center text-gray-500">
                Failed to load form metadata
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
