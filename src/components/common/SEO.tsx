import React, { useEffect } from 'react';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string | null;
  noindex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';
const DEFAULT_SITE_NAME = 'JOBHUB powered by genesix initiate group ltd';

export function SEO({
  title,
  description,
  canonicalPath,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  noindex = false,
  breadcrumbs,
  jsonLd,
}: SEOProps) {
  const activeImage = ogImage || DEFAULT_BANNER;

  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title.includes(DEFAULT_SITE_NAME) ? title : `${title} | ${DEFAULT_SITE_NAME}`;
    document.title = formattedTitle;

    // Helper function to create or update meta tags
    const setMetaTag = (attribute: 'name' | 'property', attrValue: string, contentValue: string) => {
      let element = document.querySelector(`meta[${attribute}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // Helper function to create or update link tags
    const setLinkTag = (rel: string, hrefValue: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute(rel, rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', hrefValue);
    };

    // Determine Canonical URL
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const resolvedCanonical = canonicalUrl || `${origin}${canonicalPath || currentPath}`;

    // 2. Standard Search Meta
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large');
    setLinkTag('canonical', resolvedCanonical);

    // 3. OpenGraph Social Cards
    setMetaTag('property', 'og:site_name', DEFAULT_SITE_NAME);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', resolvedCanonical);
    setMetaTag('property', 'og:image', activeImage);

    // 4. Twitter / X Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', activeImage);

    // 5. Schema.org JSON-LD Structured Data
    const scriptsToInject: Array<Record<string, unknown>> = [];

    // Optional BreadcrumbList schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      scriptsToInject.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.path.startsWith('http') ? crumb.path : `${origin}${crumb.path}`,
        })),
      });
    }

    // Additional custom JSON-LD schemas
    if (jsonLd) {
      if (Array.isArray(jsonLd)) {
        scriptsToInject.push(...jsonLd);
      } else {
        scriptsToInject.push(jsonLd);
      }
    }

    // Inject JSON-LD Script tag
    let scriptTag = document.getElementById('dynamic-seo-jsonld') as HTMLScriptElement | null;
    if (scriptsToInject.length > 0) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'dynamic-seo-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(
        scriptsToInject.length === 1 ? scriptsToInject[0] : scriptsToInject
      );
    } else if (scriptTag) {
      scriptTag.remove();
    }

    // Cleanup on component unmount
    return () => {
      // Intentionally leave tags or let subsequent page update them to avoid flicker
    };
  }, [title, description, canonicalPath, canonicalUrl, ogType, ogImage, noindex, breadcrumbs, jsonLd]);

  return null;
}

// ---------------------------------------------------------
// Helper Schema Generators for Standard Rich Snippet Types
// ---------------------------------------------------------

export function buildJobPostingSchema(job: {
  title: string;
  description: string;
  created_at: string;
  employment_type?: string | null;
  work_mode?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  salary_period?: string | null;
  company?: {
    company_name?: string | null;
    logo_url?: string | null;
    website_url?: string | null;
  } | null;
}, url: string): Record<string, unknown> {
  const employmentTypeMap: Record<string, string> = {
    full_time: 'FULL_TIME',
    part_time: 'PART_TIME',
    contract: 'CONTRACTOR',
    internship: 'INTERN',
    freelance: 'OTHER',
  };

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.created_at,
    directApply: true,
    url,
    employmentType: job.employment_type ? employmentTypeMap[job.employment_type] || 'FULL_TIME' : 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company?.company_name || 'JOBHUB Partner',
      sameAs: job.company?.website_url || undefined,
      logo: job.company?.logo_url || undefined,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.city || 'Remote',
        addressRegion: job.state || undefined,
        addressCountry: job.country || 'Global',
      },
    },
  };

  if (job.work_mode === 'remote') {
    schema.jobLocationType = 'TELECOMMUTE';
    schema.applicantLocationRequirements = {
      '@type': 'Country',
      name: job.country || 'Global',
    };
  }

  if (job.salary_min) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: job.salary_currency || 'USD',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salary_min,
        maxValue: job.salary_max || job.salary_min,
        unitText: (job.salary_period || 'year').toUpperCase(),
      },
    };
  }

  return schema;
}

export function buildOrganizationSchema(company: {
  company_name: string;
  description?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  industry?: string | null;
  city?: string | null;
  country?: string | null;
  company_size?: string | null;
}, url: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.company_name,
    description: company.description || undefined,
    url,
    logo: company.logo_url || undefined,
    sameAs: company.website_url ? [company.website_url] : [],
    knowsAbout: company.industry || undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: company.city || 'Global',
      addressCountry: company.country || 'Global',
    },
    numberOfEmployees: company.company_size ? {
      '@type': 'QuantitativeValue',
      value: company.company_size,
    } : undefined,
  };
}

export function buildArticleSchema(article: {
  title: string;
  summary: string;
  publishedAt: string;
  image?: string;
  slug: string;
  category?: string;
}, url: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.summary,
    image: article.image ? [article.image] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    articleSection: article.category,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@type': 'Organization',
      name: 'JOBHUB Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'JOBHUB powered by genesix initiate group ltd',
      logo: {
        '@type': 'ImageObject',
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
      },
    },
  };
}
