import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Upload,
  CheckCircle2,
  Trash2,
  Copy,
  Eye,
  Download,
  Star,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';
import { Resume } from '../../types/database';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';

export function CvListPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [cvTitle, setCvTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      loadResumes();
    }
  }, [profile?.id]);

  const loadResumes = async () => {
    if (!profile) return;
    setIsLoading(true);
    const list = await dataService.getResumes(profile.id);
    setResumes(list);
    setIsLoading(false);
  };

  const handleSetPrimary = async (resumeId: string) => {
    if (!profile) return;
    const updated = resumes.map((r) => ({
      ...r,
      is_primary: r.id === resumeId,
    }));
    setResumes(updated);
    localStorage.setItem(`jobhub_resumes_${profile.id}`, JSON.stringify(updated));
  };

  const handleDelete = async (resumeId: string) => {
    if (!profile) return;
    await dataService.deleteResume(profile.id, resumeId);
    setResumes((prev) => prev.filter((r) => r.id !== resumeId));
  };

  const handleDuplicate = async (resume: Resume) => {
    if (!profile) return;
    const dup = await dataService.createResume(profile.id, {
      title: `${resume.title} (Copy)`,
      summary: resume.summary,
      template_name: resume.template_name,
      is_primary: false,
    });
    setResumes((prev) => [dup, ...prev]);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !cvTitle) return;
    setIsUploading(true);
    const newCv = await dataService.createResume(profile.id, {
      title: cvTitle,
      summary: 'Uploaded CV Document',
      template_name: 'modern',
      file_url: 'https://example.com/uploads/sample-cv.pdf',
    });
    setResumes((prev) => [newCv, ...prev]);
    setIsUploading(false);
    setIsUploadModalOpen(false);
    setCvTitle('');
    setUploadFileName('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">
            Curriculum Vitae
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            My CVs &amp; Resumes
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create tailored CVs for different roles, select modern templates, and export PDF documents.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>

          <button
            onClick={() => navigate('/job-seeker/cv/create')}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New CV</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading your CV repository..." />
      ) : resumes.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-4">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No CVs created yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Build your first CV using our 11-step builder or upload an existing PDF.
          </p>
          <button
            onClick={() => navigate('/job-seeker/cv/create')}
            className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
          >
            Build First CV
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resumes.map((r) => (
            <div
              key={r.id}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1">
                    {r.is_primary ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <Star className="w-3 h-3 fill-emerald-400" />
                        Primary
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetPrimary(r.id)}
                        className="text-[11px] text-slate-400 hover:text-emerald-400 p-1 transition cursor-pointer"
                        title="Set as primary application CV"
                      >
                        Set Primary
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight mt-3">{r.title}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {r.summary || 'Custom resume profile tailored for enterprise roles.'}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Template: <strong className="text-slate-300 capitalize">{r.template_name || 'Modern'}</strong></span>
                  <span>{new Date(r.updated_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                <button
                  onClick={() => navigate(`/job-seeker/cv/create?id=${r.id}`)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  Edit in Builder
                </button>

                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={() => handleDuplicate(r)}
                    className="p-1.5 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    title="Duplicate CV"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                    title="Delete CV"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Existing CV Modal (Section 24) */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Existing Resume / CV"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Resume Label / Title</label>
            <input
              type="text"
              required
              value={cvTitle}
              onChange={(e) => setCvTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Resume (PDF)"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="border border-dashed border-slate-800 rounded-2xl p-6 text-center bg-slate-950/40">
            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <label className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition">
              <span>Choose PDF or Word Document</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setUploadFileName(f.name);
                    if (!cvTitle) setCvTitle(f.name.replace(/\.[^/.]+$/, ''));
                  }
                }}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-500 mt-2">Max file size: 15MB</p>
            {uploadFileName && (
              <div className="mt-2 text-emerald-400 font-medium flex items-center justify-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Selected: {uploadFileName}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !cvTitle}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Save to CV Manager'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
