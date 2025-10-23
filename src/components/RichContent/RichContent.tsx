'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import Image from 'next/image';

import { Container } from '@/components/global/matic-ds';

import type { RichContent as RichContentType } from '@/components/RichContent/RichContentSchema';
import type { Block, Document, Inline } from '@contentful/rich-text-types';

// Type definitions for Contentful rich text nodes
interface ContentfulNode {
  nodeType: string;
  content?: ContentfulNode[];
  value?: string;
  data?: {
    paddingClass?: string;
    isInListItem?: boolean;
    nestingLevel?: number;
    isInOrderedList?: boolean;
    target?: {
      fields?: {
        title?: string;
        description?: string;
        file?: {
          url?: string;
          contentType?: string;
        };
      };
    };
    uri?: string;
  };
}

// Helper functions to safely check node types
const isHeading2 = (node: ContentfulNode): boolean => node.nodeType === 'heading-2';
const isHeading3 = (node: ContentfulNode): boolean => node.nodeType === 'heading-3';
const isHeading4 = (node: ContentfulNode): boolean => node.nodeType === 'heading-4';
const isHeading5 = (node: ContentfulNode): boolean => node.nodeType === 'heading-5';
const isHeading6 = (node: ContentfulNode): boolean => node.nodeType === 'heading-6';
const isUlList = (node: ContentfulNode): boolean => node.nodeType === 'unordered-list';
const isOlList = (node: ContentfulNode): boolean => node.nodeType === 'ordered-list';
const isListItem = (node: ContentfulNode): boolean => node.nodeType === 'list-item';

interface RichContentProps extends RichContentType {
  className?: string;
}

// Interface for table of contents items
interface TocItem {
  id: string;
  text: string;
  level: number;
}

// Function to extract text content from rich text nodes
const extractTextFromNode = (node: ContentfulNode | string): string => {
  if (typeof node === 'string') {
    return node;
  }

  if (node?.content) {
    return node.content.map(extractTextFromNode).join('');
  }

  if (node?.value) {
    return String(node.value);
  }

  return '';
};

// Function to generate a URL-friendly ID from text
const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, '');
};

// Global state to track if we're currently in an appendix section
let currentlyInAppendix = false;

// Function to check if a node is within an appendix section
const checkIfInAppendix = (_node: ContentfulNode): boolean => {
  return currentlyInAppendix;
};

// Pre-compiled regex patterns for security
// eslint-disable-next-line security/detect-unsafe-regex
const APPENDIX_REGEX = /appendix/i;
// eslint-disable-next-line security/detect-unsafe-regex
const NUMBERED_SECTION_REGEX = /^\d+(?:\.\d+)?/;
// eslint-disable-next-line security/detect-unsafe-regex
const ROMAN_NUMERAL_REGEX = /^[IVXLCDM]+\./i;
// eslint-disable-next-line security/detect-unsafe-regex
const HAS_NUMBER_REGEX = /\d+(?:\.\d+)?/;
// eslint-disable-next-line security/detect-unsafe-regex
const H3_ROMAN_REGEX = /[A-Z]\.[ivxlcdm]+/i;
// eslint-disable-next-line security/detect-unsafe-regex
const NUMBER_PREFIX_REGEX = /^(\d+(?:\.\d+)?)\.?\s*/;

// Function to update appendix context based on heading content
const updateAppendixContext = (text: string): void => {
  if (APPENDIX_REGEX.test(text)) {
    currentlyInAppendix = true;
  } else if (NUMBERED_SECTION_REGEX.test(text.trim()) || ROMAN_NUMERAL_REGEX.test(text.trim())) {
    // If we encounter a numbered section or roman numeral section after appendix, we're out of appendix
    currentlyInAppendix = false;
  }
};

