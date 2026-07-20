import React from 'react';
import { Helmet } from 'react-helmet-async';
import { USER_INFO, SOCIAL_LINKS } from '../constants';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  favicon?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  favicon,
}) => {
  const defaultTitle = `${USER_INFO.name} | ${USER_INFO.role}`;
  const defaultDescription = `Portfolio of ${USER_INFO.name}, a seasoned Full Stack Developer specializing in React, Firebase, Tailwind CSS, and scalable web solutions.`;
  const defaultKeywords = 'Full Stack Developer in Bangladesh, MERN Stack Expert, Flutter Developer, Muhammad Al-amin, Alamin, mdalaminkhalifa2002, React Developer, Frontend Engineer, Portfolio, Software Engineer';
  const defaultUrl = 'https://alamins20.ami.bd/'; // Updated with domain
  const defaultImage = USER_INFO.image; // Consider adding a default OG image URL here

  const getAbsoluteImageUrl = (imgUrl: string) => {
    if (!imgUrl) return defaultImage;
    if (imgUrl.startsWith('http')) return imgUrl;
    // Remove trailing slash from defaultUrl and leading slash from imgUrl to prevent double slash
    return `${defaultUrl.replace(/\/$/, '')}/${imgUrl.replace(/^\//, '')}`;
  };

  const seo = {
    title: title ? `${title} | ${USER_INFO.name}` : defaultTitle,
    description: description || defaultDescription,
    keywords: keywords || defaultKeywords,
    image: getAbsoluteImageUrl(image || defaultImage),
    url: url || defaultUrl,
    type,
    favicon: favicon || '/favicon.ico',
  };

  const sameAsLinks = SOCIAL_LINKS.map(link => link.url);

  return (
    <Helmet>
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href={seo.favicon} />
      <link rel="shortcut icon" type="image/x-icon" href={seo.favicon} />
      <link rel="apple-touch-icon" href={seo.favicon} />

      {/* Primary Meta Tags */}
      <title>{seo.title}</title>
      <meta name="title" content={seo.title} />
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      {url && <link rel="canonical" href={seo.url} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={seo.type} />
      <meta property="og:site_name" content={USER_INFO.name} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      {seo.image && (
        <>
          <meta property="og:image" content={seo.image} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={seo.title} />
        </>
      )}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={seo.url} />
      <meta property="twitter:title" content={seo.title} />
      <meta property="twitter:description" content={seo.description} />
      {seo.image && (
        <>
          <meta property="twitter:image" content={seo.image} />
          <meta property="twitter:image:alt" content={seo.title} />
        </>
      )}

      {/* Structured Data (JSON-LD) for Person Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "http://schema.org",
          "@type": "Person",
          "name": USER_INFO.name,
          "alternateName": "mdalaminkhalifa2002",
          "url": defaultUrl,
          "image": USER_INFO.image,
          "jobTitle": USER_INFO.role,
          "worksFor": {
            "@type": "Organization",
            "name": "Freelance"
          },
          "knowsAbout": ["React", "Node.js", "Firebase", "Web Development", "TypeScript", "Tailwind CSS"],
          "sameAs": sameAsLinks
        })}
      </script>

      {/* Structured Data (JSON-LD) for ProfessionalService Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "http://schema.org",
          "@type": "ProfessionalService",
          "name": `${USER_INFO.name} - ${USER_INFO.role}`,
          "image": USER_INFO.image,
          "url": defaultUrl,
          "telephone": USER_INFO.phone,
          "priceRange": "$$",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Dhaka",
            "addressRegion": "Dhaka",
            "addressCountry": "BD"
          },
          "sameAs": sameAsLinks
        })}
      </script>
    </Helmet>
  );
};
