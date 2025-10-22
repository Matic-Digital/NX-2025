/**
 * JSON-LD Schema Component
 * 
 * Injects structured data into the page head for SEO and rich snippets
 */

import Script from 'next/script';

interface JsonLdSchemaProps {
  schema: string | object;
  id?: string;
}

/**
 * Component to inject JSON-LD structured data into page head
 */
export function JsonLdSchema({ schema, id = 'json-ld-schema' }: JsonLdSchemaProps) {
  const schemaString = typeof schema === 'string' ? schema : JSON.stringify(schema, null, 0);

  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: schemaString,
      }}
    />
  );
}

/**
 * Multiple schemas component for complex pages
 */
interface MultipleJsonLdSchemaProps {
  schemas: (string | object)[];
}

export function MultipleJsonLdSchema({ schemas }: MultipleJsonLdSchemaProps) {
  return (
    <>
      {schemas.map((schema, index) => (
        <JsonLdSchema
          key={index}
          schema={schema}
          id={`json-ld-schema-${index}`}
        />
      ))}
    </>
  );
}
