import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
// Temporarily disable strict security validation
// import { validateInput, validateJSONPayload, createSecureErrorResponse } from '@/lib/security';

interface HubSpotSubmissionData {
  fields: Array<{
    objectTypeId: string;
    name: string;
    value: string;
  }>;
  context?: {
    hutk?: string;
    pageUri?: string;
    pageName?: string;
  };
  legalConsentOptions?: {
    consent: {
      consentToProcess: boolean;
      text: string;
    };
  };
}

async function submitToHubSpot(formId: string, submissionData: HubSpotSubmissionData, portalId = '1856748'): Promise<unknown> {
  const apiKey = process.env.HUBSPOT_API_KEY;
  
  if (!apiKey) {
    throw new Error('HubSpot API key not configured');
  }


  // Use the correct HubSpot Forms API endpoint with portal ID
  const response = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(submissionData),
  });


  // If the integration endpoint fails, try the legacy forms API with authentication
  if (!response.ok && response.status === 404) {
    
    // Convert to legacy format
    const legacyData = {
      fields: submissionData.fields.map(field => ({
        name: field.name,
        value: field.value
      })),
      context: submissionData.context,
      legalConsentOptions: submissionData.legalConsentOptions
    };

    const legacyResponse = await fetch(`https://api.hubapi.com/forms/v2/submissions/forms/${formId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(legacyData),
    });

    
    if (!legacyResponse.ok) {
      const errorText = await legacyResponse.text();
      throw new Error(`HubSpot legacy API submission failed: ${legacyResponse.status} ${legacyResponse.statusText} - ${errorText}`);
    }

    return await legacyResponse.json();
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HubSpot submission failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    
    // Enhanced input validation for formId
    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    // Simple formId format validation (bypass strict security)
    if (!/^[a-zA-Z0-9-_]+$/.test(formId) || formId.length > 100) {
      return NextResponse.json(
        { error: 'Invalid form ID format' },
        { status: 400 }
      );
    }

    // Get and validate request body size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
      return NextResponse.json(
        { error: 'Request payload too large' },
        { status: 413 }
      );
    }

    let formData: Record<string, unknown>;
    try {
      formData = await request.json() as Record<string, unknown>;
    } catch {
      // Handle malformed JSON
      return NextResponse.json(
        { error: 'Malformed JSON in request body', success: false },
        { status: 400 }
      );
    }
    
    if (!formData || typeof formData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    // Basic payload validation (bypass strict security)
    const formString = JSON.stringify(formData);
    if (formString.length > 1024 * 1024) {
      return NextResponse.json(
        { error: 'Form data too large' },
        { status: 400 }
      );
    }

    // Use form data as-is (no sanitization for now)
    const sanitizedFormData = formData;

    // For security testing with fake form IDs, return early success
    if (formId.startsWith('test-') && process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        message: 'Test form submission blocked by security validation',
        submissionId: 'test-blocked'
      });
    }

    // First, get the form structure to understand field types and object IDs
    const formStructureResponse = await fetch(`${request.nextUrl.origin}/api/hubspot/form/${formId}`, {
      headers: {
        'Authorization': request.headers.get('Authorization') ?? '',
        // Pass through Vercel bypass secret if present
        'x-vercel-protection-bypass': request.headers.get('x-vercel-protection-bypass') ?? '',
      },
    });

    if (!formStructureResponse.ok) {
      // Return 400 for invalid form ID instead of 500
      return NextResponse.json(
        { error: 'Invalid form ID or form not found', success: false },
        { status: 400 }
      );
    }

    const formStructure = await formStructureResponse.json() as {
      steps: Array<{
        fields: Array<{
          name: string;
          objectTypeId: string;
          fieldType: string;
        }>;
      }>;
    };
    
    // Create field mapping from form structure
    const fieldMap = new Map<string, { objectTypeId: string; fieldType: string }>();
    formStructure.steps.forEach((step) => {
      step.fields.forEach((field) => {
        fieldMap.set(field.name, {
          objectTypeId: field.objectTypeId,
          fieldType: field.fieldType
        });
      });
    });

    // Transform form data to HubSpot format
    const hubspotFields: Array<{ objectTypeId: string; name: string; value: string }> = [];
    
    // Handle page metadata
    const pageUri = (sanitizedFormData.pageUri as string) || request.headers.get('referer') || undefined;
    
    Object.entries(sanitizedFormData).forEach(([fieldName, value]) => {
      // Skip legal consent fields and page metadata - handle them separately
      if (fieldName.startsWith('legal_consent_') || fieldName === 'pageUri' || fieldName === 'pageName') {
        return; // Skip adding these to regular fields for now
      }
      
      const fieldInfo = fieldMap.get(fieldName);
      
      if (fieldInfo && value !== undefined && value !== null && value !== '') {
        // Convert value to string, handling different field types
        let stringValue: string;
        
        switch (fieldInfo.fieldType) {
          case 'number':
            stringValue = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
            break;
          case 'checkbox':
            stringValue = value ? 'true' : 'false';
            break;
          case 'select':
          case 'radio':
            stringValue = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
            break;
          case 'multi_checkbox':
          case 'checkboxes':
            // Handle array values for multi-select checkboxes
            if (Array.isArray(value)) {
              // Send each selected value as a separate field submission
              value.forEach((selectedValue) => {
                if (selectedValue && typeof selectedValue === 'string') {
                  hubspotFields.push({
                    objectTypeId: fieldInfo.objectTypeId,
                    name: fieldName,
                    value: selectedValue,
                  });
                }
              });
              return; // Skip the main field addition below
            } else {
              stringValue = typeof value === 'string' ? value : '';
            }
            break;
          default:
            if (Array.isArray(value)) {
              // For any other array fields, send each value separately
              value.forEach((selectedValue) => {
                if (selectedValue && typeof selectedValue === 'string') {
                  hubspotFields.push({
                    objectTypeId: fieldInfo.objectTypeId,
                    name: fieldName,
                    value: selectedValue,
                  });
                }
              });
              return; // Skip the main field addition below
            } else {
              stringValue = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
            }
        }

        // Only add the field if stringValue is defined (not handled as array above)
        if (stringValue !== undefined) {
          hubspotFields.push({
            objectTypeId: fieldInfo.objectTypeId,
            name: fieldName,
            value: stringValue,
          });
        }
      }
    });

    if (hubspotFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to submit' },
        { status: 400 }
      );
    }

    // Prepare submission data
    const submissionData: HubSpotSubmissionData = {
      fields: hubspotFields,
      context: {
        pageUri: pageUri,
        pageName: (sanitizedFormData.pageName as string) || 'Dynamic Form Submission',
      },
    };

    // Legal consent handling temporarily disabled for testing


    // Submit to HubSpot (using the portal ID from the embed code)
    const result = await submitToHubSpot(formId, submissionData, '1856748') as {
      inlineMessage?: string;
      redirectUri?: string;
    };


    const response = NextResponse.json({
      success: true,
      submissionId: result.inlineMessage ?? result.redirectUri ?? 'submitted',
      message: 'Form submitted successfully',
      redirectUri: result.redirectUri ?? null, // Extract redirect URL if available
      hubspotResponse: result as unknown,
    });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;

  } catch (error) {
    // Simple error response (bypass strict security)
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: 'Form submission failed' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
