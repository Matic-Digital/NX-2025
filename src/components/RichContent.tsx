/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types';
import type { Document, Block, Inline } from '@contentful/rich-text-types';
import type { RichContent as RichContentType } from '@/types/contentful/RichContent';

interface RichContentProps extends RichContentType {
  className?: string;
}

// Use simpler types to avoid TypeScript complexity

// Custom rendering options for rich text
const renderOptions = {
  renderMark: {
    [MARKS.BOLD]: (text: React.ReactNode) => <strong className="font-semibold">{text}</strong>,
    [MARKS.ITALIC]: (text: React.ReactNode) => <em className="italic">{text}</em>,
    [MARKS.UNDERLINE]: (text: React.ReactNode) => <u className="underline">{text}</u>,
    [MARKS.CODE]: (text: React.ReactNode) => (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{text}</code>
    ),
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node: Block | Inline, children: React.ReactNode) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),
    [BLOCKS.HEADING_1]: (_node: Block | Inline, children: React.ReactNode) => (
      <h1 className="text-4xl font-bold mb-6 mt-8">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (_node: Block | Inline, children: React.ReactNode) => (
      <h2 className="text-3xl font-bold mb-5 mt-7">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_node: Block | Inline, children: React.ReactNode) => (
      <h3 className="text-2xl font-bold mb-4 mt-6">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (_node: Block | Inline, children: React.ReactNode) => (
      <h4 className="text-xl font-bold mb-3 mt-5">{children}</h4>
    ),
    [BLOCKS.HEADING_5]: (_node: Block | Inline, children: React.ReactNode) => (
      <h5 className="text-lg font-bold mb-3 mt-4">{children}</h5>
    ),
    [BLOCKS.HEADING_6]: (_node: Block | Inline, children: React.ReactNode) => (
      <h6 className="text-base font-bold mb-2 mt-3">{children}</h6>
    ),
    [BLOCKS.UL_LIST]: (_node: Block | Inline, children: React.ReactNode) => (
      <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (_node: Block | Inline, children: React.ReactNode) => (
      <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (_node: Block | Inline, children: React.ReactNode) => (
      <li className="ml-4">{children}</li>
    ),
    [BLOCKS.QUOTE]: (_node: Block | Inline, children: React.ReactNode) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 py-2 mb-4 italic bg-gray-50">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="my-8 border-gray-300" />,
    [BLOCKS.EMBEDDED_ASSET]: (node: Block | Inline) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nodeData = node as any;
      const { title, description, file } = nodeData.data?.target?.fields || {};
      const { url, contentType } = file || {};
      
      if (contentType?.startsWith('image/')) {
        return (
          <div className="my-6">
            <img
              src={url}
              alt={description ?? title ?? ''}
              title={title ?? ''}
              className="max-w-full h-auto rounded-lg shadow-sm"
            />
            {description && (
              <p className="text-sm text-gray-600 mt-2 text-center italic">
                {description}
              </p>
            )}
          </div>
        );
      }
      
      if (contentType?.startsWith('video/')) {
        return (
          <div className="my-6">
            <video
              src={url}
              title={title ?? ''}
              controls
              className="max-w-full h-auto rounded-lg shadow-sm"
            >
              Your browser does not support the video tag.
            </video>
            {description && (
              <p className="text-sm text-gray-600 mt-2 text-center italic">
                {description}
              </p>
            )}
          </div>
        );
      }
      
      // Fallback for other file types
      return (
        <div className="my-4 p-4 border border-gray-200 rounded-lg">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {title ?? 'Download File'}
          </a>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      );
    },
    [BLOCKS.EMBEDDED_ENTRY]: (node: Block | Inline) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nodeData = node as any;
      const entryFields = nodeData.data?.target?.fields || {};
      
      // Basic rendering for embedded entries
      return (
        <div className="my-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-semibold text-gray-800">
            {entryFields.title ?? 'Embedded Content'}
          </h4>
          {entryFields.description && (
            <p className="text-sm text-gray-600 mt-2">{entryFields.description}</p>
          )}
        </div>
      );
    },
    [INLINES.EMBEDDED_ENTRY]: (node: Block | Inline) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nodeData = node as any;
      const entryFields = nodeData.data?.target?.fields || {};
      
      const title = entryFields.title ?? 'Embedded Content';
      
      return (
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          {title}
        </span>
      );
    },
    [INLINES.HYPERLINK]: (node: Block | Inline, children: React.ReactNode) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nodeData = node as any;
      const uri = nodeData.data?.uri;
      return (
        <a
          href={uri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {children}
        </a>
      );
    },
  },
};

const RichContent: React.FC<RichContentProps> = ({ sys, title, tableOfContents, content, className = '', __typename }) => {
  console.log('RichContent component received props:', { sys, title, tableOfContents, content, __typename });
  
  if (!content?.json) {
    console.log('RichContent: No content.json found');
    return null;
  }

  const document = content.json as Document;

  return (
    <div className={`rich-content prose prose-lg max-w-none ${className}`}>
      {title && (
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          {title}
        </h1>
      )}
      
      {tableOfContents && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Table of Contents
          </h2>
          {/* TODO: Generate table of contents from headings */}
          <p className="text-sm text-gray-600">
            Table of contents will be generated automatically from headings.
          </p>
        </div>
      )}
      
      <div className="rich-text-content">
        {documentToReactComponents(document, renderOptions)}
      </div>
    </div>
  );
};

export default RichContent;
