import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { CareerResource } from '../../../types/database';
import { useAuth } from '../../../context/AuthContext';

export function AdminCareerResourcesPage() {
  const { profile: currentAdmin } = useAuth();
  const [resources, setResources] = useState<CareerResource[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<CareerResource | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Editor form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('CV Writing');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [readTime, setReadTime] = useState('5 min read');
  const [author, setAuthor] = useState('JOBHUB Editorial');
  const [isPublished, setIsPublished] = useState(true);

  const fetchArticles = async () => {
    const list = await adminService.getCareerResources();
    setResources(list);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const openNewArticle = () => {
    setSelectedArticle(null);
    setTitle('');
    setCategory('CV Writing');
    setSummary('');
    setContent('');
    setImageUrl('https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800');
    setReadTime('6 min read');
    setAuthor('JOBHUB Editorial');
    setIsPublished(true);
    setIsEditorOpen(true);
  };

  const openEditArticle = (art: CareerResource) => {
    setSelectedArticle(art);
    setTitle(art.title);
    setCategory(art.category);
    setSummary(art.summary);
    setContent(art.content);
    setImageUrl(art.image_url || '');
    setReadTime(art.read_time || '5 min read');
    setAuthor(art.author || 'JOBHUB Editorial');
    setIsPublished(art.is_published);
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.saveCareerResource(
      {
        id: selectedArticle?.id,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        summary,
        content,
        image_url: imageUrl,
        read_time: readTime,
        author,
        is_published: isPublished,
        tags: [category, 'Career Advice'],
      },
      currentAdmin?.id || 'admin'
    );
    setIsEditorOpen(false);
    fetchArticles();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-rose-400" />
            Career Resources Content Management (CMS)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Author and publish educational guides, interview blueprints, and compensation benchmark articles
          </p>
        </div>

        <button
          onClick={openNewArticle}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Author New Guide</span>
        </button>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((art) => (
          <div
            key={art.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition flex flex-col justify-between shadow-sm"
          >
            <div>
              {art.image_url && (
                <img
                  src={art.image_url}
                  alt={art.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {art.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{art.read_time}</span>
                </div>

                <h3 className="font-bold text-white text-sm line-clamp-2">{art.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{art.summary}</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-mono">By {art.author}</span>
              <button
                onClick={() => openEditArticle(art)}
                className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Article</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-white text-base">
              {selectedArticle ? 'Edit Career Article' : 'Author New Career Guide'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-mono">Article Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Master the Distributed Systems Interview in 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-mono">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="CV Writing">CV Writing</option>
                    <option value="Interview Prep">Interview Prep</option>
                    <option value="Salary & Compensation">Salary & Compensation</option>
                    <option value="Career Transition">Career Transition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-mono">Estimated Read Time</label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-mono">Header Cover Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-mono">Executive Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-mono">Full Markdown Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded text-rose-500"
                  />
                  <span>Publish live immediately to Career Resources</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-3 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer"
                  >
                    Save & Dispatch
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
