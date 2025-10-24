# AirImage LCP Optimization

## Problem Identified

The AirImage component was causing poor LCP (Largest Contentful Paint) performance due to a mismatch between intrinsic dimensions and rendered size:

1. **Intrinsic vs Rendered Size Mismatch**: Images were using fixed fallback dimensions (1208x800) regardless of how they were actually displayed
2. **Incorrect Sizes Attribute**: The `sizes` attribute didn't match actual usage patterns
3. **No Priority Detection**: Priority images weren't being automatically detected for LCP optimization

## Solution Implemented

### 1. Responsive Dimension Calculation

Created `calculateResponsiveDimensions()` function that analyzes CSS classes to determine appropriate intrinsic dimensions:

- **Full Container Images** (`w-full h-full absolute/object-cover`): 1920px width for hero banners
- **Full Width Images** (`w-full`): 1200px width for content images  
- **Standard Images**: Use original or fallback dimensions

### 2. Automatic Priority Detection

Added `shouldBePriority()` function to automatically detect LCP candidates:

- Full-size images with `w-full h-full absolute` (hero banners)
- Images with `hero` or `banner` in className
- Respects explicit `priority` prop when provided

### 3. Context-Aware Sizes Attribute

Updated `generateSizes()` to provide appropriate `sizes` attribute based on usage:

- **Priority Images**: More aggressive sizing (100vw for full-width)
- **Full Container**: `100vw` for viewport-spanning images
- **Full Width**: Responsive breakpoints matching container max-widths
- **Standard**: Conservative sizing for content images

### 4. Improved Skeleton Loading

Enhanced skeleton loading to match final image layout:

- Uses responsive classes for proper aspect ratio
- No fixed container dimensions that could cause layout shift
- Maintains consistent layout during loading

## Key Benefits

### ✅ **LCP Performance**
- Intrinsic dimensions now match rendered size
- Eliminates layout shift during image loading
- Proper `sizes` attribute for optimal resource loading
- `fetchPriority="high"` for priority images
- Priority images render immediately (no skeleton loading)

### ✅ **Automatic Optimization**
- Priority images detected automatically
- No manual configuration required for most use cases
- Responsive dimensions calculated from CSS classes

### ✅ **Better Resource Loading**
- Accurate `sizes` attribute reduces over-fetching
- Priority images load with `eager` loading
- Optimized quality settings for compression

## Usage Examples

### Hero Banner (Auto-Priority)
```tsx
<AirImage
  link="https://air-prod.imgix.net/hero.jpg"
  altText="Hero banner"
  className="w-full h-full absolute inset-0 object-cover"
  // Automatically detected as priority=true
  // Intrinsic dimensions: 1920x1080 (calculated from aspect ratio)
  // Sizes: "100vw"
/>
```

### Content Image (Full Width)
```tsx
<AirImage
  link="https://air-prod.imgix.net/content.jpg"
  altText="Content image"
  className="w-full object-cover"
  // priority=false (default)
  // Intrinsic dimensions: 1200x800 (calculated from aspect ratio)
  // Sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
/>
```

### Standard Image
```tsx
<AirImage
  link="https://air-prod.imgix.net/standard.jpg"
  altText="Standard image"
  className="rounded-lg"
  // Uses original or fallback dimensions
  // Sizes: "(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1200px) 50vw, 600px"
/>
```

## Technical Details

### Dimension Calculation Logic
1. Extract original dimensions from Air imgix URL parameters
2. Analyze CSS classes to determine usage context
3. Calculate appropriate intrinsic dimensions based on context
4. Generate matching `sizes` attribute

### Priority Detection Logic
- `w-full` + `h-full` + (`absolute` OR `object-cover`) = Priority
- `hero` OR `banner` in className = Priority
- Explicit `priority` prop overrides auto-detection

### Image Optimization
- Air imgix URLs: Enhanced with smart cropping and compression
- Contentful images: WebP format with optimized quality
- Responsive srcset generation for multiple screen densities

## Performance Impact

- **Reduced Layout Shift**: Intrinsic dimensions match rendered size
- **Improved LCP**: Priority images load immediately with correct sizing
- **Better Resource Efficiency**: Accurate `sizes` attribute prevents over-fetching
- **Faster Loading**: Optimized compression and format selection

## Migration Notes

This is a **backward-compatible** change:
- Existing `priority` props continue to work
- Existing `width`/`height` props are respected
- Auto-detection only applies when explicit props aren't provided
- All existing usage patterns continue to function

The optimization is **automatic** and requires no code changes to existing AirImage usage.
