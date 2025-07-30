import React, { forwardRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Sheet,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';

// Mock the Radix UI Dialog components
vi.mock('@radix-ui/react-dialog', () => {
  return {
    Root: forwardRef(({ children, ...props }: any, ref: any) => (
      <div data-testid="sheet-root" {...props} ref={ref}>
        {children}
      </div>
    )),
    Trigger: forwardRef(({ children, ...props }: any, ref: any) => (
      <button data-testid="sheet-trigger" {...props} ref={ref}>
        {children}
      </button>
    )),
    Portal: ({ children, ...props }: any) => (
      <div data-testid="sheet-portal" {...props}>
        {children}
      </div>
    ),
    Overlay: forwardRef(({ children, className, ...props }: any, ref: any) => (
      <div data-testid="sheet-overlay" className={className} {...props} ref={ref}>
        {children}
      </div>
    )),
    Content: forwardRef(({ children, className, ...props }: any, ref: any) => (
      <div data-testid="sheet-content" className={className} {...props} ref={ref}>
        {children}
      </div>
    )),
    Close: forwardRef(({ children, className, ...props }: any, ref: any) => (
      <button data-testid="sheet-close" className={className} {...props} ref={ref}>
        {children}
      </button>
    )),
    Title: forwardRef(({ children, className, ...props }: any, ref: any) => (
      <h2 data-testid="sheet-title" className={className} {...props} ref={ref}>
        {children}
      </h2>
    )),
    Description: forwardRef(({ children, className, ...props }: any, ref: any) => (
      <p data-testid="sheet-description" className={className} {...props} ref={ref}>
        {children}
      </p>
    ))
  };
});

// Mock the Lucide React icon
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>
}));

describe('Sheet components', () => {
  it('renders basic sheet correctly', () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
          <div>Sheet Content</div>
          <SheetFooter>
            <SheetClose data-testid="footer-close-button">Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByTestId('sheet-root')).toBeInTheDocument();
    expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument();
    expect(screen.getByText('Open Sheet')).toBeInTheDocument();
    expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
    expect(screen.getByTestId('sheet-title')).toBeInTheDocument();
    expect(screen.getByText('Sheet Title')).toBeInTheDocument();
    expect(screen.getByTestId('sheet-description')).toBeInTheDocument();
    expect(screen.getByText('Sheet Description')).toBeInTheDocument();
    expect(screen.getByText('Sheet Content')).toBeInTheDocument();
    // There are two close buttons - the X in the corner and the one in the footer
    expect(screen.getAllByTestId('sheet-close')).toHaveLength(1);
    expect(screen.getByTestId('footer-close-button')).toBeInTheDocument();
    expect(screen.getAllByText('Close')).toHaveLength(2); // One in the X button's sr-only span and one in the footer button
  });

  it('renders sheet with different side variants', () => {
    const { rerender } = render(
      <SheetContent side="right" data-testid="right-sheet">
        Content
      </SheetContent>
    );

    expect(screen.getByTestId('right-sheet').className).toContain('right-0');

    rerender(
      <SheetContent side="left" data-testid="left-sheet">
        Content
      </SheetContent>
    );

    expect(screen.getByTestId('left-sheet').className).toContain('left-0');

    rerender(
      <SheetContent side="top" data-testid="top-sheet">
        Content
      </SheetContent>
    );

    expect(screen.getByTestId('top-sheet').className).toContain('top-0');

    rerender(
      <SheetContent side="bottom" data-testid="bottom-sheet">
        Content
      </SheetContent>
    );

    expect(screen.getByTestId('bottom-sheet').className).toContain('bottom-0');
  });

  it('renders SheetOverlay correctly', () => {
    render(<SheetOverlay data-testid="custom-overlay" />);

    const overlay = screen.getByTestId('custom-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay.className).toContain('fixed inset-0');
  });

  it('renders SheetHeader with correct classes', () => {
    render(<SheetHeader data-testid="sheet-header">Header Content</SheetHeader>);

    const header = screen.getByTestId('sheet-header');
    expect(header).toBeInTheDocument();
    expect(header.className).toContain('flex flex-col space-y-2');
    expect(header.textContent).toBe('Header Content');
  });

  it('renders SheetFooter with correct classes', () => {
    render(<SheetFooter data-testid="sheet-footer">Footer Content</SheetFooter>);

    const footer = screen.getByTestId('sheet-footer');
    expect(footer).toBeInTheDocument();
    expect(footer.className).toContain('flex flex-col-reverse');
    expect(footer.textContent).toBe('Footer Content');
  });

  it('renders SheetTitle with correct classes', () => {
    render(<SheetTitle data-testid="custom-title">Custom Title</SheetTitle>);

    const title = screen.getByTestId('custom-title');
    expect(title).toBeInTheDocument();
    expect(title.className).toContain('text-lg font-semibold');
    expect(title.textContent).toBe('Custom Title');
  });

  it('renders SheetDescription with correct classes', () => {
    render(
      <SheetDescription data-testid="custom-description">Custom Description</SheetDescription>
    );

    const description = screen.getByTestId('custom-description');
    expect(description).toBeInTheDocument();
    expect(description.className).toContain('text-muted-foreground text-sm');
    expect(description.textContent).toBe('Custom Description');
  });

  it('renders SheetContent with close button', () => {
    render(<SheetContent>Content</SheetContent>);

    // The X button is automatically added by the SheetContent component
    expect(screen.getAllByTestId('sheet-close')).toHaveLength(1);
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    expect(screen.getByText('Close', { selector: 'span.sr-only' })).toBeInTheDocument();
  });

  it('renders SheetContent with custom className', () => {
    render(
      <SheetContent className="custom-class" data-testid="custom-content">
        Content
      </SheetContent>
    );

    const content = screen.getByTestId('custom-content');
    expect(content).toBeInTheDocument();
    expect(content.className).toContain('custom-class');
  });
});
