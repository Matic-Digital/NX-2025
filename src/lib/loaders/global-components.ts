// src/lib/loaders/global-components.ts
import { contentfulConfig } from '../config';
import { getHeaderById } from '../contentful-api/header';
import { getFooterById } from '../contentful-api/footer';

export async function loadGlobalComponents(options?: {
  headerId?: string;
  footerId?: string;
  preview?: boolean;
}) {
  const headerId = options?.headerId ?? contentfulConfig.defaultHeaderId;
  const footerId = options?.footerId ?? contentfulConfig.defaultFooterId;
  const preview = options?.preview ?? contentfulConfig.preview;

  const [header, footer] = await Promise.all([
    getHeaderById(headerId, preview),
    getFooterById(footerId, preview)
  ]);

  return { header, footer };
}
