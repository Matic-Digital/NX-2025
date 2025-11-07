import React from 'react';
import { cn } from '@/lib/utils';
import type { FormContent } from '../types';

interface FormContentProps {
  content: FormContent;
  theme?: 'light' | 'dark';
}

export const FormContentRenderer: React.FC<FormContentProps> = ({
  content,
  theme = 'dark'
}) => {
  const textClass = theme === 'light' ? 'text-gray-900' : 'text-gray-200';
  const _mutedTextClass = theme === 'light' ? 'text-gray-600' : 'text-gray-400';

  switch (content.type) {
    case 'header': {
      const HeaderTag = `h${content.level || 2}` as keyof JSX.IntrinsicElements;
      const headerClasses = cn(
        'font-semibold mb-4',
        textClass,
        {
          'text-2xl': content.level === 1,
          'text-xl': content.level === 2,
          'text-lg': content.level === 3,
          'text-base': content.level === 4,
          'text-sm': content.level === 5,
          'text-xs': content.level === 6,
        }
      );
      
      return (
        <HeaderTag className={headerClasses}>
          {content.content}
        </HeaderTag>
      );
    }

    case 'text':
      return (
        <div className={cn('mb-4', textClass)}>
          {content.richText ? (
            <div 
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: content.richText }}
              className="prose prose-sm max-w-none"
            />
          ) : (
            <p>{content.content}</p>
          )}
        </div>
      );

    case 'divider':
      return (
        <hr className={cn(
          'my-6 border-t',
          theme === 'light' ? 'border-gray-300' : 'border-gray-600'
        )} />
      );

    case 'image':
      return content.content ? (
        <div className="mb-4">
          <img 
            src={content.content} 
            alt="Form content" 
            className="max-w-full h-auto rounded-md"
          />
        </div>
      ) : null;

    default:
      return null;
  }
};
