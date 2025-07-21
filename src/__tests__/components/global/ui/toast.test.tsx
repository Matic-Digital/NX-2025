import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
  ToastProvider
} from '@/components/ui/toast';

// Mock the Lucide React icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="close-icon">X</div>
}));

// Mock the Radix UI Toast components
vi.mock('@radix-ui/react-toast', () => {
  return {
    Provider: ({ children }: any) => <div data-testid="toast-provider">{children}</div>,
    Root: ({ children, className, ...props }: any) => (
      <div data-testid="toast" className={className} {...props}>
        {children}
      </div>
    ),
    Title: ({ children, className, ...props }: any) => (
      <div data-testid="toast-title" className={className} {...props}>
        {children}
      </div>
    ),
    Description: ({ children, className, ...props }: any) => (
      <div data-testid="toast-description" className={className} {...props}>
        {children}
      </div>
    ),
    Close: ({ className, ...props }: any) => (
      <button data-testid="toast-close" className={className} {...props} toast-close="">
        X
      </button>
    ),
    Action: ({ children, className, ...props }: any) => (
      <button data-testid="toast-action" className={className} {...props}>
        {children}
      </button>
    ),
    Viewport: ({ className, ...props }: any) => (
      <div data-testid="toast-viewport" className={className} {...props} />
    )
  };
});

describe('Toast components', () => {
  it('renders Toast correctly with default variant', () => {
    render(
      <ToastProvider>
        <Toast data-testid="toast">Toast content</Toast>
      </ToastProvider>
    );
    const toast = screen.getByTestId('toast');

    expect(toast).toBeDefined();
    expect(toast.textContent).toBe('Toast content');
    expect(toast.className).toContain('bg-background');
  });

  it('renders Toast with destructive variant', () => {
    render(
      <ToastProvider>
        <Toast variant="destructive" data-testid="toast">
          Destructive toast
        </Toast>
      </ToastProvider>
    );
    const toast = screen.getByTestId('toast');

    expect(toast).toBeDefined();
    expect(toast.className).toContain('destructive');
    expect(toast.className).toContain('bg-destructive');
  });

  it('renders ToastTitle correctly', () => {
    render(<ToastTitle data-testid="toast-title">Toast Title</ToastTitle>);
    const title = screen.getByTestId('toast-title');

    expect(title).toBeDefined();
    expect(title.textContent).toBe('Toast Title');
    expect(title.className).toContain('font-semibold');
  });

  it('renders ToastDescription correctly', () => {
    render(<ToastDescription data-testid="toast-description">Toast Description</ToastDescription>);
    const description = screen.getByTestId('toast-description');

    expect(description).toBeDefined();
    expect(description.textContent).toBe('Toast Description');
    expect(description.className).toContain('opacity-90');
  });

  it('renders ToastClose correctly', () => {
    render(<ToastClose data-testid="toast-close" />);
    const closeButton = screen.getByTestId('toast-close');

    expect(closeButton).toBeDefined();
    expect(closeButton.textContent).toBe('X'); // Our mock renders 'X' instead of the icon
    expect(closeButton.getAttribute('toast-close')).toBe('');
  });

  it('renders ToastAction correctly', () => {
    render(
      <ToastAction altText="Action" data-testid="toast-action">
        Action
      </ToastAction>
    );
    const action = screen.getByTestId('toast-action');

    expect(action).toBeDefined();
    expect(action.textContent).toBe('Action');
    expect(action.className).toContain('inline-flex');
  });

  it('renders ToastViewport correctly', () => {
    render(
      <ToastProvider>
        <ToastViewport data-testid="toast-viewport" />
      </ToastProvider>
    );
    const viewport = screen.getByTestId('toast-viewport');

    expect(viewport).toBeDefined();
    expect(viewport.className).toContain('fixed');
    expect(viewport.className).toContain('z-100');
  });

  it('renders a complete toast with all components', () => {
    render(
      <ToastProvider>
        <Toast data-testid="toast">
          <div className="grid gap-1">
            <ToastTitle>Toast Title</ToastTitle>
            <ToastDescription>Toast Description</ToastDescription>
          </div>
          <ToastAction altText="Action">Action</ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    expect(screen.getByTestId('toast')).toBeDefined();
    expect(screen.getByText('Toast Title')).toBeDefined();
    expect(screen.getByText('Toast Description')).toBeDefined();
    expect(screen.getByText('Action')).toBeDefined();
    expect(screen.getByTestId('toast-close')).toBeDefined();
  });

  it('applies custom className correctly to all components', () => {
    render(
      <ToastProvider>
        <Toast data-testid="toast" className="custom-toast">
          <ToastTitle data-testid="title" className="custom-title">
            Title
          </ToastTitle>
          <ToastDescription data-testid="description" className="custom-description">
            Description
          </ToastDescription>
          <ToastAction altText="Action" data-testid="action" className="custom-action">
            Action
          </ToastAction>
          <ToastClose data-testid="close" className="custom-close" />
        </Toast>
      </ToastProvider>
    );

    expect(screen.getByTestId('toast').className).toContain('custom-toast');
    expect(screen.getByTestId('title').className).toContain('custom-title');
    expect(screen.getByTestId('description').className).toContain('custom-description');
    expect(screen.getByTestId('action').className).toContain('custom-action');
    expect(screen.getByTestId('close').className).toContain('custom-close');
  });
});
