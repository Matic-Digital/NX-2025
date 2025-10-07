// Utility functions for HubSpot form metadata display
import type { HubSpotFormData } from '../fields/types';

export interface FormMetadata {
  totalFields: number;
  totalFieldGroups: number;
  totalSteps: number;
  hasConditionalLogic: boolean;
  hasLegalConsent: boolean;
  isMultiStep: boolean;
  languages: string[];
  theme: string;
  fieldTypes: string[];
  requiredFields: string[];
  hiddenFields: string[];
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const extractFormMetadata = (hubspotData: HubSpotFormData): FormMetadata => {
  return {
    totalFields: hubspotData.metadata.totalFields,
    totalFieldGroups: hubspotData.metadata.totalSteps, // Using totalSteps as field groups
    totalSteps: hubspotData.metadata.totalSteps,
    hasConditionalLogic: hubspotData.metadata.hasConditionalLogic,
    hasLegalConsent: !!(hubspotData.formData as Record<string, unknown>)?.legalConsentOptions,
    isMultiStep: hubspotData.metadata.isMultiStep,
    languages: [], // Will need to extract from formData if available
    theme: 'default', // Will need to extract from formData if available
    fieldTypes: hubspotData.metadata.fieldTypes,
    requiredFields: hubspotData.metadata.requiredFields,
    hiddenFields: [] // Will need to extract from formData if available
  };
};

export const getFormCapabilities = (hubspotData: HubSpotFormData) => {
  const capabilities = [];
  
  if (hubspotData.metadata.isMultiStep) {
    capabilities.push({
      label: 'Multi-Step Form',
      color: 'bg-blue-100 text-blue-800'
    });
  }
  
  if (hubspotData.metadata.hasConditionalLogic) {
    capabilities.push({
      label: 'Conditional Logic',
      color: 'bg-purple-100 text-purple-800'
    });
  }
  
  if ((hubspotData.formData as Record<string, unknown>)?.legalConsentOptions) {
    capabilities.push({
      label: 'Legal Consent',
      color: 'bg-yellow-100 text-yellow-800'
    });
  }
  
  return capabilities;
};
