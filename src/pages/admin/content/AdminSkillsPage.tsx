import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Search } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Skill } from '../../../types/database';

export function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState('');
  const [newSkillName, setNewSkillName] = useState('');

  useEffect(() => {
    supabase
      .from('skills')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSkills(data as Skill[]);
        } else {
          setSkills([
            { id: 'sk-1', name: 'TypeScript', slug: 'typescript', category_id: null, is_active: true, created_at: '', updated_at: '' },
            { id: 'sk-2', name: 'React', slug: 'react', category_id: null, is_active: true, created_at: '', updated_at: '' },
            { id: 'sk-3', name: 'PostgreSQL', slug: 'postgresql', category_id: null, is_active: true, created_at: '', updated_at: '' },
            { id: 'sk-4', name: 'Kubernetes', slug: 'kubernetes', category_id: null, is_active: true, created_at: '', updated_at: '' },
            { id: 'sk-5', name: 'Financial Modeling', slug: 'financial-modeling', category_id: null, is_active: true, created_at: '', updated_at: '' },
            { id: 'sk-6', name: 'Clinical Patient Care', slug: 'clinical-patient-care', category_id: null, is_active: true, created_at: '', updated_at: '' },
          ]);
        }
      });
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const newSk: Skill = {
      id: `sk-${Date.now()}`,
      name: newSkillName.trim(),
      slug: newSkillName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category_id: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSkills([newSk, ...skills]);
    setNewSkillName('');
  };

  const filtered = skills.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Skills Taxonomy & Keyword Index
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global standardized competency dictionary for resume parsing and candidate matching
          </p>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search verified skills..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Add new skill keyword..."
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap gap-2">
          {filtered.map((s) => (
            <span
              key={s.id}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 font-medium flex items-center gap-2 group transition"
            >
              <span>{s.name}</span>
              <span className="text-[10px] font-mono text-slate-500">{s.slug}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
