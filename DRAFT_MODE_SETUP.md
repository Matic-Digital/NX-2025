# Draft Mode Setup for Contentful Live Preview

This document explains how draft mode is configured in your Next.js application to work with Contentful Live Preview.

## Current Setup

Your application already has a comprehensive draft mode setup that allows you to preview unpublished content from Contentful without having to publish everything.

### Key Components

#### 1. Preview API Route (`/src/app/api/preview/route.ts`)
- Validates the preview secret
- Enables draft mode using `draftMode().enable()`
- Redirects to the appropriate preview page based on content type

#### 2. Enable Draft API Route (`/src/app/api/enable-draft/[contentType]/route.ts`)
- More flexible endpoint for enabling draft mode for specific content types
- Fetches content to validate it exists before enabling preview
- Handles preview bypass cookies for better caching

#### 3. Exit Preview API Route (`/src/app/api/exit-preview/route.ts`)
- Disables draft mode using `draftMode().disable()`
- Redirects back to the specified page

#### 4. Universal Preview Page (`/src/app/preview/[contentType]/page.tsx`)
- Renders any component in preview mode
- Uses ContentfulLivePreviewProvider for real-time updates
- Supports both regular components and dedicated Preview components

### How Draft Mode Works

1. **Content Fetching**: When `preview=true` is passed to API functions:
   - Uses `NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN` instead of the regular token
   - Sets cache to `no-store` to ensure fresh content
   - Fetches from Contentful's Preview API which includes unpublished content

2. **Draft Mode Cookie**: When enabled, Next.js sets a `__prerender_bypass` cookie that:
   - Bypasses static generation for that user session
   - Ensures all pages are rendered server-side with fresh data
   - Automatically includes preview content in API calls

## Required Environment Variables

Make sure these are set in your `.env.local` file:

```bash
# Contentful Configuration
NEXT_PUBLIC_CONTENTFUL_SPACE_ID="your-space-id"
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN="your-delivery-token"
NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN="your-preview-token"
NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT="staging"
CONTENTFUL_PREVIEW_SECRET="your-secret-key"
```

## How to Use Draft Mode

### Option 1: Direct Preview URLs
Access preview directly via the API route:
```
/api/preview?secret=YOUR_SECRET&sectionHeadingId=ENTRY_ID
```

### Option 2: Enable Draft for Content Type
Use the more flexible enable-draft endpoint:
```
/api/enable-draft/section-heading?secret=YOUR_SECRET&id=ENTRY_ID
```

### Option 3: Contentful Web App Integration
Configure Contentful's web app to use your preview URLs:
1. Go to Settings > Content preview
2. Add preview URL: `https://yoursite.com/api/preview?secret=YOUR_SECRET&{contentType}Id={entry.sys.id}`

## Preview Component System

### Regular Components vs Preview Components

- **Regular Components**: Display the component as it would appear on the live site
- **Preview Components**: Include additional context, documentation, and usage examples

Example structure:
```
/components/SectionHeading/
├── SectionHeading.tsx          # Main component
├── SectionHeadingPreview.tsx   # Preview wrapper with docs
├── SectionHeadingApi.ts        # API functions
└── SectionHeadingSchema.ts     # Type definitions
```

### Creating Preview Components

Each Preview component should:
1. Import and render the main component
2. Provide context about what the component does
3. Show usage examples and documentation
4. Use a clean, informative layout

## Troubleshooting

### Common Issues

1. **"Invalid token" error**: Check that `CONTENTFUL_PREVIEW_SECRET` matches between Contentful and your app

2. **Content not updating**: Ensure draft mode is enabled and you're using the preview token

3. **Cache issues**: Preview mode automatically sets `cache: 'no-store'` but you may need to clear browser cache

4. **Environment errors**: Make sure `NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT` is set to "staging"

### Debugging Draft Mode

Check if draft mode is active:
```tsx
import { draftMode } from 'next/headers';

export default async function Page() {
  const { isEnabled } = await draftMode();
  
  return (
    <div>
      Draft mode: {isEnabled ? 'Enabled' : 'Disabled'}
    </div>
  );
}
```

### Exit Preview Mode

To exit preview mode, visit:
```
/api/exit-preview?slug=/path-to-redirect-to
```

## Benefits of This Setup

1. **No Publishing Required**: See changes immediately without publishing
2. **Real-time Updates**: Content updates live as you edit in Contentful
3. **Flexible Preview**: Each component can have its own preview experience
4. **Documentation**: Preview components serve as living documentation
5. **Safe Testing**: Preview mode only affects your session, not live users
