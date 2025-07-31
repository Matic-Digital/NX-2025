/**
 * Hero Component Tests
 *
 * This test suite verifies the functionality of the Hero component which displays
 * hero content from Contentful. It tests the component's rendering behavior with
 * different prop configurations and ensures it correctly integrates with Contentful's
 * Live Preview functionality.
 *
 * The Hero component is a key part of the site's content display, typically used
 * for prominent sections at the top of pages with titles, descriptions, and optional
 * call-to-action buttons.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hero } from '@/components/global/Hero';

// Mock Contentful Live Preview
/**
 * Mock implementation of Contentful Live Preview hooks
 *
 * These mocks simulate the behavior of Contentful's Live Preview functionality,
 * which allows real-time content updates in the preview environment. The mocks
 * ensure tests can run without requiring an actual connection to Contentful.
 *
 * - useContentfulLiveUpdates: Returns the props passed to it, simulating how the hook
 *   would normally return updated content
 * - useContentfulInspectorMode: Returns a function that adds inspector mode attributes
 *   to elements for field highlighting in the Contentful UI
 */
vi.mock('@contentful/live-preview/react', () => ({
  useContentfulLiveUpdates: vi.fn(<T extends Record<string, unknown>>(props: T): T => props),
  useContentfulInspectorMode: vi.fn(
    () =>
      (fieldProps: { fieldId: string }): { fieldId: string } => ({ fieldId: fieldProps.fieldId })
  )
}));

// Mock console.log and console.error to avoid cluttering test output
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Hero Component', () => {
  /**
   * Helper function to create a mock Hero with default values
   *
   * This function creates a minimal valid Hero object that can be used
   * in tests, with the ability to override specific properties as needed.
   * It follows the structure expected by the Hero component based on the
   * Contentful content model.
   *
   * @param overrides - Optional properties to override default values
   * @returns A mock Hero object for testing
   */
  const createMockHero = (overrides = {}) => ({
    sys: { id: 'test-hero-id' },
    name: 'Test Hero Title',
    description: 'Test hero description text',
    ...overrides
  });

  it('renders the hero with title and description', () => {
    const mockHero = createMockHero();
    render(<Hero {...mockHero} />);

    // Check for title and description
    expect(screen.getByText('Test Hero Title')).toBeInTheDocument();
    expect(screen.getByText('Test hero description text')).toBeInTheDocument();
  });

  it('renders only the title when description is not provided', () => {
    const mockHero = createMockHero({ description: undefined });
    render(<Hero {...mockHero} />);

    // Title should be present
    expect(screen.getByText('Test Hero Title')).toBeInTheDocument();

    // Description should not be present
    expect(screen.queryByText('Test hero description text')).not.toBeInTheDocument();
  });

  it('renders only the description when name is not provided', () => {
    const mockHero = createMockHero({ name: undefined });
    render(<Hero {...mockHero} />);

    // Description should be present
    expect(screen.getByText('Test hero description text')).toBeInTheDocument();

    // Title should not be present
    expect(screen.queryByText('Test Hero Title')).not.toBeInTheDocument();
  });

  it('returns null when sys.id is missing', () => {
    // Create a Hero without sys.id
    const invalidHero = {
      name: 'Invalid Hero',
      description: 'This hero has no ID'
    };

    const { container } = render(<Hero {...(invalidHero as any)} />);

    // Component should render nothing
    expect(container.firstChild).toBeNull();

    // Console error should be called
    expect(console.error).toHaveBeenCalled();
  });

  it('applies correct CSS classes for responsive design', () => {
    const mockHero = createMockHero();
    const { container } = render(<Hero {...mockHero} />);

    // Check container classes
    const containerElement = container.firstChild;
    expect(containerElement).toHaveClass('py-16');
    expect(containerElement).toHaveClass('md:py-24');

    // Check title classes
    const titleElement = screen.getByText('Test Hero Title');
    expect(titleElement).toHaveClass('text-headline-md');
    expect(titleElement).toHaveClass('sm:text-headline-lg');

    // Check description classes
    const descriptionElement = screen.getByText('Test hero description text');
    expect(descriptionElement).toHaveClass('text-lg');
    expect(descriptionElement).toHaveClass('md:text-xl');
  });
});
