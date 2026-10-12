import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Clock,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Play,
} from 'lucide-react';

export function AssessmentsListPage() {
  const navigate = useNavigate();

  const assessments = [
    {
      id: 'assess-001',
      title: 'Advanced TypeScript & Modern React Evaluation',
      jobTitle: 'Senior Full-Stack TypeScript Engineer',
      durationMinutes: 30,
      questionsCount: 5,
      passingScore: 75,
      status: 'available',
      score: null,
    },
    {
      id: 'assess-002',
      title: 'Cloud Architecture & Docker Containers',
      jobTitle: 'DevOps & Kubernetes Specialist',
      durationMinutes: 25,
      questionsCount: 5,
      passingScore: 70,
      status: 'completed',
      score: 92,
      passed: true,
      completedAt: '2026-09-28',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">
          Skills Verification
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
          Technical Assessments
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Standardized skill evaluations assigned by prospective employers to fast-track interview decisions.
        </p>
      </div>

      <div className="space-y-4">
        {assessments.map((ass) => (
          <div
            key={ass.id}
            className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{ass.title}</h3>
                {ass.status === 'completed' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Score: {ass.score}% (Passed)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Ready to Take
                  </span>
                )}
              </div>

              <p className="text-xs text-emerald-400 font-medium">Assigned for: {ass.jobTitle}</p>

              <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {ass.durationMinutes} Minutes
                </span>
                <span>&bull;</span>
                <span>{ass.questionsCount} Evaluative Questions</span>
                <span>&bull;</span>
                <span>Passing threshold: {ass.passingScore}%</span>
              </div>
            </div>

            <div>
              {ass.status === 'available' ? (
                <button
                  onClick={() => navigate(`/job-seeker/assessments/${ass.id}`)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/15"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Assessment</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/job-seeker/assessments/${ass.id}?view=results`)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-medium border border-slate-700 transition cursor-pointer"
                >
                  View Performance
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
