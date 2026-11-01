import React from "react";
import { Helmet } from "react-helmet-async";

/**
 * Strips HTML tags and normalizes whitespace to create a clean meta description.
 *
 * @param {string} html
 * @param {number} [maxLength=155]
 * @returns {string}
 */
export const cleanExcerpt = (html = "", maxLength = 155) => {
  if (!html) return "";
  const plainText = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return plainText.slice(0, maxLength).trim() + "...";
};

/**
 * Dynamic SEO & Open Graph Meta Tags Component
 * Uses react-helmet-async to inject comprehensive Open Graph, Twitter Card,
 * and Schema.org JSON-LD tags into the document <head>.
 */
const SEO = ({
  title,
  description,
  image,
  url,
  type = "website",
  author,
  category,
  tags = [],
  publishedTime,
  siteName = "Blog Editor",
}) => {
  const defaultTitle = "Blog Editor - Insights, Stories & Tutorials";
  const defaultDesc =
    "Discover high-impact articles, engineering guides, and deep-dive technical tutorials curated for modern developers and creators.";
  const defaultImage =
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&h=630&q=85";

  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const metaDescription = description
    ? cleanExcerpt(description, 160)
    : defaultDesc;
  const metaImage = image || defaultImage;

  // Resolve absolute canonical URL
  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  const canonicalUrl = url
    ? url.startsWith("http")
      ? url
      : `${currentOrigin}${url}`
    : typeof window !== "undefined"
    ? window.location.href
    : "";

  // Schema.org JSON-LD Structured Data
  const jsonLd =
    type === "article"
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: title || fullTitle,
          description: metaDescription,
          image: [metaImage],
          datePublished: publishedTime || new Date().toISOString(),
          dateModified: publishedTime || new Date().toISOString(),
          author: {
            "@type": "Person",
            name: author || "Editorial Writer",
          },
          publisher: {
            "@type": "Organization",
            name: siteName,
            logo: {
              "@type": "ImageObject",
              url: `${currentOrigin}/src/assets/Logo/logo1.png`,
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl,
          },
          articleSection: category || "Technology",
          keywords: Array.isArray(tags) ? tags.join(", ") : "",
        }
      : {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteName,
          url: currentOrigin,
          description: metaDescription,
        };

  return (
    <Helmet>
      {/* 1. Basic Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* 2. Open Graph (Facebook, WhatsApp, LinkedIn, Pinterest) */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title || fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {metaImage && <meta property="og:image" content={metaImage} />}
      {metaImage && <meta property="og:image:alt" content={title || fullTitle} />}
      <meta property="og:locale" content="en_US" />

      {/* Article Specific Open Graph Tags */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}
      {type === "article" && category && (
        <meta property="article:section" content={category} />
      )}
      {type === "article" &&
        Array.isArray(tags) &&
        tags.map((tag, i) => (
          <meta key={i} property="article:tag" content={tag} />
        ))}

      {/* 3. Twitter / X Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {metaImage && <meta name="twitter:image" content={metaImage} />}
      {author && <meta name="twitter:creator" content={author} />}

      {/* 4. Google Rich Snippet JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default SEO;
