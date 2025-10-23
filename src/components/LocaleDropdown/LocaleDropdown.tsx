'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { getCurrentLocale } from '@/lib/contentful-locale';
import type { LocaleOption } from '@/lib/server-locales';

interface LocaleDropdownProps {
  locales?: LocaleOption[]; // Server-provided locales (may be undefined during loading)
  className?: string;
}

/**
 * LocaleDropdown Component
 * Displays available locales and allows users to switch between them
 */
export function LocaleDropdown({
  locales,
  className
}: LocaleDropdownProps) {
  const [currentLocale, setCurrentLocale] = useState<string>('en-US');

  // Initialize locale on mount and listen for changes
  useEffect(() => {
    const initializeLocale = () => {
      const detectedLocale = getCurrentLocale();
      setCurrentLocale(detectedLocale);
    };

    initializeLocale();

    // Listen for locale changes in localStorage (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'contentful-locale' && e.newValue) {
        setCurrentLocale(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle locale change
  const handleLocaleChange = async (locale: string) => {
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('contentful-locale', locale);
    }

    // Route to localized version of the page
    if (typeof window !== 'undefined') {
      const _currentPath = window.location.pathname;
      
      // Update the current page URL with new locale
      const url = new URL(window.location.href);
      url.searchParams.set('locale', locale);
      
      // Use pushState to maintain navigation history
      window.history.pushState({}, '', url.toString());
      
      // Reload the page to apply the new locale
      window.location.reload();
      
      // DISABLED: Localized slug routing (causes 404s)
      // try {
      //   console.log('📡 Calling /api/localized-route...');
      //   
      //   // Try to find the localized version of the current page
      //   const response = await fetch('/api/localized-route', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       currentPath,
      //       targetLocale: locale,
      //       currentLocale: currentLocale
      //     })
      //   });

      //   console.log('📡 API Response status:', response.status);

      //   if (response.ok) {
      //     const data = await response.json();
      //     console.log('📡 API Response data:', data);
      //     
      //     if (data.localizedPath) {
      //       // Navigate to the localized version of the same content
      //       const url = new URL(window.location.origin + data.localizedPath + currentSearch);
      //       url.searchParams.set('locale', locale);
      //       
      //       console.log('🚀 Routing to localized content:', url.toString());
      //       window.location.href = url.toString();
      //       return;
      //     } else {
      //       console.log('⚠️ No localized path found, using fallback');
      //     }
      //   } else {
      //     const errorText = await response.text();
      //     console.error('❌ API Error:', response.status, errorText);
      //   }
      // } catch (error) {
      //   console.error('❌ Failed to find localized route:', error);
      // }

      // // Fallback: Just add locale parameter to current URL
      // const url = new URL(window.location.href);
      // url.searchParams.set('locale', locale);
      // 
      // console.log('🔄 Fallback: Routing with locale parameter:', url.toString());
      // window.location.href = url.toString();
    }

    // Update local state (though page will reload)
    setCurrentLocale(locale);
  };

  // Find current locale info (unused but kept for potential future use)
  // const currentLocaleInfo = locales.find(locale => locale.code === currentLocale) ?? locales[0];


  // Don't render if locales are not loaded yet or if there's only one locale
  if (!locales || locales.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/10 border border-white/30 hover:border-white/50 transition-colors ${className ?? ''}`}
          onMouseEnter={(e) => e.stopPropagation()}
          onMouseLeave={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-sm font-bold uppercase">{currentLocale.split('-')[0]}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[160px] bg-black/90 backdrop-blur-md border-white/20 z-[9999]"
        onMouseEnter={(e) => e.stopPropagation()}
        onMouseLeave={(e) => e.stopPropagation()}
      >
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            asChild
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void handleLocaleChange(locale.code);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void handleLocaleChange(locale.code);
              }}
              className={`w-full cursor-pointer text-white/90 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white px-2 py-1.5 text-left ${
                currentLocale === locale.code ? 'bg-white/20 text-white' : ''
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span>{locale.name}</span>
                {currentLocale === locale.code && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
            </button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
