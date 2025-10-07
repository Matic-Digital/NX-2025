import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { HubSpotFormData } from './fields/types';
import { formatDate, getFormCapabilities } from './utils';

interface FormMetadataDisplayProps {
  hubspotData: HubSpotFormData;
}

export const FormMetadataDisplay: React.FC<FormMetadataDisplayProps> = ({ hubspotData }) => {
  const capabilities = getFormCapabilities(hubspotData);

  return (
    <div className="space-y-6">
      {/* Form Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Form Overview
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              (hubspotData.formData as Record<string, unknown>)?.archived 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {(hubspotData.formData as Record<string, unknown>)?.archived ? "Archived" : "Active"}
            </span>
          </CardTitle>
          <CardDescription>Basic form information and metadata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Form Name</p>
              <p className="text-sm text-muted-foreground">{(hubspotData.formData as Record<string, unknown>)?.name as string}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Form ID</p>
              <p className="text-sm text-muted-foreground font-mono">{(hubspotData.formData as Record<string, unknown>)?.id as string}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">{formatDate((hubspotData.formData as Record<string, unknown>)?.createdAt as string)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-sm text-muted-foreground">{formatDate((hubspotData.formData as Record<string, unknown>)?.updatedAt as string)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Form Statistics</CardTitle>
          <CardDescription>Key metrics and capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{hubspotData.metadata.totalFields}</p>
              <p className="text-sm text-muted-foreground">Total Fields</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{hubspotData.metadata.totalSteps}</p>
              <p className="text-sm text-muted-foreground">Form Steps</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{hubspotData.steps.length}</p>
              <p className="text-sm text-muted-foreground">Field Groups</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{hubspotData.metadata.requiredFields.length}</p>
              <p className="text-sm text-muted-foreground">Required Fields</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{hubspotData.metadata.fieldTypes.length}</p>
              <p className="text-sm text-muted-foreground">Field Types</p>
            </div>
          </div>
          
          <div className="border-t my-4"></div>
          
          <div className="flex flex-wrap gap-2">
            {capabilities.map((capability, index) => (
              <span key={index} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${capability.color}`}>
                {capability.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Types */}
      <Card>
        <CardHeader>
          <CardTitle>Field Types Used</CardTitle>
          <CardDescription>All field types present in this form</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {hubspotData.metadata.fieldTypes.map((fieldType, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-medium bg-gray-50">
                {fieldType}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Groups/Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Field Groups & Steps ({hubspotData.steps.length})</CardTitle>
          <CardDescription>Detailed breakdown of form structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hubspotData.steps.map((step, stepIndex) => (
              <div key={stepIndex} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">
                    Step {step.stepNumber}
                    {step.stepName && `: ${step.stepName}`}
                  </h4>
                  <div className="flex gap-2">
                    {step.isPageBreak && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Page Break
                      </span>
                    )}
                    {step.hasConditionalLogic && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Conditional Logic
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {step.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div>
                        <span className="font-medium">{field.label}</span>
                        <span className="text-gray-500 ml-2">({field.name})</span>
                      </div>
                      <div className="flex gap-1">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-200 text-gray-700">
                          {field.fieldType}
                        </span>
                        {field.required && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-700">
                            Required
                          </span>
                        )}
                        {field.hidden && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700">
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Required Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Required Fields ({hubspotData.metadata.requiredFields.length})</CardTitle>
          <CardDescription>Fields that must be completed</CardDescription>
        </CardHeader>
        <CardContent>
          {hubspotData.metadata.requiredFields.length > 0 ? (
            <div className="space-y-1">
              {hubspotData.metadata.requiredFields.map((fieldName, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-1 mb-1">
                  {fieldName}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No required fields</p>
          )}
        </CardContent>
      </Card>

      {/* Raw API Response */}
      <Card>
        <CardHeader>
          <CardTitle>Raw API Response</CardTitle>
          <CardDescription>Complete JSON response from HubSpot API</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
            {JSON.stringify(hubspotData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
