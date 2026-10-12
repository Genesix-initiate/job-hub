import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, CheckCircle2, XCircle, Search } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { JobCategory } from '../../../types/database';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('Briefcase');

  useEffect(() => {
    // Fetch categories from supabase or initial seed
    supabase
      .from('job_categories')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCategories(data as JobCategory[]);
        } else {
          // Standard fallback 20 sectors
          setCategories([
            { id: 'cat-1', name: 'Information Technology', slug: 'information-technology', description: 'Software engineering, cloud infrastructure, AI', icon: 'Code', is_active: true, created_at: '', updated_at: '' },
            { id: 'cat-2', name: 'Healthcare & Medicine', slug: 'healthcare-medicine', description: 'Clinical medicine, nursing, biomedical research', icon: 'HeartPulse', is_active: true, created_at: '', updated_at: '' },
            { id: 'cat-3', name: 'Banking & Financial Services', slug: 'banking-financial-services', description: 'Fintech, corporate banking, quantitative trading', icon: 'Landmark', is_active: true, created_at: '', updated_at: '' },
            { id: 'cat-4', name: 'Engineering & Construction', slug: 'engineering-construction', description: 'Civil, electrical, architectural engineering', icon: 'HardHat', is_active: true, created_at: '', updated_at: '' },
            { id: 'cat-5', name: 'Marketing & Growth', slug: 'marketing-growth', description: 'Brand strategy, SEO, performance campaigns', icon: 'Megaphone', is_active: true, created_at: '', updated_at: '' },
          ]);
        }
      });
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const created: JobCategory = {
      id: `cat-${Date.now()}`,
      name: newName,
      slug: newName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: newDesc,
      icon: newIcon,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCategories([created, ...categories]);
    setShowAddModal(false);
    setNewName('');
    setNewDesc('');
  };

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-rose-400" />
            Job Categories Taxonomy
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardized employment industry sectors used for filtering and search indexing
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Sector</span>
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full sm:w-80 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Sector Name</th>
                <th className="py-3 px-4">Slug Identifier</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Active State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-semibold text-white">{cat.name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{cat.slug}</td>
                  <td className="py-3.5 px-4 text-slate-400">{cat.description}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Add Employment Category</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-mono">Category Title</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Renewable Energy & CleanTech"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-mono">Scope Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe positions covered..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
