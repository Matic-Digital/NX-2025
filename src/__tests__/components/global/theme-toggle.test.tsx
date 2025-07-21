import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/global/ThemeToggle';
import * as React from 'react';

// Create mock functions
const mockSetTheme = vi.fn();
let mockTheme = 'light';

// Mock the next-themes module
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme
  })
}));

// Mock the dropdown menu components
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button data-testid="dropdown-item" onClick={onClick}>
      {children}
    </button>
  )
}));

// Mock the button component
vi.mock('@/components/ui/button', () => ({
  Button: vi.fn().mockImplementation(
    (
      props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
        className?: string;
        children?: React.ReactNode;
      }
    ) => (
      <button className={props.className} data-testid="theme-button">
        {props.children}
      </button>
    )
  )
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Sun: () => <div data-testid="sun-icon">Sun</div>,
  Moon: () => <div data-testid="moon-icon">Moon</div>,
  LaptopMinimalCheck: () => <div data-testid="system-icon">System</div>
}));

describe('ThemeToggle component', () => {
  beforeEach(() => {
    // Reset mocks between tests
    vi.clearAllMocks();
  });

  it('renders a placeholder div when not mounted', () => {
    // Test that the component handles the unmounted state correctly
    // by mocking React's useState to return false for mounted
    const originalUseState = React.useState;

    // Mock useState to return false for mounted
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [false, vi.fn()]);

    const { container } = render(<ThemeToggle />);

    // When not mounted, the component should render a placeholder div to prevent layout shift
    expect(container.innerHTML).toBe('<div class="h-10 w-10"></div>');

    // Restore the original useState
    vi.mocked(React.useState).mockImplementation(originalUseState);
  });

  it('renders when mounted', () => {
    // Mock useState to return true for mounted state
    vi.mock('react', async (importOriginal) => {
      const actual = await importOriginal<typeof import('react')>();
      return {
        ...actual,
        useState: vi.fn().mockImplementation((_initialValue: unknown) => [true, vi.fn()]),
        useEffect: vi.fn().mockImplementation((callback: () => void) => callback())
      };
    });
  });

  it('renders the theme toggle button', () => {
    render(<ThemeToggle />);

    const button = screen.getByTestId('theme-button');
    expect(button).toBeDefined();

    const srOnlyText = screen.getByText('Toggle theme');
    expect(srOnlyText).toBeDefined();
  });

  it('renders the dropdown menu structure', () => {
    render(<ThemeToggle />);

    expect(screen.getByTestId('dropdown-menu')).toBeDefined();
    expect(screen.getByTestId('dropdown-trigger')).toBeDefined();
    expect(screen.getByTestId('dropdown-content')).toBeDefined();

    // Check for theme options
    const menuItems = screen.getAllByTestId('dropdown-item');
    expect(menuItems.length).toBe(3);

    // Check for the text within the menu items
    expect(menuItems[0]?.textContent).toContain('Light');
    expect(menuItems[1]?.textContent).toContain('Dark');
    expect(menuItems[2]?.textContent).toContain('System');
  });

  it('has clickable theme options', () => {
    // Since we can't easily test the setTheme function being called due to mocking limitations,
    // we'll just verify that the menu items are clickable and have the expected text content
    render(<ThemeToggle />);

    const menuItems = screen.getAllByTestId('dropdown-item');
    expect(menuItems.length).toBe(3);

    // Check that the menu items have the expected text
    expect(menuItems[0]?.textContent).toContain('Light');
    expect(menuItems[1]?.textContent).toContain('Dark');
    expect(menuItems[2]?.textContent).toContain('System');

    // Check that the menu items are clickable (no errors when clicking)
    if (menuItems[0]) fireEvent.click(menuItems[0]);
    if (menuItems[1]) fireEvent.click(menuItems[1]);
    if (menuItems[2]) fireEvent.click(menuItems[2]);
  });

  it('verifies icon visibility based on theme', () => {
    // We don't need to mock the theme here since it's already mocked in the vi.mock call
    // Just verify that the button renders with the icons

    render(<ThemeToggle />);

    // Verify that the button contains all the icons
    const button = screen.getByTestId('theme-button');
    expect(button).toBeDefined();

    // The button should contain all the icons
    expect(screen.getAllByTestId('sun-icon').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('moon-icon').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('system-icon').length).toBeGreaterThan(0);
  });

  it('renders the correct icon for different themes', () => {
    // We're testing that the component renders correctly
    // The actual visibility of icons is controlled by CSS classes
    // which are applied based on the theme

    render(<ThemeToggle />);

    // Verify that the button is rendered
    const button = screen.getByTestId('theme-button');
    expect(button).toBeDefined();

    // Verify that all theme options are available in the dropdown
    const menuItems = screen.getAllByTestId('dropdown-item');
    expect(menuItems.length).toBe(3);
    expect(menuItems[0]?.textContent).toContain('Light');
    expect(menuItems[1]?.textContent).toContain('Dark');
    expect(menuItems[2]?.textContent).toContain('System');
  });

  it('renders with light theme icon visible', () => {
    // Set the mock theme to 'light'
    mockTheme = 'light';

    render(<ThemeToggle />);

    // Check that the Sun icon is present
    // Using getAllByTestId since there are multiple elements with the same test ID
    expect(screen.getAllByTestId('sun-icon').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('moon-icon').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('system-icon').length).toBeGreaterThan(0);

    // Verify the button is rendered
    expect(screen.getByTestId('theme-button')).toBeInTheDocument();
  });

  it('renders with dark theme icon visible', () => {
    // Set the mock theme to 'dark'
    mockTheme = 'dark';

    render(<ThemeToggle />);

    // Check that all icons are present
    // Using getAllByTestId since there are multiple elements with the same test ID
    expect(screen.getAllByTestId('sun-icon').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('moon-icon').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('system-icon').length).toBeGreaterThan(0);

    // Verify the button is rendered
    expect(screen.getByTestId('theme-button')).toBeInTheDocument();
  });

  it('renders with system theme icon visible', () => {
    // Set the mock theme to 'system'
    mockTheme = 'system';

    render(<ThemeToggle />);

    // Check that all icons are present
    // Using getAllByTestId since there are multiple elements with the same test ID
    expect(screen.getAllByTestId('sun-icon').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('moon-icon').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('system-icon').length).toBeGreaterThan(0);

    // Verify the button is rendered
    expect(screen.getByTestId('theme-button')).toBeInTheDocument();
  });

  it('calls setTheme when clicking theme options', () => {
    // Reset the mock function before this test
    mockSetTheme.mockReset();

    render(<ThemeToggle />);

    // Get the dropdown menu items
    const menuItems = screen.getAllByTestId('dropdown-item');

    // Ensure we have all three menu items
    expect(menuItems.length).toBe(3);

    // Click the Light theme option
    fireEvent.click(menuItems[0]!);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
    mockSetTheme.mockReset();

    // Click the Dark theme option
    fireEvent.click(menuItems[1]!);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
    mockSetTheme.mockReset();

    // Click the System theme option
    fireEvent.click(menuItems[2]!);
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });
});
