'use client';

import React, { useEffect, useState } from 'react';
import { FieldRenderer, validateField } from './fields';
import { useForm } from '@tanstack/react-form';

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { Box } from '@/components/global/matic-ds';

import { getFormIdFromHubspotForm } from '@/components/Forms/HubspotForm/HubspotFormSchema';

import type { HubSpotFormData } from './fields';
import type { HubSpotFormField } from './fields/types';
import type { HubspotForm as HubspotFormType } from '@/components/Forms/HubspotForm/HubspotFormSchema';

interface HubspotFormProps {
  hubspotForm?: HubspotFormType;
  formId?: string;
  image?: {
    link?: string;
    altText?: string;
    title?: string;
  };
  onSubmit?: (data: Record<string, unknown>) => void;
  className?: string;
  theme?: 'light' | 'dark';
  hideHeader?: boolean;
}

export const HubspotForm: React.FC<HubspotFormProps> = ({
  hubspotForm,
  formId: propFormId,
  onSubmit,
  className = '',
  theme = 'dark',
  hideHeader = false
}) => {
  // Get form ID from either the hubspotForm prop or the formId prop
  const formId = hubspotForm ? getFormIdFromHubspotForm(hubspotForm) : propFormId;

  // Initialize all hooks at the top level
  const [formData, setFormData] = useState<HubSpotFormData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(value)
        });

        if (!response.ok) {
          throw new Error('Failed to submit form');
        }

        // Get the response data to check for HubSpot redirect
        const result = (await response.json()) as Record<string, unknown>;

        // Call custom onSubmit if provided
        if (onSubmit) {
          onSubmit(value);
        }

        // Check if HubSpot provided a redirect URL, otherwise use thank you page
        const hubspotResponse = result.hubspotResponse as Record<string, unknown> | undefined;
        const redirectUrl =
          (hubspotResponse?.redirectUri as string) ??
          (result.redirectUri as string) ??
          '/thank-you';

        window.location.href = redirectUrl;
      } catch (_err) {
        setError(_err instanceof Error ? _err.message : 'Failed to submit form');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Fetch form data from our API
  useEffect(() => {
    const fetchFormData = async () => {
      if (!formId) {
        setError('No form ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/hubspot/form/${formId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch form data');
        }
        const data = (await response.json()) as HubSpotFormData;
        setFormData(data);
      } catch (_err) {
        setError(_err instanceof Error ? _err.message : 'Failed to load form');
      } finally {
        setLoading(false);
      }
    };

    void fetchFormData();
  }, [formId]);

  // Early return after all hooks are called
  if (!formId) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="text-center text-red-600">
            <p>Error: No form ID provided</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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

  // Use safe array access with bounds checking
  const stepFields = formData.steps.at(currentStep);
  const isLastStep = currentStep === formData.steps.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / formData.steps.length) * 100;

  // Theme-aware text classes
  const textClass = theme === 'light' ? 'text-black' : 'text-text-on-invert';

  // Get form title from Contentful or fallback to HubSpot form name
  const formTitle =
    hubspotForm?.title ??
    ((formData.formData as Record<string, unknown>)?.name as string) ??
    'HubSpot Form';

  // Get form description from Contentful or fallback to HubSpot form description
  const formDescription =
    hubspotForm?.description ??
    ((formData.formData as Record<string, unknown>)?.description as string) ??
    'HubSpot Form Description';

  // Get submit button text from form data or fallback
  // The HubSpot form data structure has displayOptions at the top level
  const hubspotFormData = formData.formData as Record<string, unknown>;
  const displayOptions = hubspotFormData?.displayOptions as Record<string, unknown> | undefined;

  const submitButtonText =
    (displayOptions?.submitButtonText as string) ??
    (hubspotFormData?.submitText as string) ??
    (hubspotFormData?.submitButtonText as string) ??
    'Submit';

  if (formData.metadata.isMultiStep) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-text-on-invert text-headline-md">{formTitle}</CardTitle>
          {formData.metadata.isMultiStep && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Step {currentStep + 1} of {formData.steps.length}
                </span>
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
              {stepFields?.stepName && (
                <h3 className="text-lg font-semibold">{stepFields.stepName}</h3>
              )}

              {stepFields?.fields
                .filter((field: HubSpotFormField) => !field.hidden)
                .sort(
                  (a: HubSpotFormField, b: HubSpotFormField) =>
                    (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
                )
                .map((field: HubSpotFormField) => (
                  <form.Field
                    key={field.name}
                    name={field.name}
                    validators={{
                      onChange: validateField(field),
                      onBlur: validateField(field)
                    }}
                  >
                    {(fieldApi) => (
                      <FieldRenderer
                        field={field}
                        value={fieldApi.state.value as string | number | boolean | null | undefined}
                        onChange={fieldApi.handleChange}
                        error={fieldApi.state.meta.errors?.[0]}
                        theme={theme}
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentStep((prev) => Math.max(0, prev - 1));
                }}
                disabled={isFirstStep}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {isLastStep ? (
                <form.Subscribe
                  selector={(state) => {
                    // Check if all required fields are filled and valid
                    const requiredFields =
                      stepFields?.fields.filter(
                        (field: HubSpotFormField) => field.required && !field.hidden
                      ) ?? [];
                    const allRequiredFieldsFilled = requiredFields.every(
                      (field: HubSpotFormField) => {
                        const value = (state.values as Record<string, unknown>)[field.name];
                        return value && (typeof value === 'string' ? value.trim() !== '' : true);
                      }
                    );

                    return {
                      canSubmit: state.canSubmit,
                      isSubmitting: state.isSubmitting,
                      isValid: state.isValid,
                      hasErrors: Object.keys(state.errors).length > 0,
                      allRequiredFieldsFilled
                    };
                  }}
                >
                  {({
                    canSubmit,
                    isSubmitting: _isSubmitting,
                    isValid,
                    hasErrors,
                    allRequiredFieldsFilled
                  }) => (
                    <Button
                      type="submit"
                      disabled={
                        !canSubmit ||
                        submitting ||
                        !isValid ||
                        hasErrors ||
                        !allRequiredFieldsFilled
                      }
                      className="flex items-center"
                    >
                      {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {submitButtonText || 'Submit'}
                    </Button>
                  )}
                </form.Subscribe>
              ) : (
                <form.Subscribe
                  selector={(state) => {
                    // Check if all required fields in current step are filled and valid
                    const requiredFields =
                      stepFields?.fields.filter(
                        (field: HubSpotFormField) => field.required && !field.hidden
                      ) ?? [];
                    const allRequiredFieldsFilled = requiredFields.every(
                      (field: HubSpotFormField) => {
                        const value = (state.values as Record<string, unknown>)[field.name];
                        return value && (typeof value === 'string' ? value.trim() !== '' : true);
                      }
                    );

                    // Check if current step fields have validation errors
                    // Use Object.entries to safely iterate over errors without dynamic property access
                    const hasCurrentStepErrors = (() => {
                      if (
                        !state.errors ||
                        typeof state.errors !== 'object' ||
                        Array.isArray(state.errors)
                      ) {
                        return false;
                      }

                      const currentStepFieldNames = new Set(
                        stepFields?.fields?.map((f) => f.name) ?? []
                      );
                      const errorEntries = Object.entries(
                        state.errors as Record<string, unknown[]>
                      );

                      return errorEntries.some(([fieldName, fieldErrors]) => {
                        return (
                          currentStepFieldNames.has(fieldName) &&
                          Array.isArray(fieldErrors) &&
                          fieldErrors.length > 0
                        );
                      });
                    })();

                    return {
                      allRequiredFieldsFilled,
                      hasCurrentStepErrors
                    };
                  }}
                >
                  {({ allRequiredFieldsFilled, hasCurrentStepErrors }) => (
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentStep((prev) => Math.min(formData.steps.length - 1, prev + 1));
                      }}
                      disabled={!allRequiredFieldsFilled || hasCurrentStepErrors}
                      className="flex items-center"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </form.Subscribe>
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
  }

  return (
    <Box direction="col" gap={4} className="relative justify-center h-full w-full">
      {!hideHeader && (
        <h2
          className={`${textClass} text-4xl font-normal leading-[120%] md:text-headline-md text-center md:text-left`}
        >
          {formTitle}
        </h2>
      )}
      <p
        className={`${textClass} text-sm font-normal leading-[160%] tracking-[0.00875rem] md:text-body-xs text-center md:text-left`}
      >
        {formDescription}
      </p>
      <CardContent className={`${textClass} p-0 mt-[2.5rem] md:mt-0`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-6"
        >
          <div className="space-y-6">
            {/* Form Fields */}
            <div className="space-y-4">
              {stepFields?.fields
                .filter((field: HubSpotFormField) => !field.hidden)
                .sort(
                  (a: HubSpotFormField, b: HubSpotFormField) =>
                    (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
                )
                .map((field: HubSpotFormField) => (
                  <form.Field
                    key={field.name}
                    name={field.name}
                    validators={{
                      onChange: validateField(field),
                      onBlur: validateField(field)
                    }}
                  >
                    {(fieldApi) => (
                      <FieldRenderer
                        field={field}
                        value={fieldApi.state.value as string | number | boolean | null | undefined}
                        onChange={fieldApi.handleChange}
                        error={fieldApi.state.meta.errors?.[0]}
                        theme={theme}
                      />
                    )}
                  </form.Field>
                ))}
            </div>

            {/* Submit Button */}
            <form.Subscribe
              selector={(state) => {
                // Check if all required fields are filled and valid
                const requiredFields =
                  stepFields?.fields.filter(
                    (field: HubSpotFormField) => field.required && !field.hidden
                  ) ?? [];
                const allRequiredFieldsFilled = requiredFields.every((field: HubSpotFormField) => {
                  const value = (state.values as Record<string, unknown>)[field.name];
                  return value && (typeof value === 'string' ? value.trim() !== '' : true);
                });

                return {
                  canSubmit: state.canSubmit,
                  isSubmitting: state.isSubmitting,
                  isValid: state.isValid,
                  hasErrors: Object.keys(state.errors).length > 0,
                  allRequiredFieldsFilled
                };
              }}
            >
              {({
                canSubmit,
                isSubmitting: _isSubmitting,
                isValid,
                hasErrors,
                allRequiredFieldsFilled
              }) => (
                <Button
                  type="submit"
                  disabled={
                    !canSubmit || submitting || !isValid || hasErrors || !allRequiredFieldsFilled
                  }
                  className="flex items-center p-3.5 rounded-sm w-full md:w-auto"
                >
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {submitButtonText || 'Submit'}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </CardContent>
    </Box>
  );
};
