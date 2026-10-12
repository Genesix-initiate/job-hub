import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Users,
  Search,
  ArrowRight,
  X,
  Award,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/employerService';
import { Assessment, AssessmentAttempt } from '../../../types/database';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export function EmployerAssessmentsPage() {
  const { company, profile } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    duration_minutes: 30,
    passing_score: 75,
  });

  const loadData = async () => {
    setIsLoading(true);
    const list = await employerService.getEmployerAssessments(company?.id);
    setAssessments(list);
    if (list.length > 0) {
      setSelectedAssessment(list[0]);
      const attList = await employerService.getAssessmentAttempts(list[0].id);
      setAttempts(attList);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [company?.id]);

  const handleSelectAssessment = async (asm: Assessment) => {
    setSelectedAssessment(asm);
    const attList = await employerService.getAssessmentAttempts(asm.id);
    setAttempts(attList);
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim()) return;

    await employerService.createAssessment({
      ...createForm,
      created_by: profile?.id || '00000000-0000-0000-0000-000000000201',
    });

    setCreateModalOpen(false);
    setCreateForm({ title: '', description: '', duration_minutes: 30, passing_score: 75 });
    loadData();
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Retrieving assessment modules and candidate results..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-indigo-400" />
            Skills Assessments & Candidate Testing
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create automated evaluation challenges, assign to applicants, and review scored submissions
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Assessment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment Modules List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Available Assessment Tests ({assessments.length})
          </h3>

          <div className="space-y-2.5">
            {assessments.map((asm) => {
              const isSelected = selectedAssessment?.id === asm.id;
              return (
                <div
                  key={asm.id}
                  onClick={() => handleSelectAssessment(asm)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/40 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white">{asm.title}</h4>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase shrink-0">
                      {asm.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {asm.duration_minutes}m
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-slate-500" /> Pass: {asm.passing_score}%
                    </span>
                    <span>•</span>
                    <span>{asm.questions_count || 10} Questions</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Assessment Details & Candidate Attempts (Section 48) */}
        <div className="lg:col-span-2 space-y-5">
          {selectedAssessment ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="pb-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">{selectedAssessment.title}</h2>
                  <span className="text-xs text-indigo-400 font-mono font-medium">
                    Passing Threshold: {selectedAssessment.passing_score}%
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedAssessment.description || 'Automated technical evaluation test.'}
                </p>
              </div>

              {/* Candidate Results Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Candidate Submissions & Results ({attempts.length})
                </h3>

                <div className="divide-y divide-slate-800/80">
                  {attempts.map((att) => {
                    const passed = att.score >= selectedAssessment.passing_score;
                    return (
                      <div key={att.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{att.applicant_name}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                passed
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5">
                            Submitted {att.submitted_at ? new Date(att.submitted_at).toLocaleDateString() : 'In progress'}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className={`text-base font-bold font-mono ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {att.score}%
                          </span>
                          <span className="block text-[10px] text-slate-500">Verified score</span>
                        </div>
                      </div>
                    );
                  })}

                  {attempts.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-500">
                      No candidate submissions recorded for this test yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-500">
              Select an assessment module on the left to review candidate results.
            </div>
          )}
        </div>
      </div>

      {/* Create Assessment Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-400" />
                Create New Assessment Challenge
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assessment Title *</label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="e.g. Distributed Database Architecture Assessment"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Instructions</label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Outline syllabus, topics evaluated, and guidelines for candidate completion..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time Limit (Mins)</label>
                  <input
                    type="number"
                    min="10"
                    value={createForm.duration_minutes}
                    onChange={(e) => setCreateForm({ ...createForm, duration_minutes: parseInt(e.target.value) || 30 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Passing Score (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={createForm.passing_score}
                    onChange={(e) => setCreateForm({ ...createForm, passing_score: parseInt(e.target.value) || 75 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 cursor-pointer"
                >
                  Save & Publish Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
