'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { FieldRenderer, validateField, type HubSpotFormData } from './fields';

interface HubspotFormProps {
  formId: string;
  onSubmit?: (data: Record<string, unknown>) => void;
  className?: string;
}

const HubspotForm: React.FC<HubspotFormProps> = ({
  formId,
  onSubmit,
  className = ''
}) => {
  const [formData, setFormData] = useState<HubSpotFormData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch form data from our API
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/hubspot/form/${formId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch form data');
        }
        const data = await response.json() as HubSpotFormData;
        setFormData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load form');
      } finally {
        setLoading(false);
      }
    };

    void fetchFormData();
  }, [formId]);

  // Create form with TanStack Form
  const form = useForm({
    defaultValues: {},
    onSubmit: async ({ value }) => {
      setSubmitting(true);
      try {
        // Submit to HubSpot
        const response = await fetch(`/api/hubspot/form/${formId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(value),
        });

        if (!response.ok) {
          throw new Error('Failed to submit form');
        }

        // Call custom onSubmit if provided
        if (onSubmit) {
          onSubmit(value);
        }

        // Reset form or show success message
        alert('Form submitted successfully!');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit form');
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading form...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !formData) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="text-center text-red-600">
            <p>Error: {error ?? 'Failed to load form'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStepData = formData.steps[currentStep];
  const isLastStep = currentStep === formData.steps.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / formData.steps.length) * 100;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{(formData.formData as Record<string, unknown>)?.name as string ?? 'HubSpot Form'}</CardTitle>
        {formData.metadata.isMultiStep && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep + 1} of {formData.steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Current Step Fields */}
          <div className="space-y-4">
            {currentStepData?.stepName && (
              <h3 className="text-lg font-semibold">{currentStepData.stepName}</h3>
            )}
            
            {currentStepData?.fields
              .filter(field => !field.hidden)
              .map((field) => (
                <form.Field
                  key={field.name}
                  name={field.name}
                  validators={{
                    onChange: validateField(field),
                  }}
                >
                  {(fieldApi) => (
                    <FieldRenderer
                      field={field}
                      value={fieldApi.state.value as string | number | boolean | null | undefined}
                      onChange={fieldApi.handleChange}
                      error={fieldApi.state.meta.errors?.[0]}
                    />
                  )}
                </form.Field>
              ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={isFirstStep}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {isLastStep ? (
              <form.Subscribe
                selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
              >
                {({ canSubmit, isSubmitting: _isSubmitting }) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || submitting}
                    className="flex items-center"
                  >
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Submit Form
                  </Button>
                )}
              </form.Subscribe>
            ) : (
              <Button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(formData.steps.length - 1, prev + 1))}
                className="flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HubspotForm;
