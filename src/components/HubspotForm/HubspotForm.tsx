'use client';

import { useEffect, useState } from 'react';
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode
} from '@contentful/live-preview/react';

// API
import { getHubspotFormById } from '@/components/HubspotForm/HubspotFormApi';

// Types
import type { HubspotForm as HubspotFormType } from '@/components/HubspotForm/HubspotFormSchema';

// Utils
import { cn } from '@/lib/utils';

// ===== TYPES & INTERFACES =====

interface HubspotFormProps {
  hubspotForm: HubspotFormType;
  className?: string;
}

interface HubspotFormByIdProps {
  id: string;
  className?: string;
}

// ===== MAIN COMPONENT =====

export function HubspotForm({ hubspotForm, className }: HubspotFormProps) {
  const inspectorProps = useContentfulInspectorMode({
    entryId: hubspotForm.sys.id
  });

  const updatedHubspotForm = useContentfulLiveUpdates(hubspotForm);

  useEffect(() => {
    const targetId = `hubspot-form-${updatedHubspotForm.sys.id}`;
    
    if (!updatedHubspotForm.formLink) {
      return;
    }

    // Extract portal ID and form ID from the form link
    const regex = /\/(\d+)\/([a-f0-9-]+)/;
    const match = regex.exec(updatedHubspotForm.formLink);
    if (!match?.[1] || !match?.[2]) {
      return;
    }

    const portalId = match[1];
    const formId = match[2];

    // Use a timeout to delay form creation and avoid React Strict Mode issues
    const timeoutId = setTimeout(() => {
      const targetElement = document.getElementById(targetId);
      
      if (!targetElement) {
        return;
      }

      // Check if form already exists
      const existingForm = targetElement.querySelector('form, iframe, .hs-form');
      if (existingForm) {
        return;
      }

      // Clear any existing content
      targetElement.innerHTML = '';

      // Load HubSpot script if not already loaded
      if (!window.hbspt) {
        const script = document.createElement('script');
        script.src = '//js.hsforms.net/forms/embed/v2.js';
        script.async = true;
        script.onload = () => {
          createForm();
        };
        document.body.appendChild(script);
      } else {
        createForm();
      }

      function createForm() {
        // Final check before creating
        const finalCheck = document.getElementById(targetId);
        if (window.hbspt && finalCheck && !finalCheck.querySelector('form, iframe, .hs-form')) {
          window.hbspt.forms.create({
            region: "na1",
            portalId: portalId,
            formId: formId,
            target: `#${targetId}`
          });
        }
      }
    }, 100); // Small delay to let React Strict Mode settle

    return () => {
      clearTimeout(timeoutId);
    };
  }, [updatedHubspotForm.formLink, updatedHubspotForm.sys.id]);

  return (
    <div className={cn('hubspot-form-container', className)} {...inspectorProps}>
      {updatedHubspotForm.title && (
        <h3 className="mb-4 text-xl font-semibold">{updatedHubspotForm.title}</h3>
      )}
      <div id={`hubspot-form-${updatedHubspotForm.sys.id}`} />
    </div>
  );
}

// ===== BY ID COMPONENT =====

export function HubspotFormById({ id, className }: HubspotFormByIdProps) {
  const [hubspotForm, setHubspotForm] = useState<HubspotFormType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHubspotForm = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getHubspotFormById(id);
        if (response.item) {
          setHubspotForm(response.item);
        } else {
          setError('HubSpot form not found');
        }
      } catch (err) {
        console.error('Error fetching HubSpot form:', err);
        setError('Failed to load HubSpot form');
      } finally {
        setLoading(false);
      }
    };

    void fetchHubspotForm();
  }, [id]);

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-muted-foreground">Loading form...</div>
      </div>
    );
  }

  if (error || !hubspotForm) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-destructive">{error ?? 'Form not found'}</div>
      </div>
    );
  }

  return <HubspotForm hubspotForm={hubspotForm} className={className} />;
}

// ===== TYPE DECLARATIONS =====

declare global {
  interface Window {
    hbspt: {
      forms: {
        create: (options: {
          region: string;
          portalId: string;
          formId: string;
          target: string;
        }) => void;
      };
    };
  }
}
