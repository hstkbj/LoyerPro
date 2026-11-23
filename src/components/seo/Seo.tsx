import React from 'react';
import { SITE, absoluteUrl } from '../../lib/site';

interface SeoProps {
  /** Titre de la page (sans le nom du site, ajouté automatiquement). */
  title?: string;
  description?: string;
  /** Chemin canonique, ex. "/properties". Par défaut : page courante. */
  path?: string;
  /** Image de partage (chemin ou URL absolue). */
  image?: string;
  /** Empêche l'indexation (pages privées, 404...). */
  noindex?: boolean;
  type?: 'website' | 'article';
}

// React 19 remonte automatiquement <title>, <meta> et <link> dans le <head>,
// sans bibliothèque supplémentaire.
export function Seo({ title, description = SITE.description, path, image = SITE.ogImage, noindex = false, type = 'website' }: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} : ${SITE.tagline}`;
  const canonical = absoluteUrl(path ?? (typeof window !== 'undefined' ? window.location.pathname : '/'));
  const imageUrl = image.startsWith('http') ? image : absoluteUrl(image);

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      <link rel="canonical" href={canonical} />

      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content={SITE.locale} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${SITE.name} : ${SITE.tagline}`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </>
  );
}
