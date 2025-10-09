'use client';

import { useEffect, useState } from 'react';
import { getAvailableLocales, getCurrentLocale } from './LocaleDropdownApi';

import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import type { Locale, LocaleDropdownProps } from './LocaleDropdownSchema';

/**
 * LocaleDropdown Component
 * Displays available locales and allows users to switch between them
 */
export function LocaleDropdown({
  currentLocale: propCurrentLocale,
  className
}: LocaleDropdownProps) {
  const [locales, setLocales] = useState<Locale[]>([]);
  const [currentLocale, setCurrentLocale] = useState<string>(propCurrentLocale ?? 'en-US');
  const [loading, setLoading] = useState(true);

  // Load available locales on mount
  useEffect(() => {
    const loadLocales = async () => {
      try {
        const availableLocales = await getAvailableLocales();
        setLocales(availableLocales);

        // Force English as default if no specific locale is provided
        const current = propCurrentLocale ?? getCurrentLocale();

        // Override with English if we detect Spanish or other non-English defaults
        const finalLocale = current === 'es' || current === 'es-ES' ? 'en-US' : current;
        setCurrentLocale(finalLocale);
      } catch (error) {
        console.error('Failed to load locales:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadLocales();
  }, [propCurrentLocale]);

  // Handle locale change
  const handleLocaleChange = (locale: string) => {
    console.log('Switching locale to:', locale);

    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('contentful-locale', locale);
    }

    // Update URL parameter
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('locale', locale);

      // Update the URL and reload to apply the new locale
      window.location.href = url.toString();
    }

    // Update local state (though page will reload)
    setCurrentLocale(locale);
  };

  // Find current locale info (unused but kept for potential future use)
  // const currentLocaleInfo = locales.find(locale => locale.code === currentLocale) ?? locales[0];

  // Debug logging
  console.log('LocaleDropdown render check:', { loading, localesCount: locales.length, locales });

  if (loading) {
    return null;
  }

  if (locales.length <= 1) {
    console.log('LocaleDropdown hidden: only', locales.length, 'locale(s) available');
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
            onClick={(e) => {
              console.log('Locale dropdown item clicked:', locale.code);
              e.stopPropagation();
              handleLocaleChange(locale.code);
            }}
            onMouseEnter={(e) => e.stopPropagation()}
            onMouseLeave={(e) => e.stopPropagation()}
            className={`cursor-pointer text-white/90 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white ${
              currentLocale === locale.code ? 'bg-white/20 text-white' : ''
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span>{locale.name}</span>
              {currentLocale === locale.code && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
