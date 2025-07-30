import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from '@/components/ui/button';

// Mock Radix UI Slot component
vi.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: any) => (
    <div data-testid="slot-component" {...props}>
      {children}
    </div>
  )
}));

describe('Button component', () => {
  it('renders correctly with default props', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    const button = getByRole('button', { name: /click me/i });

    expect(button).toBeDefined();
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders with different variants', () => {
    const { getByText } = render(
      <div>
        <Button variant="default" data-testid="default-button">
          Default
        </Button>
        <Button variant="destructive" data-testid="destructive-button">
          Destructive
        </Button>
        <Button variant="outline" data-testid="outline-button">
          Outline
        </Button>
        <Button variant="secondary" data-testid="secondary-button">
          Secondary
        </Button>
        <Button variant="ghost" data-testid="ghost-button">
          Ghost
        </Button>
        <Button variant="link" data-testid="link-button">
          Link
        </Button>
      </div>
    );

    const defaultButton = getByText('Default').closest('button');
    const destructiveButton = getByText('Destructive').closest('button');
    const outlineButton = getByText('Outline').closest('button');
    const secondaryButton = getByText('Secondary').closest('button');
    const ghostButton = getByText('Ghost').closest('button');
    const linkButton = getByText('Link').closest('button');

    expect(defaultButton?.className).toContain('bg-primary');
    expect(destructiveButton?.className).toContain('bg-destructive');
    expect(outlineButton?.className).toContain('border-input');
    expect(secondaryButton?.className).toContain('bg-secondary');
    expect(ghostButton?.className).toContain('hover:bg-accent');
    expect(linkButton?.className).toContain('text-primary');
  });

  it('renders with different sizes', () => {
    const { getByText } = render(
      <div>
        <Button size="default" data-testid="default-button">
          Default
        </Button>
        <Button size="sm" data-testid="sm-button">
          Small
        </Button>
        <Button size="lg" data-testid="lg-button">
          Large
        </Button>
        <Button size="xl" data-testid="xl-button">
          Extra Large
        </Button>
        <Button size="icon" data-testid="icon-button">
          Icon
        </Button>
      </div>
    );

    const defaultButton = getByText('Default').closest('button');
    const smButton = getByText('Small').closest('button');
    const lgButton = getByText('Large').closest('button');
    const xlButton = getByText('Extra Large').closest('button');
    const iconButton = getByText('Icon').closest('button');

    expect(defaultButton?.className).toContain('px-7 py-3');
    expect(smButton?.className).toContain('px-3 py-3 text-xs');
    expect(lgButton?.className).toContain('px-8 py-3');
    expect(xlButton?.className).toContain('px-8 py-3');
    expect(iconButton?.className).toContain('size-9');
  });

  it('renders as a child component when asChild is true', () => {
    const { getByTestId } = render(<Button asChild>Slot Content</Button>);
    const slotComponent = getByTestId('slot-component');

    expect(slotComponent).toBeDefined();
    expect(slotComponent.textContent).toBe('Slot Content');
  });

  it('applies custom className correctly', () => {
    const { getByRole } = render(<Button className="custom-class">Custom</Button>);
    const button = getByRole('button');

    expect(button.className).toContain('custom-class');
  });
});
