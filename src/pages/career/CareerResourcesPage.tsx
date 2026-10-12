import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Calendar, ArrowRight, User, Sparkles, ArrowLeft } from 'lucide-react';
import { SEO, buildArticleSchema } from '../../components/common/SEO';

interface ArticleItem {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  publishedAt: string;
  image: string;
  summary: string;
}

const ARTICLES: ArticleItem[] = [
  {
    slug: 'how-to-write-a-high-impact-tech-resume',
    title: 'How to Write a High-Impact Engineering CV in 2026',
    category: 'CV Writing',
    readTime: '6 min read',
    publishedAt: 'Oct 2, 2026',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600',
    summary: 'Learn how modern Applicant Tracking Systems (ATS) evaluate project contributions, metrics, and technical keywords.',
  },
  {
    slug: 'acing-system-design-interview',
    title: 'Acing the Senior Architecture & System Design Interview',
    category: 'Interview Prep',
    readTime: '9 min read',
    publishedAt: 'Sep 24, 2026',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600',
    summary: 'A structured blueprint for answering scalability, data modeling, and latency tradeoffs during executive interviews.',
  },
  {
    slug: 'negotiating-compensation-packages',
    title: 'Navigating Salary & Equity Negotiation with Confidence',
    category: 'Salary & Compensation',
    readTime: '5 min read',
    publishedAt: 'Sep 18, 2026',
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600',
    summary: 'Proven strategies to benchmark total target compensation, equity vesting schedules, and remote work bonuses.',
  },
];

export function CareerResourcesPage() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  const selectedArticle = slug ? ARTICLES.find((a) => a.slug === slug) : null;

  if (selectedArticle) {
    const canonical = typeof window !== 'undefined'
      ? `${window.location.origin}/career-resources/${selectedArticle.slug}`
      : `/career-resources/${selectedArticle.slug}`;

    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
        <SEO
          title={`${selectedArticle.title}`}
          description={selectedArticle.summary}
          canonicalPath={`/career-resources/${selectedArticle.slug}`}
          ogType="article"
          ogImage={selectedArticle.image}
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Career Resources', path: '/career-resources' },
            { name: selectedArticle.title, path: `/career-resources/${selectedArticle.slug}` },
          ]}
          jsonLd={buildArticleSchema(selectedArticle, canonical)}
        />

        <button
          onClick={() => navigate('/career-resources')}
          className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all guides</span>
        </button>

        <article className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-6">
          <img
            src={selectedArticle.image}
            alt={selectedArticle.title}
            className="w-full h-64 object-cover"
          />

          <div className="p-6 sm:p-8 space-y-4">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              {selectedArticle.category}
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {selectedArticle.title}
            </h1>

            <div className="flex items-center gap-3 text-xs text-slate-400 border-b border-slate-800 pb-4">
              <span>Published {selectedArticle.publishedAt}</span>
              <span>&bull;</span>
              <span>{selectedArticle.readTime}</span>
            </div>

            <div className="text-xs text-slate-300 space-y-4 leading-relaxed pt-2">
              <p>
                In the modern technology job market, hiring managers and algorithmic screening tools filter through hundreds of resumes per role. Understanding how to structure your narrative is essential.
              </p>
              <h2 className="text-sm font-bold text-white pt-2">1. Quantify Real Business Value</h2>
              <p>
                Avoid generic task descriptions like &ldquo;built web components&rdquo;. Instead, emphasize business metrics: &ldquo;Architected automated caching layer reducing API response latency by 42% across 2M daily active users.&rdquo;
              </p>
              <h2 className="text-sm font-bold text-white pt-2">2. Match Keywords Deterministically</h2>
              <p>
                Employers search for specific frameworks, cloud providers, and architectural methodologies. Include relevant terms in your skills taxonomy and job descriptions.
              </p>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      <SEO
        title="Career Guides & Technical Interview Prep"
        description="Actionable playbooks on tech CV writing, system design interview prep, and salary negotiation from JOBHUB powered by genesix initiate group ltd."
        canonicalPath="/career-resources"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Career Resources', path: '/career-resources' },
        ]}
      />

      <div>
        <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">
          Career Development Hub
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
          Career Resources &amp; Guides
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Curated guides on technical CV structuring, salary benchmarking, and behavioral interview success.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ARTICLES.map((art) => (
          <div
            key={art.slug}
            onClick={() => navigate(`/career-resources/${art.slug}`)}
            className="group bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl overflow-hidden transition cursor-pointer flex flex-col justify-between shadow-sm"
          >
            <div>
              <img
                src={art.image}
                alt={art.title}
                className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="p-5 space-y-2">
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                  {art.category}
                </span>
                <h2 className="text-sm font-bold text-white group-hover:text-emerald-400 transition tracking-tight line-clamp-2">
                  {art.title}
                </h2>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {art.summary}
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80">
              <span>{art.readTime}</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1 group-hover:translate-x-1 transition">
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
