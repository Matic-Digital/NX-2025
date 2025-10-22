import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

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

  console.log(`Attempting HubSpot submission with Portal ID: ${portalId}, Form ID: ${formId}`);

  // Use the correct HubSpot Forms API endpoint with portal ID
  const response = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(submissionData),
  });

  console.log(`HubSpot API Response Status: ${response.status} ${response.statusText}`);

  // If the integration endpoint fails, try the legacy forms API with authentication
  if (!response.ok && response.status === 404) {
    console.log('Integration API failed, trying legacy forms API with authentication...');
    
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

    console.log(`Legacy API Response Status: ${legacyResponse.status} ${legacyResponse.statusText}`);
    
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
    
    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    const formData = await request.json() as Record<string, unknown>;
    
    if (!formData || typeof formData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    // First, get the form structure to understand field types and object IDs
    const formStructureResponse = await fetch(`${request.nextUrl.origin}/api/hubspot/form/${formId}`, {
      headers: {
        'Authorization': request.headers.get('Authorization') ?? '',
      },
    });

    if (!formStructureResponse.ok) {
      throw new Error('Failed to fetch form structure');
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
    
    Object.entries(formData).forEach(([fieldName, value]) => {
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

    console.log('Submitting to HubSpot:', {
      formId,
      fieldCount: hubspotFields.length,
      fields: hubspotFields.map(f => ({ name: f.name, value: f.value })),
      submissionData
    });

    // Submit to HubSpot (using the portal ID from the embed code)
    const result = await submitToHubSpot(formId, submissionData, '1856748') as {
      inlineMessage?: string;
      redirectUri?: string;
    };

    console.log('HubSpot submission successful:', result);
    console.log('HubSpot redirect URI:', result.redirectUri);
    console.log('HubSpot inline message:', result.inlineMessage);

    return NextResponse.json({
      success: true,
      submissionId: result.inlineMessage ?? result.redirectUri ?? 'submitted',
      message: 'Form submitted successfully',
      redirectUri: result.redirectUri ?? null, // Extract redirect URL if available
      hubspotResponse: result as unknown,
    });

  } catch (error) {
    console.error('Error submitting form to HubSpot:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: error.message,
          success: false 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        success: false 
      },
      { status: 500 }
    );
  }
}
