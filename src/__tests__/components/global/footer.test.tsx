import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Footer } from '@/components/global/Footer';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    width,
    height,
    className
  }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid="mock-image"
    />
  )
}));

// Create a mock function for inspectorProps that we can reference
const mockInspectorProps = vi.fn(() => ({}));

// Mock the Contentful Live Preview functionality
vi.mock('@contentful/live-preview/react', () => ({
  useContentfulLiveUpdates: vi.fn(<T,>(data: T): T => data),
  useContentfulInspectorMode: vi.fn(() => mockInspectorProps),
  ContentfulLivePreviewProvider: vi.fn(({ children }: { children: React.ReactNode }) => children)
}));

// Set up before each test
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
});

describe('Footer Component', () => {
  const mockFooterData = {
    sys: { id: 'footer-1' },
    title: 'Test Footer',
    logo: {
      url: 'https://images.ctfassets.net/test-logo.png',
      title: 'Test Logo',
      width: 150,
      height: 50
    },
    description: 'Test footer description',
    copyright: 'Test Company',
    pageListsCollection: {
      items: [
        {
          sys: { id: 'page-list-1' },
          name: 'Products',
          pagesCollection: {
            items: [
              {
                sys: { id: 'page-1' },
                name: 'Product 1',
                slug: 'product-1'
              },
              {
                sys: { id: 'page-2' },
                name: 'Product 2',
                slug: 'product-2'
              }
            ]
          }
        },
        {
          sys: { id: 'page-list-2' },
          name: 'Company',
          pagesCollection: {
            items: [
              {
                sys: { id: 'page-3' },
                name: 'About',
                slug: 'about'
              },
              {
                sys: { id: 'page-4' },
                name: 'Contact',
                slug: 'contact'
              }
            ]
          }
        }
      ]
    }
  };

  it('renders the footer with logo', () => {
    render(<Footer footerData={mockFooterData} />);
    const logoImg = screen.getByAltText('Test Logo');
    expect(logoImg).toBeInTheDocument();
  });

  it('renders the footer description', () => {
    render(<Footer footerData={mockFooterData} />);
    expect(screen.getByText('Test footer description')).toBeInTheDocument();
  });

  it('renders page list sections', () => {
    render(<Footer footerData={mockFooterData} />);
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
  });

  it('renders links to pages', () => {
    render(<Footer footerData={mockFooterData} />);
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders copyright information with current year', () => {
    render(<Footer footerData={mockFooterData} />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} Test Company. All rights reserved.`)
    ).toBeInTheDocument();
  });

  it('renders default content when footerData is null', () => {
    render(<Footer footerData={null} />);
    expect(screen.getByText('Footer data not available')).toBeInTheDocument();
  });
});
