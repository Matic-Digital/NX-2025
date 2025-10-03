import React from 'react';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { INLINES, MARKS } from '@contentful/rich-text-types';

import { richTextStyles } from '@/components/Post/styles/RichTextStyles';

interface RichTextRendererProps {
  content: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json?: any; // Contentful rich text JSON structure
  };
  className?: string;
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  // Return null if no content or json is provided
  if (!content?.json) {
    return null;
  }

  const richTextOptions = {
    renderMark: {
      [MARKS.BOLD]: (text: React.ReactNode) => (
        <strong className={richTextStyles.getBoldClasses()}>{text}</strong>
      ),
      [MARKS.ITALIC]: (text: React.ReactNode) => (
        <em className={richTextStyles.getItalicClasses()}>{text}</em>
      ),
    },
    renderNode: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [INLINES.ENTRY_HYPERLINK]: (node: any, children: React.ReactNode) => (
        <a
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          href={`#${node.data.target.sys.id}`}
          className={richTextStyles.getLinkClasses()}
        >
          {children}
        </a>
      ),
    },
  };

  return (
    <div className={className ?? richTextStyles.getContentContainerClasses()}>
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-argument */}
      {documentToReactComponents(content.json, richTextOptions)}
    </div>
  );
}
