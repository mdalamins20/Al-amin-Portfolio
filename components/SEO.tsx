import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
}) => {
  const defaultTitle = 'Muhammad Al-amin | Digital Solutions Architect';
  const defaultDescription = 'Portfolio of Muhammad Al-amin (mdalaminkhalifa2002), a seasoned Full Stack Developer specializing in React, Firebase, Tailwind CSS, and scalable web solutions.';
  const defaultKeywords = 'Muhammad Al-amin, Alamin, mdalaminkhalifa2002, Full Stack Developer, React Developer, Frontend Engineer, Portfolio, Software Engineer';
  const defaultUrl = 'https://alaminportfolio.web.app/'; // Can be updated when domain is set
  const defaultImage = ''; // Consider adding a default OG image URL here

  const seo = {
    title: title ? `${title} | Muhammad Al-amin` : defaultTitle,
    description: description || defaultDescription,
    keywords: keywords || defaultKeywords,
    image: image || defaultImage,
    url: url || defaultUrl,
    type,
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seo.title}</title>
      <meta name="title" content={seo.title} />
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      {url && <link rel="canonical" href={seo.url} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={seo.type} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      {seo.image && <meta property="og:image" content={seo.image} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={seo.url} />
      <meta property="twitter:title" content={seo.title} />
      <meta property="twitter:description" content={seo.description} />
      {seo.image && <meta property="twitter:image" content={seo.image} />}

      {/* Structured Data (JSON-LD) for Person Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "http://schema.org",
          "@type": "Person",
          "name": "Muhammad Al-amin",
          "alternateName": "mdalaminkhalifa2002",
          "url": defaultUrl,
          "jobTitle": "Full Stack Developer",
          "worksFor": {
            "@type": "Organization",
            "name": "Freelance"
          },
          "knowsAbout": ["React", "Firebase", "Web Development", "TypeScript", "Tailwind CSS"],
          "sameAs": [
            "https://github.com/mdalaminkhalifa2002", // Example
            // Add LinkedIn, etc.
          ]
        })}
      </script>
    </Helmet>
  );
};
