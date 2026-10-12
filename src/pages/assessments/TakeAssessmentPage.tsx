import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Award,
  Check,
} from 'lucide-react';

export function TakeAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isViewResults = searchParams.get('view') === 'results';

  const [hasStarted, setHasStarted] = useState(isViewResults);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState(isViewResults);
  const [finalScore, setFinalScore] = useState<number | null>(isViewResults ? 92 : null);

  const questions = [
    {
      id: 1,
      question: 'Which TypeScript utility type constructs a type with all properties of Type set to optional?',
      options: ['Partial<Type>', 'Required<Type>', 'Readonly<Type>', 'Pick<Type, Keys>'],
      correctIndex: 0,
    },
    {
      id: 2,
      question: 'In React 19, what happens when a Server Action throws an unhandled exception?',
      options: [
        'The entire page unmounts immediately',
        'The error boundaries catch the failure and optimistic updates roll back safely',
        'The database transaction commits regardless',
        'React restarts the client browser session',
      ],
      correctIndex: 1,
    },
    {
      id: 3,
      question: 'What is the primary architectural purpose of Row Level Security (RLS) in PostgreSQL?',
      options: [
        'To speed up index lookups on secondary foreign keys',
        'To restrict database rows accessible by individual database queries based on current user session privileges',
        'To compress disk storage usage for JSONB columns',
        'To auto-generate UUID primary keys',
      ],
      correctIndex: 1,
    },
    {
      id: 4,
      question: 'What is the standard time complexity for searching a PostgreSQL table with an active B-Tree index?',
      options: ['O(N)', 'O(log N)', 'O(1)', 'O(N^2)'],
      correctIndex: 1,
    },
  ];

  // Countdown timer
  useEffect(() => {
    if (!hasStarted || isSubmitted) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isSubmitted]);

  const handleFinishExam = () => {
    // Calculate score deterministically
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      if (selected === q.options[q.correctIndex]) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setFinalScore(calculatedScore);
    setIsSubmitted(true);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!hasStarted) {
    return (
      <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-6 animate-in fade-in">
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Award className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Advanced TypeScript &amp; React Evaluation
          </h1>
          <p className="text-xs text-slate-400">
            Assigned for: Senior Full-Stack TypeScript Engineer
          </p>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs text-slate-300">
          <h3 className="font-semibold text-white">Instructions &amp; Exam Policy:</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>You have 30 minutes to complete 4 multiple-choice technical questions.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Answers are automatically recorded as you move through questions.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Passing score threshold is set to 75%.</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => navigate('/job-seeker/assessments')}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cancel &amp; Return
          </button>
          <button
            onClick={() => setHasStarted(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Begin Assessment
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    const passed = (finalScore || 0) >= 75;
    return (
      <div className="max-w-xl mx-auto bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-5 animate-in fade-in">
        <div
          className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto ${
            passed ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}
        >
          {passed ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">
            {passed ? 'Assessment Completed & Passed!' : 'Assessment Completed'}
          </h2>
          <p className="text-xs text-slate-400">
            Your results have been securely recorded and linked to your candidate profile.
          </p>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 inline-block text-center min-w-[200px]">
          <span className="text-xs text-slate-500 block">Overall Score</span>
          <span className="text-3xl font-extrabold text-emerald-400">{finalScore}%</span>
          <span className="text-[11px] text-slate-400 block mt-1">Passing requirement: 75%</span>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate('/job-seeker/assessments')}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs transition"
          >
            Back to Assessments List
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      {/* Timer Bar */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-xs">
        <span className="font-semibold text-white">
          Question {currentQIndex + 1} of {questions.length}
        </span>
        <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTimer(timeRemaining)}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
        <h3 className="text-base font-semibold text-white leading-relaxed">
          {currentQ.question}
        </h3>

        <div className="space-y-3">
          {currentQ.options.map((opt, oIdx) => {
            const isSelected = selectedAnswers[currentQIndex] === opt;
            return (
              <label
                key={oIdx}
                className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition text-xs ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-white font-medium'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQIndex}`}
                  checked={isSelected}
                  onChange={() => setSelectedAnswers({ ...selectedAnswers, [currentQIndex]: opt })}
                  className="text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            disabled={currentQIndex === 0}
            onClick={() => setCurrentQIndex((i) => i - 1)}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs disabled:opacity-40 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentQIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQIndex((i) => i + 1)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinishExam}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <span>Submit Assessment</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
