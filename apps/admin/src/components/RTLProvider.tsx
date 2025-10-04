import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';

interface RTLProviderProps {
  children: React.ReactNode;
  locale: string;
}

const RTLProvider: React.FC<RTLProviderProps> = ({ children, locale }) => {
  const isRTL = ['ar', 'fa'].includes(locale);

  useEffect(() => {
    // Set document direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    
    // Add RTL-specific classes
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
      document.body.classList.remove('rtl');
    };
  }, [locale, isRTL]);

  return (
    <div className={cn(
      "min-h-screen",
      isRTL && "rtl"
    )}>
      {children}
    </div>
  );
};

export default RTLProvider;
