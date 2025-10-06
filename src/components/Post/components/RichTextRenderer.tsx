/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @next/next/no-img-element */
import React from 'react';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';

import { richTextStyles } from '@/components/Post/styles/RichTextStyles';

interface RichTextRendererProps {
  content: {
    json?: any; // Contentful rich text JSON structure
    links?: {
      entries?: {
        inline?: any[];
        block?: any[];
      };
    };
  };
}

export function RichTextRenderer({ content }: RichTextRendererProps) {
  // Return null if no content or json is provided
  if (!content?.json) {
    return null;
  }


  // Create a map of linked entries for easy lookup
  const linkedEntries = new Map<string, any>();
  
  if (content.links?.entries) {
    const allEntries = [
      ...(content.links.entries.inline ?? []),
      ...(content.links.entries.block ?? [])
    ];
    
    allEntries.forEach((entry: any) => {
      if (entry?.sys?.id) {
        linkedEntries.set(entry.sys.id, entry);
      }
    });
  }

  const richTextOptions = {
    renderMark: {
      [MARKS.BOLD]: (text: React.ReactNode) => (
        <strong className={richTextStyles.getBoldClasses()}>{text}</strong>
      ),
      [MARKS.ITALIC]: (text: React.ReactNode) => (
        <em className={richTextStyles.getItalicClasses()}>{text}</em>
      ),
      [MARKS.UNDERLINE]: (text: React.ReactNode) => (
        <span className={richTextStyles.getUnderlineClasses()}>{text}</span>
      ),
      [MARKS.CODE]: (text: React.ReactNode) => (
        <code className={richTextStyles.getInlineCodeClasses()}>{text}</code>
      ),
      [MARKS.SUPERSCRIPT]: (text: React.ReactNode) => (
        <sup className={richTextStyles.getSuperscriptClasses()}>{text}</sup>
      ),
      [MARKS.SUBSCRIPT]: (text: React.ReactNode) => (
        <sub className={richTextStyles.getSubscriptClasses()}>{text}</sub>
      ),
    },
    renderNode: {
      // Skip h1 rendering as requested - let it render as default
      [BLOCKS.HEADING_1]: (node: unknown, children: React.ReactNode) => (
        <>{children}</>
      ),
      [BLOCKS.HEADING_2]: (node: unknown, children: React.ReactNode) => (
        <h2 className={richTextStyles.getHeadingClasses(2)}>{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (node: unknown, children: React.ReactNode) => (
        <h3 className={richTextStyles.getHeadingClasses(3)}>{children}</h3>
      ),
      [BLOCKS.HEADING_4]: (node: unknown, children: React.ReactNode) => (
        <h4 className={richTextStyles.getHeadingClasses(4)}>{children}</h4>
      ),
      [BLOCKS.HEADING_5]: (node: unknown, children: React.ReactNode) => (
        <h5 className={richTextStyles.getHeadingClasses(5)}>{children}</h5>
      ),
      [BLOCKS.HEADING_6]: (node: unknown, children: React.ReactNode) => (
        <h6 className={richTextStyles.getHeadingClasses(6)}>{children}</h6>
      ),
      [BLOCKS.PARAGRAPH]: (node: unknown, children: React.ReactNode) => (
        <p className={richTextStyles.getParagraphClasses()}>{children}</p>
      ),
      [BLOCKS.QUOTE]: (node: unknown, children: React.ReactNode) => (
        <blockquote className={richTextStyles.getBlockquoteClasses()}>{children}</blockquote>
      ),
      [BLOCKS.UL_LIST]: (node: unknown, children: React.ReactNode) => (
        <ul className={richTextStyles.getUnorderedListClasses()}>{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (node: unknown, children: React.ReactNode) => (
        <ol className={richTextStyles.getOrderedListClasses()}>{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (node: unknown, children: React.ReactNode) => (
        <li className={richTextStyles.getListItemClasses()}>{children}</li>
      ),
      [BLOCKS.HR]: () => (
        <hr className={richTextStyles.getHorizontalRuleClasses()} />
      ),
      [BLOCKS.TABLE]: (node: unknown, children: React.ReactNode) => (
        <table className={richTextStyles.getTableClasses()}>{children}</table>
      ),
      [BLOCKS.TABLE_ROW]: (node: unknown, children: React.ReactNode) => (
        <tr>{children}</tr>
      ),
      [BLOCKS.TABLE_HEADER_CELL]: (node: unknown, children: React.ReactNode) => (
        <th className={richTextStyles.getTableHeaderClasses()}>{children}</th>
      ),
      [BLOCKS.TABLE_CELL]: (node: unknown, children: React.ReactNode) => (
        <td className={richTextStyles.getTableCellClasses()}>{children}</td>
      ),
      [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
        const asset = node.data?.target;
        if (!asset) return null;

        const url = asset.fields?.file?.url;
        const title = asset.fields?.title;
        const description = asset.fields?.description;

        if (!url) return null;

        return (
          <div className={richTextStyles.getEmbeddedAssetClasses()}>
            <img
              src={url.startsWith('//') ? `https:${url}` : url}
              alt={title ?? ''}
              className={richTextStyles.getEmbeddedImageClasses()}
            />
            {description && (
              <p className={richTextStyles.getEmbeddedCaptionClasses()}>{description}</p>
            )}
          </div>
        );
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node: any) => {
        const entryId = node.data?.target?.sys?.id;
        
        if (!entryId) {
          return null;
        }

        // Get the entry from our linked entries map
        const entry = linkedEntries.get(entryId);
        
        if (!entry) {
          return null;
        }

        const contentType = entry.__typename?.toLowerCase();

        switch (contentType) {
          case 'image': {
            const imageLink = entry.link;
            const altText = entry.altText;
            const title = entry.title;

            if (!imageLink) {
              return null;
            }

            return (
              <div className="my-8 w-full max-w-full">
                <img
                  src={imageLink}
                  alt={altText ?? title ?? ''}
                  className="w-full h-auto rounded-lg shadow-lg"
                  style={{ 
                    width: '100%',
                    height: 'auto',
                    maxWidth: '100%',
                    display: 'block'
                  }}
                />
              </div>
            );
          }
          default:
            return null;
        }
      },
      [INLINES.HYPERLINK]: (node: any, children: React.ReactNode) => (
        <a
          href={node.data?.uri}
          className={richTextStyles.getLinkClasses()}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ),
      [INLINES.ENTRY_HYPERLINK]: (node: any, children: React.ReactNode) => (
        <a
          href={`#${node.data.target.sys.id}`}
          className={richTextStyles.getLinkClasses()}
        >
          {children}
        </a>
      ),
    },
  };

  return (
    <div 
      className="!w-full !max-w-full overflow-hidden [&>div>*:first-child]:!mt-0"
      style={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
      }}
    >
      <div
        className="!w-full !max-w-full"
        style={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          boxSizing: 'border-box'
        }}
      >
        {documentToReactComponents(content.json, richTextOptions)}
      </div>
    </div>
  );
}
