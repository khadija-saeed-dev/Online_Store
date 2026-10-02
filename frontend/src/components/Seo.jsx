import { useEffect } from 'react';
import { getPublicOrigin } from '../utils/seo.js';

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.append(element);
  }
  element.setAttribute('href', url);
}

function removeMeta(attribute, key) {
  document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove();
}

export function trimMetaDescription(value, maximumLength = 160) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= maximumLength) return normalized;
  const shortened = normalized.slice(0, maximumLength - 1).replace(/\s+\S*$/, '');
  return `${shortened || normalized.slice(0, maximumLength - 1)}…`;
}

export default function Seo({
  title,
  description,
  canonicalPath,
  image,
  type = 'website',
  noindex = false,
  structuredData,
}) {
  const schema = structuredData ? JSON.stringify(structuredData).replace(/</g, '\\u003c') : '';

  useEffect(() => {
    const siteOrigin = getPublicOrigin();
    const canonicalUrl = new URL(canonicalPath || window.location.pathname, siteOrigin).href;

    document.title = title;
    setMeta('name', 'description', trimMetaDescription(description));
    setMeta('name', 'robots', noindex ? 'noindex,follow' : 'index,follow');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', trimMetaDescription(description));
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', canonicalUrl);
    if (image) setMeta('property', 'og:image', image);
    else removeMeta('property', 'og:image');
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', trimMetaDescription(description));
    if (image) setMeta('name', 'twitter:image', image);
    else removeMeta('name', 'twitter:image');
    setCanonical(canonicalUrl);

    let schemaElement = document.getElementById('page-structured-data');
    if (schema) {
      if (!schemaElement) {
        schemaElement = document.createElement('script');
        schemaElement.id = 'page-structured-data';
        schemaElement.type = 'application/ld+json';
        document.head.append(schemaElement);
      }
      schemaElement.textContent = schema;
    } else {
      schemaElement?.remove();
    }
  }, [canonicalPath, description, image, noindex, schema, title, type]);

  return null;
}