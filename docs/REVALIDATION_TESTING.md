# Revalidation Route Testing Guide

This guide explains how to test and verify that your `/api/revalidate` route is working correctly with your server-side rendering setup.

## Overview

The revalidation route (`/api/revalidate`) is responsible for:
- Invalidating Next.js cache when content changes in Contentful
- Supporting both webhook (POST) and manual (GET) revalidation
- Handling different content types with appropriate path invalidation
- Providing security through secret validation

## Prerequisites

1. **Environment Variable**: Ensure `CONTENTFUL_REVALIDATE_SECRET` is set in your environment
2. **Server Running**: Your Next.js application should be running (locally or deployed)
3. **Network Access**: Ability to make HTTP requests to your application

## Testing Methods

### Method 1: Automated Test Script (Node.js)

Run the comprehensive test suite:

```bash
# Using environment variable
node scripts/test-revalidate.js

# With custom URL and secret
node scripts/test-revalidate.js http://localhost:3000 your-secret-here

# For production testing
node scripts/test-revalidate.js https://your-domain.com your-secret-here
```

**What it tests:**
- ✅ GET request (manual revalidation)
- ✅ POST request (Contentful webhook simulation)
- ✅ Different content types (Page, PageList, Post, Product, Header)
- ✅ Security (unauthorized requests)

### Method 2: Shell Script (curl)

Run the curl-based tests:

```bash
# Using environment variable
./scripts/test-revalidate.sh

# With custom parameters
./scripts/test-revalidate.sh http://localhost:3000 your-secret-here
```

### Method 3: Manual Testing

#### Test GET Request
```bash
curl "http://localhost:3000/api/revalidate?secret=your-secret&path=/"
```

**Expected Response:**
```json
{
  "revalidated": true,
  "path": "/",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### Test POST Request (Contentful Webhook)
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret" \
  -d '{
    "sys": {
      "id": "test-entry-id",
      "type": "Entry",
      "contentType": {
        "sys": {
          "id": "Page"
        }
      }
    },
    "fields": {
      "slug": {
        "en-US": "test-page"
      }
    }
  }' \
  http://localhost:3000/api/revalidate
```

**Expected Response:**
```json
{
  "revalidated": true,
  "paths": ["/test-page", "/[...segments]"],
  "tags": ["contentType:Page", "entry:test-entry-id"],
  "contentType": "Page",
  "slug": "test-page",
  "action": "publish",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Content Type Revalidation Mapping

| Content Type | Revalidated Paths | Notes |
|--------------|-------------------|-------|
| `Page` | `/{slug}`, `/[...segments]` | Direct page and catch-all |
| `PageList` | `/{slug}`, `/[...segments]` | PageList and nested content |
| `Product` | `/{slug}`, `/[...segments]` | Can be nested under PageLists |
| `Service` | `/{slug}`, `/[...segments]` | Can be nested under PageLists |
| `Solution` | `/{slug}`, `/[...segments]` | Can be nested under PageLists |
| `Post` | `/post/[category]/{slug}`, `/[...segments]` | Blog post structure |
| `Header` | `/`, `/[...segments]` | Global component |
| `Footer` | `/`, `/[...segments]` | Global component |
| Others | `/[...segments]` | Component updates |

## Cache Tags

The revalidation system uses these cache tags:

- `contentType:{contentType}` - All entries of a specific content type
- `entry:{entryId}` - Specific entry by ID
- `global-layout` - For Header, Footer, PageLayout changes

## Verification Steps

### 1. Check Server Logs

When revalidation occurs, you should see logs like:
```
🔄 Revalidation request received: { contentType: 'Page', entryId: 'abc123', action: 'Entry' }
✅ Revalidated path: /about
✅ Revalidated tag: contentType:Page
✅ Revalidated tag: entry:abc123
🎉 Revalidation completed: { revalidated: true, paths: ['/about'], ... }
```

### 2. Test Cache Invalidation

1. **Visit a page** to cache it
2. **Update content** in Contentful
3. **Trigger revalidation** (webhook or manual)
4. **Revisit the page** - should show updated content

### 3. Monitor Network Requests

Use browser dev tools to verify:
- Initial page load shows cached content
- After revalidation, page shows fresh content
- No unnecessary re-renders or data fetching

## Troubleshooting

### Common Issues

#### 401 Unauthorized
- **Cause**: Missing or incorrect `CONTENTFUL_REVALIDATE_SECRET`
- **Solution**: Verify environment variable is set correctly

#### 400 Bad Request
- **Cause**: Missing `Content-Type: application/json` header
- **Solution**: Ensure proper headers in POST requests

#### 500 Internal Server Error
- **Cause**: Error in revalidation logic or missing environment setup
- **Solution**: Check server logs for detailed error messages

#### No Cache Invalidation
- **Cause**: Paths or tags not matching actual cached content
- **Solution**: Verify path mapping in `getPathsToRevalidate` function

### Debug Mode

Add debug logging to see what's being revalidated:

```javascript
// In your revalidate route
console.log('Revalidating paths:', pathsToRevalidate);
console.log('Revalidating tags:', tagsToRevalidate);
```

## Contentful Webhook Setup

To set up automatic revalidation via Contentful webhooks:

1. **Go to Contentful Settings** → Webhooks
2. **Create new webhook** with:
   - **URL**: `https://your-domain.com/api/revalidate`
   - **Method**: POST
   - **Headers**: `Authorization: Bearer your-secret`
   - **Content Type**: application/json
3. **Select triggers**: Entry publish, unpublish, delete
4. **Test webhook** using Contentful's test feature

## Performance Considerations

- **Selective Revalidation**: Only revalidate affected paths, not entire site
- **Tag-based Invalidation**: Use cache tags for efficient bulk invalidation
- **Rate Limiting**: Consider implementing rate limiting for webhook endpoints
- **Monitoring**: Track revalidation frequency and performance impact

## Security Best Practices

- **Strong Secret**: Use a cryptographically strong revalidation secret
- **HTTPS Only**: Always use HTTPS in production
- **IP Allowlisting**: Consider restricting webhook IPs to Contentful's ranges
- **Request Validation**: Validate webhook payload structure
- **Logging**: Log all revalidation attempts for security monitoring

## Next Steps

After verifying revalidation works:

1. **Set up Contentful webhooks** for automatic revalidation
2. **Monitor performance** impact of revalidation
3. **Implement cache tags** in your data fetching functions
4. **Add monitoring/alerting** for failed revalidations
5. **Document content editor workflow** for manual revalidation
