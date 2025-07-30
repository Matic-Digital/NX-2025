import type { TextProps, TextLineHeight } from './types';

/**
 * Text Component Examples:
 *
 * // Basic Usage
 * <Text>Default body text</Text>
 *
 * // Variants and Sizes
 * <Text variant="display" size="lg">Display Large</Text>
 * <Text variant="headline" size="md">Headline Medium</Text>
 * <Text variant="title" size="sm">Title Small</Text>
 * <Text variant="body" size="md">Body Medium</Text>
 * <Text variant="label" size="sm">Label Small</Text>
 *
 * // Semantic Elements
 * <Text as="h1">Heading 1</Text>
 * <Text as="p">Paragraph</Text>
 * <Text as="label">Form Label</Text>
 *
 * // Line Height
 * <Text lineHeight="tight">Tight</Text>
 * <Text lineHeight="normal">Normal</Text>
 * <Text lineHeight="relaxed">Relaxed</Text>
 * <Text lineHeight={1.5}>Custom (1.5)</Text>
 *
 * // Letter Spacing
 * <Text letterSpacing="tighter">Tighter</Text>
 * <Text letterSpacing="normal">Normal</Text>
 * <Text letterSpacing="wide">Wide</Text>
 * <Text letterSpacing="0.1em">Custom (0.1em)</Text>
 *
 * // Inline Styles
 * <Text style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Custom Styles</Text>
 *
 * // Combined Example
 * <Text
 *   as="h2"
 *   variant="headline"
 *   size="lg"
 *   lineHeight="tight"
 *   letterSpacing="tighter"
 *   className="uppercase"
 *   style={{
 *     color: 'var(--color-primary)',
 *     textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
 *   }}
 * >
 *   Section Title
 * </Text>
 */

export const Text = ({
  variant = 'body',
  size = 'md',
  lineHeight = 'normal',
  letterSpacing = 'normal',
  as: Component = 'p',
  className = '',
  style,
  ...props
}: TextProps) => {
  // Handle lineHeight (can be Tailwind class or custom value)
  const lineHeightClass =
    typeof lineHeight === 'number' ? '' : `leading-${lineHeight as TextLineHeight}`;

  // Handle letterSpacing (can be Tailwind class or custom value)
  const letterSpacingClass =
    typeof letterSpacing === 'string' &&
    ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'].includes(letterSpacing)
      ? `tracking-${letterSpacing}`
      : '';

  const baseClasses = [`text-${variant}-${size}`, lineHeightClass, letterSpacingClass, className]
    .filter(Boolean)
    .join(' ')
    .trim();

  // Inline styles for custom values
  const inlineStyles = {
    ...(typeof lineHeight === 'number' && { lineHeight: `${lineHeight}px` }),
    ...(typeof letterSpacing === 'string' &&
      !['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'].includes(letterSpacing) && {
        letterSpacing
      }),
    ...style
  };

  const ComponentElement = Component as React.ElementType;

  return (
    <ComponentElement
      className={baseClasses}
      style={Object.keys(inlineStyles).length > 0 ? inlineStyles : undefined}
      {...props}
    />
  );
};
