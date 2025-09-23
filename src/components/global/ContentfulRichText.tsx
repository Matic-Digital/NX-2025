import React from 'react';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import Link from 'next/link';

import type { Document } from '@contentful/rich-text-types';

interface ContentfulRichTextProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  className?: string;
}

export const ContentfulRichText = ({ content, className = '' }: ContentfulRichTextProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!content?.json) {
    return null;
  }

  const options = {
    renderMark: {
      [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
      [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
      [MARKS.UNDERLINE]: (text: React.ReactNode) => <u>{text}</u>,
      [MARKS.CODE]: (text: React.ReactNode) => (
        <code className="rounded bg-gray-100 px-2 py-1">{text}</code>
      )
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (_node: unknown, children: React.ReactNode) => (
        <p className="mb-4">{children}</p>
      ),
      [BLOCKS.HEADING_1]: (_node: unknown, children: React.ReactNode) => (
        <h1 className="mb-4 text-3xl font-bold">{children}</h1>
      ),
      [BLOCKS.HEADING_2]: (_node: unknown, children: React.ReactNode) => (
        <h2 className="mb-3 text-2xl font-bold">{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (_node: unknown, children: React.ReactNode) => (
        <h3 className="mb-2 text-xl font-bold">{children}</h3>
      ),
      [BLOCKS.HEADING_4]: (_node: unknown, children: React.ReactNode) => (
        <h4 className="mb-2 text-lg font-bold">{children}</h4>
      ),
      [BLOCKS.HEADING_5]: (_node: unknown, children: React.ReactNode) => (
        <h5 className="mb-2 text-base font-bold">{children}</h5>
      ),
      [BLOCKS.HEADING_6]: (_node: unknown, children: React.ReactNode) => (
        <h6 className="mb-2 text-sm font-bold">{children}</h6>
      ),
      [BLOCKS.UL_LIST]: (_node: unknown, children: React.ReactNode) => (
        <ul className="mb-4 list-disc pl-6">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (_node: unknown, children: React.ReactNode) => (
        <ol className="mb-4 list-decimal pl-6">{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (_node: unknown, children: React.ReactNode) => (
        <li className="mb-1">{children}</li>
      ),
      [BLOCKS.QUOTE]: (_node: unknown, children: React.ReactNode) => (
        <blockquote className="my-4 border-l-4 border-gray-300 pl-4 italic">{children}</blockquote>
      ),
      [BLOCKS.HR]: () => <hr className="my-8 border-t border-gray-200" />,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [INLINES.HYPERLINK]: (node: any, children: React.ReactNode) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const uri = node.data?.uri as string;
        const isInternal = uri?.startsWith('/');

        if (isInternal) {
          return (
            <Link href={uri} className="text-blue-600 hover:underline">
              {children}
            </Link>
          );
        }

        return (
          <a
            href={uri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {children}
          </a>
        );
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [BLOCKS.EMBEDDED_ENTRY]: (_node: unknown) => {
        return (
          <div className="my-4 rounded border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">Embedded content (Image support coming soon)</p>
          </div>
        );
      }
    }
  };

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const reactContent = documentToReactComponents(content.json as Document, options);
    return <div className={className}>{reactContent}</div>;
  } catch (error) {
    console.error('Error rendering Contentful rich text:', error);

    if (process.env.NODE_ENV !== 'production') {
      return (
        <div className="rounded border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-500">Error rendering rich text content</p>
          <pre className="mt-2 max-h-[200px] overflow-auto rounded bg-gray-100 p-2 text-xs">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      );
    }

    return <p>Error rendering content</p>;
  }
};
