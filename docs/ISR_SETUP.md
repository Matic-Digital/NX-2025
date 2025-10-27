# Incremental Static Regeneration (ISR) Setup Guide

This guide walks you through setting up ISR for your Next.js + Contentful site to avoid full rebuilds while keeping content fresh.

## Overview

Your site now supports:
- **Time-based revalidation**: Pages automatically refresh every hour (configurable)
- **On-demand revalidation**: Instant updates when content changes in Contentful
- **Cache tags**: Granular cache invalidation for related content

## 1. Environment Variables

Add the following to your environment variables (already in `.env.example`):

```bash
# Required for webhook authentication
CONTENTFUL_REVALIDATE_SECRET="your-secure-revalidation-secret"
```

**In Vercel Dashboard:**
1. Go to your project settings
2. Navigate to Environment Variables
3. Add `CONTENTFUL_REVALIDATE_SECRET` with a secure random string
4. Make sure it's available in all environments (Development, Preview, Production)

## 2. Contentful Webhook Setup

### Step 1: Create Webhook in Contentful

1. Go to your Contentful space
2. Navigate to **Settings** → **Webhooks**
3. Click **Add Webhook**

### Step 2: Configure Webhook

**Basic Settings:**
- **Name**: `Next.js ISR Revalidation`
- **URL**: `https://your-domain.vercel.app/api/revalidate`
- **Method**: `POST`

**Headers:**
Add a custom header for authentication:
- **Key**: `Authorization`
- **Value**: `Bearer your-secure-revalidation-secret`

**Triggers:**
Select the following events:
- ✅ Entry publish
- ✅ Entry unpublish
- ✅ Entry delete
- ✅ Asset publish
- ✅ Asset unpublish
- ✅ Asset delete

**Content Types:**
Select all content types you want to trigger revalidation:
- ✅ Page
- ✅ PageList
- ✅ Product
- ✅ Service
- ✅ Solution
- ✅ Post
- ✅ Header
- ✅ Footer
- ✅ All component types (BannerHero, CtaBanner, etc.)

### Step 3: Test Webhook

1. Save the webhook configuration
2. Publish or update any content in Contentful
3. Check the webhook logs in Contentful to ensure it's firing
4. Check your Vercel function logs to see revalidation activity

## 3. How It Works

### Time-Based Revalidation
- Pages are cached for 1 hour by default
- Different content types have different cache durations:
  - **Layout components** (Header, Footer): 24 hours
  - **Pages & PageLists**: 1 hour
  - **Products, Services, Solutions**: 30 minutes
  - **Blog posts**: 15 minutes

### On-Demand Revalidation
When content changes in Contentful:

1. **Webhook fires** → Your `/api/revalidate` endpoint
2. **Path resolution** → Determines which pages need updating
3. **Cache invalidation** → Clears specific cached pages
4. **Background regeneration** → Next.js rebuilds affected pages

### Cache Tags
Content is tagged for granular invalidation:
- `contentType:Page` - All pages
- `entry:abc123` - Specific entry
- `slug:about-us` - Specific slug
- `global-layout` - Header/footer changes

## 4. Manual Testing

### Test Revalidation Endpoint
```bash
# Test with GET request
curl "https://your-domain.vercel.app/api/revalidate?secret=your-secret&path=/about"

# Test with POST request (simulating Contentful webhook)
curl -X POST "https://your-domain.vercel.app/api/revalidate" \
  -H "Authorization: Bearer your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "sys": {
      "id": "entry-id",
      "type": "Entry",
      "contentType": {
        "sys": {
          "id": "page"
        }
      }
    },
    "fields": {
      "slug": {
        "en-US": "about-us"
      }
    }
  }'
```

### Expected Response
```json
{
  "revalidated": true,
  "paths": ["/about-us", "/[...segments]"],
  "tags": ["contentType:page", "entry:entry-id"],
  "contentType": "page",
  "slug": "about-us",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 5. Monitoring

### Vercel Function Logs
Monitor revalidation activity in your Vercel dashboard:
1. Go to your project
2. Navigate to **Functions** tab
3. Click on `/api/revalidate`
4. View logs to see webhook activity

### Contentful Webhook Logs
Check webhook delivery status in Contentful:
1. Go to **Settings** → **Webhooks**
2. Click on your webhook
3. View **Activity** tab for delivery logs

## 6. Troubleshooting

### Common Issues

**Webhook not firing:**
- Check webhook URL is correct
- Verify content type filters
- Ensure triggers are selected

**Authentication errors:**
- Verify `CONTENTFUL_REVALIDATE_SECRET` matches webhook header
- Check environment variable is deployed to Vercel

**Pages not updating:**
- Check function logs for errors
- Verify path resolution logic
- Test manual revalidation

**Performance issues:**
- Monitor function execution time
- Consider adjusting revalidation frequency
- Use cache tags for targeted invalidation

### Debug Mode
Add `?debug=true` to your revalidation URL for verbose logging:
```
https://your-domain.vercel.app/api/revalidate?secret=your-secret&debug=true
```

## 7. Benefits

✅ **No full rebuilds** - Only affected pages regenerate
✅ **Instant updates** - Content changes reflect immediately
✅ **Better performance** - Cached pages serve instantly
✅ **Cost effective** - Reduced build minutes on Vercel
✅ **SEO friendly** - Static pages with fresh content
✅ **Scalable** - Handles high traffic with cached responses

## 8. Next Steps

Consider these enhancements:
- **Preview mode integration** - ISR + live preview
- **Edge caching** - CDN-level caching with Vercel Edge
- **Analytics** - Track revalidation patterns
- **A/B testing** - ISR with feature flags
