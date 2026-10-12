import React, { useState } from 'react';
import {
  FileText,
  Save,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Layers,
  Globe,
  Briefcase,
  HelpCircle,
  LayoutTemplate,
  Info,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  landingContentService,
  LandingPageContent,
  DEFAULT_LANDING_CONTENT,
} from '../../../lib/landingContentService';
import { SEO } from '../../../components/common/SEO';

export function AdminLandingPageCMS() {
  const { adminRole, hasAdminPermission } = useAuth();
  const [content, setContent] = useState<LandingPageContent>(() =>
    landingContentService.getLandingContent()
  );
  const [activeTab, setActiveTab] = useState<
    'topBar' | 'hero' | 'portals' | 'nigeria' | 'footer'
  >('hero');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const canEdit =
    adminRole === 'super_admin' ||
    adminRole === 'admin' ||
    adminRole === 'content_admin' ||
    adminRole === 'content_manager' ||
    hasAdminPermission('manage_content');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    landingContentService.saveLandingContent(content);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all landing page details to the system defaults?'
      )
    ) {
      const reset = landingContentService.resetLandingContent();
      setContent(reset);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      <SEO
        title="Landing Page CMS | Admin Governance | JOBHUB"
        description="Edit and manage public landing page copy, headlines, metrics, and portal details."
        canonicalPath="/admin/content/landing-page"
        noindex={true}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
              CMS EDITOR
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Role: <strong className="text-white capitalize">{adminRole.replace('_', ' ')}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Landing Page CMS &amp; Content Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Edit all public website headlines, metrics, portal features, and Africa tech corridor details.
            Changes take effect across the website instantly.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
          >
            <span>Preview Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-rose-500/30 text-rose-400 hover:bg-rose-950/40 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            title="Reset to default copy"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!canEdit}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Landing page updated successfully! The public website reflects these changes live.</span>
        </div>
      )}

      {resetSuccess && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Landing page copy has been reset to official system defaults.</span>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'hero'
              ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Hero &amp; Metrics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('portals')}
          className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'portals'
              ? 'bg-slate-900 text-indigo-400 border-t-2 border-indigo-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Portals Hub</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('nigeria')}
          className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'nigeria'
              ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Nigeria Talent Hub</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('topBar')}
          className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'topBar'
              ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Top Announcement Bar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('footer')}
          className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'footer'
              ? 'bg-slate-900 text-rose-400 border-t-2 border-rose-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Footer &amp; Branding</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: HERO & METRICS */}
        {activeTab === 'hero' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Hero Section Headlines &amp; Calls-to-Action
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure primary value proposition, taglines, search placeholder, and action links.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Hero Pill Announcement
                </label>
                <input
                  type="text"
                  value={content.hero.badge}
                  onChange={(e) =>
                    setContent({ ...content, hero: { ...content.hero, badge: e.target.value } })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Hero Pill Subtext / Sponsor
                </label>
                <input
                  type="text"
                  value={content.hero.poweredBy}
                  onChange={(e) =>
                    setContent({ ...content, hero: { ...content.hero, poweredBy: e.target.value } })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Headline Formulation (3 Components: Prefix + Highlight + Suffix)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Prefix Text</span>
                  <input
                    type="text"
                    value={content.hero.headlinePrefix}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, headlinePrefix: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Highlighted Gradient Text</span>
                  <input
                    type="text"
                    value={content.hero.headlineHighlight}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, headlineHighlight: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-emerald-300 focus:outline-none focus:border-emerald-400 font-semibold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Suffix Text</span>
                  <input
                    type="text"
                    value={content.hero.headlineSuffix}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, headlineSuffix: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hero Subtitle Paragraph
              </label>
              <textarea
                rows={3}
                value={content.hero.subtitle}
                onChange={(e) =>
                  setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Search Input Placeholder
              </label>
              <input
                type="text"
                value={content.hero.searchPlaceholder}
                onChange={(e) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, searchPlaceholder: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">Primary Action Button</span>
                <input
                  type="text"
                  placeholder="Button Label"
                  value={content.hero.primaryCtaText}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, primaryCtaText: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white mb-1.5"
                />
                <input
                  type="text"
                  placeholder="Destination Path"
                  value={content.hero.primaryCtaLink}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, primaryCtaLink: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">Secondary Action Button</span>
                <input
                  type="text"
                  placeholder="Button Label"
                  value={content.hero.secondaryCtaText}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, secondaryCtaText: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white mb-1.5"
                />
                <input
                  type="text"
                  placeholder="Destination Path"
                  value={content.hero.secondaryCtaLink}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, secondaryCtaLink: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono"
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                Trust Badges &amp; Live Key Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-400 block font-mono">Metric 1</span>
                  <input
                    type="text"
                    value={content.hero.metric1_value}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, metric1_value: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-bold"
                  />
                  <input
                    type="text"
                    value={content.hero.metric1_label}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, metric1_label: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-400 block font-mono">Metric 2</span>
                  <input
                    type="text"
                    value={content.hero.metric2_value}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, metric2_value: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-emerald-400 font-bold"
                  />
                  <input
                    type="text"
                    value={content.hero.metric2_label}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, metric2_label: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-400 block font-mono">Metric 3</span>
                  <input
                    type="text"
                    value={content.hero.metric3_value}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, metric3_value: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-cyan-400 font-bold"
                  />
                  <input
                    type="text"
                    value={content.hero.metric3_label}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, metric3_label: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-400 block font-mono">Metric 4</span>
                  <input
                    type="text"
                    value={content.hero.metric4_value}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, metric4_value: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-indigo-400 font-bold"
                  />
                  <input
                    type="text"
                    value={content.hero.metric4_label}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, metric4_label: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PORTALS HUB */}
        {activeTab === 'portals' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Portals Hub &amp; Workspaces Section
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize candidate and employer portal descriptions, bullet points, and CTA button copy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Section Badge</label>
                <input
                  type="text"
                  value={content.portalsHub.badge}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      portalsHub: { ...content.portalsHub, badge: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Section Heading</label>
                <input
                  type="text"
                  value={content.portalsHub.title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      portalsHub: { ...content.portalsHub, title: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Section Subtitle</label>
              <textarea
                rows={2}
                value={content.portalsHub.subtitle}
                onChange={(e) =>
                  setContent({
                    ...content,
                    portalsHub: { ...content.portalsHub, subtitle: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            {/* Candidate Portal Card */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/20 space-y-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                Portal 01: Candidate / Job Seeker Card
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Card Title"
                  value={content.portalsHub.candidateTitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      portalsHub: { ...content.portalsHub, candidateTitle: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                />
                <input
                  type="text"
                  placeholder="Button Label"
                  value={content.portalsHub.candidateCtaText}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      portalsHub: { ...content.portalsHub, candidateCtaText: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-300 font-semibold"
                />
              </div>

              <textarea
                rows={2}
                placeholder="Card Description"
                value={content.portalsHub.candidateDescription}
                onChange={(e) =>
                  setContent({
                    ...content,
                    portalsHub: { ...content.portalsHub, candidateDescription: e.target.value },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />

              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Card Feature Links / Bullets:</span>
                {[1, 2, 3, 4, 5].map((i) => {
                  const key = `candidateBullet${i}` as keyof typeof content.portalsHub;
                  return (
                    <input
                      key={key}
                      type="text"
                      value={content.portalsHub[key] as string}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          portalsHub: { ...content.portalsHub, [key]: e.target.value },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 mb-1"
                    />
                  );
                })}
              </div>
            </div>

            {/* Employer Portal Card */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-indigo-500/20 space-y-4">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                Portal 02: Employer / Recruiter Suite Card
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Card Title"
                  value={content.portalsHub.employerTitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      portalsHub: { ...content.portalsHub, employerTitle: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                />
                <input
                  type="text"
                  placeholder="Button Label"
                  value={content.portalsHub.employerCtaText}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      portalsHub: { ...content.portalsHub, employerCtaText: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-indigo-300 font-semibold"
                />
              </div>

              <textarea
                rows={2}
                placeholder="Card Description"
                value={content.portalsHub.employerDescription}
                onChange={(e) =>
                  setContent({
                    ...content,
                    portalsHub: { ...content.portalsHub, employerDescription: e.target.value },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />

              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Card Feature Links / Bullets:</span>
                {[1, 2, 3, 4, 5].map((i) => {
                  const key = `employerBullet${i}` as keyof typeof content.portalsHub;
                  return (
                    <input
                      key={key}
                      type="text"
                      value={content.portalsHub[key] as string}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          portalsHub: { ...content.portalsHub, [key]: e.target.value },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 mb-1"
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NIGERIA & AFRICA TECH CORRIDOR */}
        {activeTab === 'nigeria' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Nigeria &amp; African Tech Corridor Spotlight
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage the Nigerian tech ecosystem section, Naira compensation highlights, and NYSC/graduate trainee copy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Section Badge</label>
                <input
                  type="text"
                  value={content.nigeriaEcosystem.badge}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      nigeriaEcosystem: { ...content.nigeriaEcosystem, badge: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Section Title</label>
                <input
                  type="text"
                  value={content.nigeriaEcosystem.title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      nigeriaEcosystem: { ...content.nigeriaEcosystem, title: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Section Subtitle</label>
              <textarea
                rows={2}
                value={content.nigeriaEcosystem.subtitle}
                onChange={(e) =>
                  setContent({
                    ...content,
                    nigeriaEcosystem: { ...content.nigeriaEcosystem, subtitle: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={content.nigeriaEcosystem.ctaText}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      nigeriaEcosystem: { ...content.nigeriaEcosystem, ctaText: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">CTA Destination Link</label>
                <input
                  type="text"
                  value={content.nigeriaEcosystem.ctaLink}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      nigeriaEcosystem: { ...content.nigeriaEcosystem, ctaLink: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono"
                />
              </div>
            </div>

            {/* 3 Ecosystem Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-emerald-400 font-mono block">Feature Card 1 (Naira Salaries)</span>
                <input
                  type="text"
                  value={content.nigeriaEcosystem.card1_title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      nigeriaEcosystem: { ...content.nigeriaEcosystem, card1_title: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                />
                <textarea
                  rows={3}
                  value={content.nigeriaEcosystem.card1_desc}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      nigeriaEcosystem: { ...content.nigeriaEcosystem, card1_desc: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
                />
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-indigo-400 font-mono block">Feature Card 2 (NYSC &amp; Trainees)</span>
                <input
                  type="text"
                  value={content.nigeriaEcosystem.card2_title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      nigeriaEcosystem: { ...content.nigeriaEcosystem, card2_title: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                />
                <textarea
                  rows={3}
                  value={content.nigeriaEcosystem.card2_desc}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      nigeriaEcosystem: { ...content.nigeriaEcosystem, card2_desc: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
                />
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-cyan-400 font-mono block">Feature Card 3 (Unicorns)</span>
                <input
                  type="text"
                  value={content.nigeriaEcosystem.card3_title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      nigeriaEcosystem: { ...content.nigeriaEcosystem, card3_title: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                />
                <textarea
                  rows={3}
                  value={content.nigeriaEcosystem.card3_desc}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      nigeriaEcosystem: { ...content.nigeriaEcosystem, card3_desc: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TOP ANNOUNCEMENT BAR */}
        {activeTab === 'topBar' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                Top Notification Bar Copy
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                The top announcement strip that appears above the navigation header.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Announcement Text
                </label>
                <input
                  type="text"
                  value={content.topBar.announcement}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      topBar: { ...content.topBar, announcement: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Powered By Tagline
                </label>
                <input
                  type="text"
                  value={content.topBar.poweredBy}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      topBar: { ...content.topBar, poweredBy: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Automation Feed Button Text
                </label>
                <input
                  type="text"
                  value={content.topBar.emailLiveText}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      topBar: { ...content.topBar, emailLiveText: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-indigo-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FOOTER & BRANDING */}
        {activeTab === 'footer' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-rose-400" />
                Footer Details &amp; Compliance Badges
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Brand title, footer copyright, mission statement, and regulatory badges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={content.footer.brandName}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footer: { ...content.footer, brandName: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Brand Parent Company / Sponsor
                </label>
                <input
                  type="text"
                  value={content.footer.brandPoweredBy}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footer: { ...content.footer, brandPoweredBy: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-indigo-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Footer Tagline Statement
              </label>
              <textarea
                rows={2}
                value={content.footer.tagline}
                onChange={(e) =>
                  setContent({
                    ...content,
                    footer: { ...content.footer, tagline: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Copyright Notice
              </label>
              <input
                type="text"
                value={content.footer.copyright}
                onChange={(e) =>
                  setContent({
                    ...content,
                    footer: { ...content.footer, copyright: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Badge 1</label>
                <input
                  type="text"
                  value={content.footer.badge1}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footer: { ...content.footer, badge1: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Badge 2</label>
                <input
                  type="text"
                  value={content.footer.badge2}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footer: { ...content.footer, badge2: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Badge 3</label>
                <input
                  type="text"
                  value={content.footer.badge3}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footer: { ...content.footer, badge3: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live CMS updates are dispatched instantly across all tabs.</span>
          </div>

          <button
            type="submit"
            disabled={!canEdit}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
