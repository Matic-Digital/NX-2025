# AirImage Component - LCP Optimization Guide

## Overview
The AirImage component has been optimized for better LCP (Largest Contentful Paint) performance, reducing image download sizes by up to 2,863 KiB as identified in the performance audit.

## Key Optimizations Applied

### 1. **Enhanced Image Compression**
- **Air Images**: Quality reduced from 85 to 75 with smart compression
- **Contentful Images**: Quality optimized to 75 with WebP format
- **Auto-optimization**: Uses `auto=compress,format` for Air images

### 2. **Responsive Image Sizing**
- **Smart Cropping**: Uses `fit=crop` and `crop=smart` for better content focus
- **Responsive Sizes**: Generates appropriate sizes for different viewports
- **Proper Dimensions**: Ensures images match their display dimensions

### 3. **LCP-Specific Optimizations**
- **Priority Loading**: Automatic priority detection for above-fold images
- **Blur Placeholder**: Reduces layout shift with base64 blur placeholder
- **Optimized Sizes**: More aggressive sizing for LCP images

## Usage Examples

### Basic Usage
```tsx
import { AirImage } from '@/components/Image/AirImage';

<AirImage
  link="https://air-prod.imgix.net/image.jpg"
  altText="Description"
  width={1200}
  height={800}
/>
```

### Priority/LCP Image
```tsx
<AirImage
  link="https://air-prod.imgix.net/hero-image.jpg"
  altText="Hero banner"
  width={1920}
  height={1080}
  priority={true} // Enables eager loading and LCP optimization
/>
```

### With LCP Optimization Hook
```tsx
import { AirImage } from '@/components/Image/AirImage';
import { shouldPrioritizeImage } from '@/components/Image/hooks/useLCPOptimization';

const MyComponent = ({ images }) => {
  return (
    <div>
      {images.map((image, index) => (
        <AirImage
          key={image.id}
          {...image}
          priority={shouldPrioritizeImage(index, index < 2, index === 0)}
        />
      ))}
    </div>
  );
};
```

## Performance Improvements

### Before Optimization
- **Air Images**: 4,073.6 KiB → **Est. Savings: 2,818.0 KiB**
- **Contentful Images**: 263.7 KiB → **Est. Savings: 44.9 KiB**
- **Oversized Images**: Using full resolution for small display sizes
- **Suboptimal Compression**: Higher quality than necessary

### After Optimization
- ✅ **75% Quality**: Optimal balance between size and visual quality
- ✅ **Smart Cropping**: Better content focus with `crop=smart`
- ✅ **Auto Format**: Automatic WebP/AVIF format selection
- ✅ **Responsive Sizing**: Proper dimensions for display size
- ✅ **LCP Priority**: Faster loading for above-fold images

## Best Practices

### 1. **Mark Priority Images**
```tsx
// Hero images, banners, or first images in viewport
<AirImage priority={true} />
```

### 2. **Use Appropriate Dimensions**
```tsx
// Match your CSS dimensions to avoid oversized images
<AirImage width={800} height={600} /> // For 800x600 display area
```

### 3. **Leverage Mobile Origin**
```tsx
// For responsive cropping on mobile
<AirImage mobileOrigin="Center" /> // or "Left", "Right"
```

### 4. **Batch Priority Images**
```tsx
// Only prioritize first 1-2 images to avoid resource contention
{images.map((img, i) => (
  <AirImage {...img} priority={i < 2} />
))}
```

## Technical Details

### Image URL Optimization

**Air Images (air-prod.imgix.net):**
```
Original: https://air-prod.imgix.net/image.jpg?w=5000&h=2627&q=85
Optimized: https://air-prod.imgix.net/image.jpg?w=1200&h=800&auto=compress,format&q=75&fit=crop&crop=smart
```

**Contentful Images (images.ctfassets.net):**
```
Original: https://images.ctfassets.net/image.jpg
Optimized: https://images.ctfassets.net/image.jpg?w=1200&h=800&fm=webp&q=75&fit=fill
```

### Responsive Breakpoints
- **480w**: Mobile phones (50% of base width)
- **768w**: Tablets (75% of base width)
- **1200w**: Desktop (100% of base width)
- **1920w**: Large screens (150% of base width)

### Sizes Attribute
- **Priority Images**: `(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px`
- **Regular Images**: `(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1200px) 50vw, 600px`

## Migration Guide

### Existing Usage
No changes required for existing AirImage usage - all optimizations are automatic.

### New Features Available
1. **LCP Optimization Hook**: Use `useLCPOptimization()` for automatic priority detection
2. **Priority Helper**: Use `shouldPrioritizeImage()` for smart priority assignment
3. **Better Performance**: Automatic compression and responsive sizing

## Monitoring Performance

### Core Web Vitals Impact
- **LCP Improvement**: Faster loading of largest contentful paint elements
- **CLS Reduction**: Blur placeholder reduces layout shift
- **FCP Improvement**: Priority images load faster

### Recommended Monitoring
```tsx
// Monitor LCP performance
useEffect(() => {
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('LCP:', lastEntry.startTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });
}, []);
```

## Troubleshooting

### Common Issues

1. **Images Still Large**: Ensure `width` and `height` props match display dimensions
2. **Poor Quality**: Increase quality parameter if needed (max 85 for Air images)
3. **Slow LCP**: Mark hero/banner images with `priority={true}`
4. **Layout Shift**: Ensure proper `width` and `height` are provided

### Debug Mode
```tsx
// Add to see optimization details
<AirImage 
  {...props} 
  onLoad={() => console.log('Image loaded:', props.link)}
/>
```