// Function to extract h2 headings with numbers from the document
const extractTocItems = (document: Document): TocItem[] => {
  const tocItems: TocItem[] = [];
  let inAppendixSection = false;

  const traverseNodes = (nodes: ContentfulNode[]) => {
    nodes.forEach((node) => {
      if (isHeading2(node) || isHeading3(node) || isHeading4(node)) {
        const text = extractTextFromNode(node);

        // Update appendix context during TOC extraction
        if (isHeading2(node)) {
          if (APPENDIX_REGEX.test(text)) {
            inAppendixSection = true;
          } else if (NUMBERED_SECTION_REGEX.test(text.trim()) || ROMAN_NUMERAL_REGEX.test(text.trim())) {
            inAppendixSection = false;
          }
        }

        // Check if the heading contains a number (including decimal numbers like 18.1, 18.2) or is an appendix
        // For h2s, check for roman numerals like I., II., III.
        // For h3s, check for roman numerals like A.i, A.ii
        // Also include roman numerals when we're in an appendix section
        const hasNumber = HAS_NUMBER_REGEX.test(text);
        const isAppendix = APPENDIX_REGEX.test(text);
        const hasH2RomanNumeral = isHeading2(node) && ROMAN_NUMERAL_REGEX.test(text.trim());
        const hasH3RomanNumeral = isHeading3(node) && H3_ROMAN_REGEX.test(text);
        const isRomanInAppendix = inAppendixSection && ROMAN_NUMERAL_REGEX.test(text.trim());

        if (
          hasNumber ||
          isAppendix ||
          hasH2RomanNumeral ||
          hasH3RomanNumeral ||
          isRomanInAppendix
        ) {
          const id = generateId(text);
          const level = isHeading2(node) ? 2 : isHeading3(node) ? 3 : 4;
          tocItems.push({
            id,
            text,
            level
          });
        }
      }

      if (node.content) {
        traverseNodes(node.content);
      }
    });
  };

  if (document.content) {
    traverseNodes(document.content);
  }

  return tocItems;
};

