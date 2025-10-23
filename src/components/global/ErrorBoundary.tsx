'use client';

import React, { useEffect } from 'react';

import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import { Box } from '@/components/global/matic-ds';

import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ErrorBoundary({ children, fallback }: Props) {
  // available if needed
  // const router = useRouter();

  useEffect(() => {
    // Add error event listener for uncaught client errors
    const handleError = (_event: ErrorEvent) => {
      // You could send this to your error reporting service
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return <ErrorBoundaryInner fallback={fallback}>{children}</ErrorBoundaryInner>;
}

// Inner error boundary component
class ErrorBoundaryInner extends React.Component<Props, { error: Error | null }> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // Log error to your error reporting service
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      if (fallback) return fallback;

      return (
        <Alert variant="destructive" className="flex flex-col gap-4">
          <Box gap={2} className="items-start">
            <AlertCircle className="mt-1 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <AlertTitle className="mb-2">Something went wrong</AlertTitle>
              <AlertDescription className="text-sm text-red-800">
                {error.message || 'An unexpected error occurred'}
              </AlertDescription>
            </div>
          </Box>
          <Box gap={2}>
            <Button onClick={this.handleReset} variant="secondary" size="sm">
              Try again
            </Button>
            <Button onClick={this.handleRefresh} variant="outline" size="sm">
              Refresh page
            </Button>
          </Box>
        </Alert>
      );
    }

    return children;
  }
}
