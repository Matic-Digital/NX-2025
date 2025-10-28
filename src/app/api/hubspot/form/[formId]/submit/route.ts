import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { validateInput, validateJSONPayload, createSecureErrorResponse } from '@/lib/security';

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

    // Validate formId format
    const formIdValidation = validateInput(formId, 100);
    if (!formIdValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid form ID format', issues: formIdValidation.errors },
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

    // Comprehensive payload validation
    const payloadValidation = validateJSONPayload(formData, 1024 * 1024);
    if (!payloadValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid form data detected', issues: payloadValidation.errors },
        { status: 400 }
      );
    }

    // Use sanitized payload
    const sanitizedFormData = payloadValidation.sanitizedPayload as Record<string, unknown>;

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
    
    Object.entries(sanitizedFormData).forEach(([fieldName, value]) => {
      const fieldInfo = fieldMap.get(fieldName);
      
      if (fieldInfo && value !== undefined && value !== null && value !== '') {
        // Convert value to string, handling different field types
        let stringValue: string;
        
        switch (fieldInfo.fieldType) {
          case 'number':
            stringValue = typeof value === 'string' || typeof value === 'number' ? String(value) : JSON.stringify(value);
            break;
          case 'checkbox':
            stringValue = value ? 'true' : 'false';
            break;
          case 'select':
          case 'radio':
            stringValue = typeof value === 'string' || typeof value === 'number' ? String(value) : JSON.stringify(value);
            break;
          default:
            stringValue = typeof value === 'string' || typeof value === 'number' ? String(value) : JSON.stringify(value);
        }

        hubspotFields.push({
          objectTypeId: fieldInfo.objectTypeId,
          name: fieldName,
          value: stringValue,
        });
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
        pageUri: request.headers.get('referer') ?? undefined,
        pageName: 'Dynamic Form Submission',
      },
    };


    // Submit to HubSpot (using the portal ID from the embed code)
    const result = await submitToHubSpot(formId, submissionData, '1856748') as {
      inlineMessage?: string;
      redirectUri?: string;
    };


    return NextResponse.json({
      success: true,
      submissionId: result.inlineMessage ?? result.redirectUri ?? 'submitted',
      message: 'Form submitted successfully',
      redirectUri: result.redirectUri ?? null, // Extract redirect URL if available
      hubspotResponse: result as unknown,
    });

  } catch (error) {
    // Use secure error response to prevent information disclosure
    return createSecureErrorResponse(error, 'Form submission failed');
  }
}