// Custom rendering options for rich text
const renderOptions = {
  renderMark: {
    [MARKS.BOLD]: (text: React.ReactNode) => (
      <strong className="line-clamp-2 font-semibold">{text}</strong>
    ),
    [MARKS.ITALIC]: (text: React.ReactNode) => <em className="italic">{text}</em>,
    [MARKS.UNDERLINE]: (text: React.ReactNode) => <u className="underline">{text}</u>,
    [MARKS.CODE]: (text: React.ReactNode) => (
      <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm">{text}</code>
    )
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: Block | Inline, children: React.ReactNode) => {
      const contentfulNode = node as ContentfulNode;
      const paddingClass = contentfulNode.data?.paddingClass ?? '';
      const isInListItem = contentfulNode.data?.isInListItem ?? false;

      if (isInListItem) {
        return (
          <span
            className={`text-secondary text-[1rem] leading-[160%] font-normal whitespace-pre-line ${paddingClass}`}
          >
            {children}
          </span>
        );
      }

      // Regular paragraphs should not have padding/indentation - only use paddingClass for list items
      return (
        <p
          className="text-secondary my-[1.75rem] text-[1rem] leading-[160%] font-normal whitespace-pre-line"
        >
          {children}
        </p>
      );
    },
    [BLOCKS.HEADING_2]: (node: Block | Inline, children: React.ReactNode) => {
      const text = extractTextFromNode(node);
      updateAppendixContext(text);
      const id = generateId(text);
      return (
        <h2
          id={id}
          className="mt-[2.5rem] scroll-mt-4 text-[1.5rem] leading-[120%] font-normal md:text-[2.25rem]"
        >
          {children}
        </h2>
      );
    },
    [BLOCKS.HEADING_3]: (node: Block | Inline, children: React.ReactNode) => {
      const text = extractTextFromNode(node);
      const id = generateId(text);
      return (
        <h3
          id={id}
          className="mt-[2.5rem] scroll-mt-4 pl-[2rem] text-[1.25rem] leading-[160%] font-normal md:text-[1.75rem]"
        >
          {children}
        </h3>
      );
    },
    [BLOCKS.HEADING_4]: (node: Block | Inline, children: React.ReactNode) => {
      const text = extractTextFromNode(node);
      const id = generateId(text);
      return (
        <h4
          id={id}
          className="mt-[1.25rem] scroll-mt-4 pl-[4rem] text-[1rem] leading-[160%] font-normal md:text-[1.55rem]"
        >
          {children}
        </h4>
      );
    },
    [BLOCKS.HEADING_5]: (node: Block | Inline, children: React.ReactNode) => {
      return (
        <h5 className="mt-[1rem] scroll-mt-4 pl-[6rem] text-[1.125rem] leading-[160%] font-normal">
          {children}
        </h5>
      );
    },
    [BLOCKS.HEADING_6]: (node: Block | Inline, children: React.ReactNode) => {
      return (
        <h6 className="mt-[1rem] scroll-mt-4 pl-[8rem] text-[1rem] leading-[160%] font-normal">
          {children}
        </h6>
      );
    },
    [BLOCKS.UL_LIST]: (node: Block | Inline, children: React.ReactNode) => {
      const contentfulNode = node as ContentfulNode;
      const paddingClass = contentfulNode.data?.paddingClass ?? '';
      return <ul className={`ml-6 list-disc ${paddingClass}`}>{children}</ul>;
    },
    [BLOCKS.OL_LIST]: (node: Block | Inline, children: React.ReactNode) => {
      // Check if this ordered list is within an appendix section by looking for parent h2 with "appendix"
      const contentfulNode = node as ContentfulNode;
      const isInAppendix = checkIfInAppendix(contentfulNode);
      const paddingClass = contentfulNode.data?.paddingClass ?? '';
      const nestingLevel = contentfulNode.data?.nestingLevel ?? 1;

      let listStyleType = 'decimal';
      if (isInAppendix) {
        listStyleType = 'lower-roman';
      } else if (nestingLevel === 1) {
        listStyleType = 'upper-alpha';
      } else {
        listStyleType = 'decimal';
      }

      return (
        <ol
          className={`ml-6 ${isInAppendix ? 'list-roman' : ''} ${paddingClass}`}
          style={{
            listStyleType
          }}
        >
          {children}
        </ol>
      );
    },
    [BLOCKS.LIST_ITEM]: (node: Block | Inline, children: React.ReactNode) => {
      // Check if this list item is in an ordered list by checking parent context
      const contentfulNode = node as ContentfulNode;
      const isInOrderedList = contentfulNode.data?.isInOrderedList ?? false;
      return <li className={isInOrderedList ? 'mb-3' : ''}>{children}</li>;
    },
    [BLOCKS.QUOTE]: (_node: Block | Inline, children: React.ReactNode) => (
      <blockquote className="">{children}</blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="" />,
    [BLOCKS.EMBEDDED_ASSET]: (node: Block | Inline) => {
      const contentfulNode = node as ContentfulNode;
      const { title, description, file } = contentfulNode.data?.target?.fields ?? {};
      const { url, contentType } = file ?? {};

      if (contentType?.startsWith('image/')) {
        return (
          <div className="my-6">
            <Image
              src={url ?? ''}
              alt={description ?? title ?? ''}
              title={title ?? ''}
              width={800}
              height={600}
              className="h-auto max-w-full rounded-lg shadow-sm"
            />
            {description && (
              <p className="mt-2 text-center text-sm text-gray-600 italic">{description}</p>
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
              className="h-auto max-w-full rounded-lg shadow-sm"
            >
              Your browser does not support the video tag.
            </video>
            {description && (
              <p className="mt-2 text-center text-sm text-gray-600 italic">{description}</p>
            )}
          </div>
        );
      }

      // Fallback for other file types
      return (
        <div className="my-4 rounded-lg border border-gray-200 p-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            {title ?? 'Download File'}
          </a>
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
      );
    },
    [BLOCKS.EMBEDDED_ENTRY]: (node: Block | Inline) => {
      const contentfulNode = node as ContentfulNode;
      const entryFields = contentfulNode.data?.target?.fields ?? {};

      // Basic rendering for embedded entries
      return (
        <div className="my-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="font-semibold text-gray-800">{entryFields.title ?? 'Embedded Content'}</h4>
          {entryFields.description && (
            <p className="mt-2 text-sm text-gray-600">{entryFields.description}</p>
          )}
        </div>
      );
    },
    [INLINES.EMBEDDED_ENTRY]: (node: Block | Inline) => {
      const contentfulNode = node as ContentfulNode;
      const entryFields = contentfulNode.data?.target?.fields ?? {};

      const title = entryFields.title ?? 'Embedded Content';

      return (
        <span className="inline-block rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
          {title}
        </span>
      );
    },
    [INLINES.HYPERLINK]: (node: Block | Inline, children: React.ReactNode) => {
      const contentfulNode = node as ContentfulNode;
      const uri = contentfulNode.data?.uri;
      return (
        <a
          href={uri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          {children}
        </a>
      );
    }
  }
};

// Function to add hierarchical padding based on heading structure
const addHierarchicalPadding = (nodes: ContentfulNode[]): ContentfulNode[] => {
  let currentLevel = 1; // Start at H1 level (so H2 content gets padding)

  const processNode = (
    node: ContentfulNode,
    isInList = false,
    isOrderedList = false,
    olNestingLevel = 0
  ): ContentfulNode => {
    if (isHeading2(node)) {
      currentLevel = 2;
      return node;
    } else if (isHeading3(node)) {
      currentLevel = 3;
      return node;
    } else if (isHeading4(node)) {
      currentLevel = 4;
      return node;
    } else if (isHeading5(node)) {
      currentLevel = 5;
      return node;
    } else if (isHeading6(node)) {
      currentLevel = 6;
      return node;
    } else if (isUlList(node) || isOlList(node)) {
      // Process list items
      const isOrderedListNode = isOlList(node);
      const currentNestingLevel = isOrderedListNode ? olNestingLevel + 1 : olNestingLevel;

      const processedContent =
        node.content?.map((childNode: ContentfulNode) =>
          processNode(childNode, true, isOrderedListNode, currentNestingLevel)
        ) ?? [];

      return {
        ...node,
        content: processedContent,
        data: {
          ...node.data,
          paddingClass: currentLevel >= 2 ? `pl-[${(currentLevel - 1) * 2}rem]` : '',
          nestingLevel: isOrderedListNode ? currentNestingLevel : undefined
        }
      };
    } else if (isListItem(node)) {
      // Process content inside list items, including nested lists
      const processedContent =
        node.content?.map((childNode: ContentfulNode) => {
          if (isUlList(childNode) || isOlList(childNode)) {
            return processNode(childNode, false, false, olNestingLevel);
          }
          return {
            ...childNode,
            data: {
              ...childNode.data,
              isInListItem: true
            }
          };
        }) ?? [];

      // Process nested list items to mark them as ordered if they're in an ordered list
      const finalProcessedContent = processedContent.map((childNode: ContentfulNode) => {
        if (isOlList(childNode)) {
          return {
            ...childNode,
            content: childNode.content?.map((listItem: ContentfulNode) => ({
              ...listItem,
              data: {
                ...listItem.data,
                isInOrderedList: true
              }
            }))
          };
        }
        return childNode;
      });
      return {
        ...node,
        content: finalProcessedContent,
        data: {
          ...node.data,
          isInOrderedList: isInList && isOrderedList
        }
      };
    } else if (currentLevel >= 2 && !isInList) {
      // Only add padding to non-paragraph elements (lists, headings, etc.)
      // Paragraphs should remain flush left under headings
      if (node.nodeType !== 'paragraph') {
        // Calculate padding based on heading level
        const paddingRem = (currentLevel - 1) * 2; // 2rem per level (H2 content = 2rem, H3 content = 4rem, etc.)
        const paddingClass = `pl-[${paddingRem}rem]`;

        return {
          ...node,
          data: {
            ...node.data,
            paddingClass
          }
        };
      }
    }
    return node;
  };

  return nodes.map((node: ContentfulNode) => processNode(node));
};

export function RichContent({
  sys: _sys,
  title: _title,
  tableOfContents,
  content,
  legalContent,
  variant,
  className = '',
  __typename
}: RichContentProps) {

  // All hooks must be at the top level
  const [activeSection, setActiveSection] = useState<string>('');
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  // Memoized values - using content?.json to avoid conditional hooks
  const document = content?.json as Document | undefined;

  const processedDocument = useMemo(() => {
    if (document?.content) {
      return {
        ...document,
        content: addHierarchicalPadding(document.content)
      };
    }
    return document;
  }, [document]);

  const tocItems = useMemo(() => {
    return tableOfContents && document ? extractTocItems(document) : [];
  }, [document, tableOfContents]);

  // Intersection Observer to track visible sections
  useEffect(() => {
    if (!tableOfContents || tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that's most visible and closest to the top
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        
        if (visibleEntries.length > 0) {
          // Sort by how close they are to the top of the viewport
          const sortedEntries = visibleEntries.sort((a, b) => {
            return a.boundingClientRect.top - b.boundingClientRect.top;
          });
          
          // Set the topmost visible section as active
          const topEntry = sortedEntries[0];
          if (topEntry) {
            setActiveSection(topEntry.target.id);
          }
        }
      },
      {
        // Account for navbar height (120px) and add some buffer
        rootMargin: '-140px 0px -60% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
      }
    );

    // Observe all heading elements
    tocItems.forEach((item) => {
      const element = window.document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [tocItems, tableOfContents]);

  // Intersection Observer for TOC visibility (back to top button)
  useEffect(() => {
    if (!tableOfContents) return;

    const tocElement = window.document.querySelector('[data-toc-container]');
    if (!tocElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Show back to top button when TOC is out of view
          setShowBackToTop(!entry.isIntersecting);
        });
      },
      {
        rootMargin: '0px',
        threshold: 0
      }
    );

    observer.observe(tocElement);

    return () => {
      observer.disconnect();
    };
  }, [tableOfContents]);

  // Early return after all hooks
  if (!content?.json || !document) {
    return null;
  }

  // Reset appendix context for each render
  currentlyInAppendix = false;

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine styling based on variant
  const isLegalVariant = variant === 'Legal';

  return (
    <div className="my-[3rem]">
      <Container>
        {isLegalVariant && legalContent?.json && (
          <div className="mb-[6rem]">
            <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-8">
              {documentToReactComponents(legalContent.json as Document, {
                renderNode: {
                  table: (node: Block | Inline, children: React.ReactNode) => {
                    // Ensure proper table structure by wrapping content in tbody if no thead/tbody exists
                    const hasTableStructure = React.Children.toArray(children).some((child) => {
                      const reactChild = child as React.ReactElement;
                      if (!reactChild?.type || !reactChild?.props) return false;

                      const className = (reactChild.props as { className?: string }).className;
                      return (
                        reactChild.type === 'thead' ||
                        reactChild.type === 'tbody' ||
                        (className?.includes('table-head') ?? false) ||
                        (className?.includes('table-body') ?? false)
                      );
                    });

                    return (
                      <div className="flex flex-1 flex-col lg:mb-0">
                        <table className="h-full w-full flex-1">
                          <colgroup>
                            <col
                              style={{ width: '7.75rem', minWidth: '7.75rem', maxWidth: '7.75rem' }}
                              className="lg:!w-[12.5rem] lg:!min-w-[12.5rem] lg:!max-w-[12.5rem]"
                            />
                            <col />
                          </colgroup>
                          {hasTableStructure ? (
                            children
                          ) : (
                            <tbody className="h-full">{children}</tbody>
                          )}
                        </table>
                      </div>
                    );
                  },
                  'table-header-cell': (_node: Block | Inline, children: React.ReactNode) => (
                    <th className="pr-4 text-left align-top font-semibold">{children}</th>
                  ),
                  'table-cell': (_node: Block | Inline, children: React.ReactNode) => (
                    <td className="pr-4 align-top">{children}</td>
                  ),
                  'table-row': (_node: Block | Inline, children: React.ReactNode) => (
                    <tr>{children}</tr>
                  ),
                  'table-head': (_node: Block | Inline, children: React.ReactNode) => (
                    <thead>{children}</thead>
                  ),
                  'table-body': (_node: Block | Inline, children: React.ReactNode) => (
                    <tbody className="h-full">{children}</tbody>
                  )
                }
              })}
            </div>
          </div>
        )}
        <div className={`${className} flex flex-col gap-8 md:flex-row`}>
          {tableOfContents && tocItems.length > 0 && (
            <div className="w-full flex-shrink-0 md:max-w-[25.75rem]" data-toc-container>
              <div
                className={`max-h-[80vh] overflow-y-auto p-[2rem] ${
                  isLegalVariant ? 'bg-subtle' : 'border border-blue-200 bg-blue-50'
                }`}
                style={{ position: 'sticky', top: '8rem' }}
              >
                <h2
                  className="mb-[1.5rem] text-2xl leading-[120%] font-normal"
                  style={{
                    color: 'var(--Text-text-body, #171717)'
                  }}
                >
                  Table of Contents
                </h2>
                <nav>
                  <ul className={isLegalVariant ? 'space-y-1' : 'space-y-2'}>
                    {tocItems.map((item) => (
                      <li
                        key={item.id}
                        className={`${item.level === 3 ? 'ml-4' : item.level === 4 ? 'ml-8' : ''}`}
                      >
                        <a
                          href={`#${item.id}`}
                          className={`text-sm leading-[160%] font-normal tracking-[0.00875rem] transition-colors duration-200 hover:underline ${
                            activeSection === item.id
                              ? 'text-primary rounded'
                              : 'hover:text-primary'
                          }`}
                          style={{
                            color:
                              activeSection === item.id
                                ? undefined
                                : 'var(--Text-text-secondary, #262626)'
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            const element = window.document.getElementById(item.id);
                            if (element) {
                              // Calculate offset to position heading just under the navbar
                              const navbarHeight = 120; // Adjust this value based on your navbar height
                              const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                              const offsetPosition = elementPosition - navbarHeight;
                              
                              window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                              });
                            }
                          }}
                        >
                          {item.text.replace(NUMBER_PREFIX_REGEX, (match, p1) => `${p1}\u00A0\u00A0`)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          )}

          <div className="rich-text-content flex-1">
            {processedDocument &&
              documentToReactComponents(processedDocument as Document, renderOptions)}
          </div>
        </div>

        {/* Back to top button - mobile only */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="bg-primary hover:bg-primary/90 fixed right-6 bottom-6 z-50 h-[3.75rem] w-[3.75rem] text-white shadow-lg transition-all duration-200 md:hidden"
            aria-label="Back to top"
          >
            <svg
              className="m-auto h-[2rem] w-[2rem]"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.858154 15L15.0003 0.857867M15.0003 0.857867L29.1424 15M15.0003 0.857867V29.1421"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </Container>
    </div>
  );
}
