 
import React from 'react';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';

import { richTextStyles } from '@/components/Post/styles/RichTextStyles';
import { Profile } from '@/components/Profile/Profile';

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
  inspectorProps?: any; // Contentful inspector props function
}

export function RichTextRenderer({ content, inspectorProps }: RichTextRendererProps) {
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
      )
    },
    renderNode: {
      // Skip h1 rendering as requested - let it render as default
      [BLOCKS.HEADING_1]: (node: unknown, children: React.ReactNode) => <>{children}</>,
      [BLOCKS.HEADING_2]: (node: unknown, children: React.ReactNode) => (
        <h2
          className={richTextStyles.getHeadingClasses(2)}
          {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
        >
          {children}
        </h2>
      ),
      [BLOCKS.HEADING_3]: (node: unknown, children: React.ReactNode) => (
        <h3
          className={richTextStyles.getHeadingClasses(3)}
          {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
        >
          {children}
        </h3>
      ),
      [BLOCKS.HEADING_4]: (node: unknown, children: React.ReactNode) => (
        <h4
          className={richTextStyles.getHeadingClasses(4)}
          {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
        >
          {children}
        </h4>
      ),
      [BLOCKS.HEADING_5]: (node: unknown, children: React.ReactNode) => (
        <h5
          className={richTextStyles.getHeadingClasses(5)}
          {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
        >
          {children}
        </h5>
      ),
      [BLOCKS.HEADING_6]: (node: unknown, children: React.ReactNode) => (
        <h6
          className={richTextStyles.getHeadingClasses(6)}
          {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
        >
          {children}
        </h6>
      ),
      [BLOCKS.PARAGRAPH]: (node: unknown, children: React.ReactNode) => (
        <p
          className={richTextStyles.getParagraphClasses()}
          {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
        >
          {children}
        </p>
      ),
      [BLOCKS.QUOTE]: (node: unknown, children: React.ReactNode) => (
        <blockquote
          className={richTextStyles.getBlockquoteClasses()}
          {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
        >
          {children}
        </blockquote>
      ),
      [BLOCKS.UL_LIST]: (node: unknown, children: React.ReactNode) => (
        <ul
          className={richTextStyles.getUnorderedListClasses()}
          {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
        >
          {children}
        </ul>
      ),
      [BLOCKS.OL_LIST]: (node: unknown, children: React.ReactNode) => (
        <ol
          className={richTextStyles.getOrderedListClasses()}
          {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
        >
          {children}
        </ol>
      ),
      [BLOCKS.LIST_ITEM]: (node: unknown, children: React.ReactNode) => (
        <li
          className={richTextStyles.getListItemClasses()}
          {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
        >
          {children}
        </li>
      ),
      [BLOCKS.HR]: () => (
        <hr
          className={richTextStyles.getHorizontalRuleClasses()}
          {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
        />
      ),
      [BLOCKS.TABLE]: (node: unknown, children: React.ReactNode) => (
        <table
          className={richTextStyles.getTableClasses()}
          {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
        >
          {children}
        </table>
      ),
      [BLOCKS.TABLE_ROW]: (node: unknown, children: React.ReactNode) => (
        <tr {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}>{children}</tr>
      ),
      [BLOCKS.TABLE_HEADER_CELL]: (node: unknown, children: React.ReactNode) => (
        <th
          className={richTextStyles.getTableHeaderClasses()}
          {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
        >
          {children}
        </th>
      ),
      [BLOCKS.TABLE_CELL]: (node: unknown, children: React.ReactNode) => (
        <td
          className={richTextStyles.getTableCellClasses()}
          {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
        >
          {children}
        </td>
      ),
      [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
        const asset = node.data?.target;
        if (!asset) return null;

        const url = asset.fields?.file?.url;
        const title = asset.fields?.title;
        const description = asset.fields?.description;

        if (!url) return null;

        return (
          <div
            className={richTextStyles.getEmbeddedAssetClasses()}
            {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
          >
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
              <div
                className="my-8 w-full max-w-full"
                {...(inspectorProps ? inspectorProps({ fieldId: `embedded-${entryId}` }) : {})}
              >
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
          case 'profile': {
            return (
              <div
                className="my-6 w-full"
                {...(inspectorProps ? inspectorProps({ fieldId: `embedded-${entryId}` }) : {})}
              >
                <Profile {...entry} className="mx-auto max-w-2xl" />
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
          {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
        >
          {children}
        </a>
      ),
      [INLINES.ENTRY_HYPERLINK]: (node: any, children: React.ReactNode) => {
        const entryId = node.data?.target?.sys?.id;

        if (!entryId) {
          return <span>{children}</span>;
        }

        // Get the entry from our linked entries map
        const entry = linkedEntries.get(entryId);

        if (!entry) {
          return <span>{children}</span>;
        }

        const contentType = entry.__typename?.toLowerCase();

        // Handle Profile entries as inline components
        if (contentType === 'profile') {
          return (
            <span
              className="inline-block my-2"
              {...(inspectorProps ? inspectorProps({ fieldId: `inline-${entryId}` }) : {})}
            >
              <Profile {...entry} className="max-w-lg" />
            </span>
          );
        }

        // Default behavior for other entry types
        return (
          <a
            href={`#${entryId}`}
            className={richTextStyles.getLinkClasses()}
            {...(inspectorProps ? inspectorProps({ fieldId: 'content' }) : {})}
          >
            {children}
          </a>
        );
      }
    }
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
