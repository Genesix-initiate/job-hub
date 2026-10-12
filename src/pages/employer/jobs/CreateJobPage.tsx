import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  GraduationCap,
  Sparkles,
  DollarSign,
  Gift,
  Settings2,
  HelpCircle,
  Eye,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  Building2,
  MapPin,
  Clock,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/employerService';
import { SEED_CATEGORIES, SEED_SKILLS } from '../../../lib/dataService';
import { Job, ApplicationQuestion } from '../../../types/database';

export function CreateJobPage() {
  const navigate = useNavigate();
  const { company, profile } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [jobData, setJobData] = useState({
    title: '',
    department: '',
    category_id: 'cat-01',
    vacancies: 1,
    employment_type: 'full_time' as any,
    work_mode: 'remote' as any,
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    address: '100 Pine Street',

    // Description
    description: '',
    responsibilities: '',
    requirements: '',

    // Experience & Education
    experience_min: 3,
    experience_max: 7,
    education_requirement: "Bachelor's Degree",

    // Compensation
    salary_min: 130000,
    salary_max: 165000,
    salary_currency: 'USD',
    salary_period: 'year' as any,
    salary_visibility: 'visible' as 'visible' | 'hidden' | 'negotiable',

    // Application Settings
    application_deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'TypeScript',
    'React',
    'Node.js',
    'PostgreSQL',
  ]);
  const [skillSearch, setSkillSearch] = useState('');

  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([
    'Comprehensive Health & Dental Coverage',
    '401(k) Retirement Plan with Match',
    'Flexible Work from Anywhere Policy',
    'Annual Learning & Conference Stipend ($2,500)',
    'Unlimited Paid Time Off (PTO)',
  ]);

  const [questions, setQuestions] = useState<
    Array<{
      question_text: string;
      question_type: 'text' | 'yes_no' | 'single_choice' | 'multiple_choice' | 'number';
      is_required: boolean;
    }>
  >([
    {
      question_text: 'How many years of professional experience do you have with modern web architectures?',
      question_type: 'number',
      is_required: true,
    },
    {
      question_text: 'Are you authorized to work in the specified country without sponsorship?',
      question_type: 'yes_no',
      is_required: true,
    },
  ]);

  const isVerified = company?.verification_status === 'verified';

  const steps = [
    { num: 1, title: 'Basic Info', icon: Briefcase },
    { num: 2, title: 'Description', icon: FileText },
    { num: 3, title: 'Requirements', icon: GraduationCap },
    { num: 4, title: 'Skills', icon: Sparkles },
    { num: 5, title: 'Compensation', icon: DollarSign },
    { num: 6, title: 'Benefits', icon: Gift },
    { num: 7, title: 'Application', icon: Settings2 },
    { num: 8, title: 'Screening', icon: HelpCircle },
    { num: 9, title: 'Preview & Publish', icon: Eye },
  ];

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'text',
        is_required: true,
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await employerService.createJob(
        {
          ...jobData,
          company_id: company?.id || '30000000-0000-0000-0000-000000000001',
          created_by: profile?.id || '00000000-0000-0000-0000-000000000201',
          status: 'draft',
        },
        selectedSkills,
        selectedBenefits,
        questions
      );

      if (res.error) {
        setErrorMessage(res.error);
        setIsSubmitting(false);
        return;
      }

      navigate('/employer/jobs');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishJob = async () => {
    // Validate required fields
    if (!jobData.title.trim()) {
      setErrorMessage('Job title is required');
      setCurrentStep(1);
      return;
    }
    if (!jobData.description.trim()) {
      setErrorMessage('Job description is required');
      setCurrentStep(2);
      return;
    }

    // Company verification check (Prompt 3 Section 12 & 26)
    if (!isVerified) {
      setErrorMessage(
        'Your company must be verified before you can publish a job. Please complete verification or save as Draft.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await employerService.createJob(
        {
          ...jobData,
          company_id: company?.id || '30000000-0000-0000-0000-000000000001',
          created_by: profile?.id || '00000000-0000-0000-0000-000000000201',
          status: 'published',
        },
        selectedSkills,
        selectedBenefits,
        questions
      );

      if (res.error) {
        setErrorMessage(res.error);
        setIsSubmitting(false);
        return;
      }

      navigate('/employer/jobs');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error publishing job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create & Post a Job</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
          </p>
        </div>

        <button
          onClick={handleSaveDraft}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
        >
          Save as Draft
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to proceed</p>
            <p className="text-xs text-red-400 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Step Stepper Header */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;

          return (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                  : isDone
                  ? 'bg-slate-900 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-850'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* STEP CONTAINER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white mb-2">1. Basic Position Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={jobData.title}
                  onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                  placeholder="e.g. Senior Cloud Architect & Kubernetes Specialist"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category / Sector</label>
                <select
                  value={jobData.category_id}
                  onChange={(e) => setJobData({ ...jobData, category_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {SEED_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department / Team</label>
                <input
                  type="text"
                  value={jobData.department}
                  onChange={(e) => setJobData({ ...jobData, department: e.target.value })}
                  placeholder="Cloud & Infrastructure Engineering"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Employment Type</label>
                <select
                  value={jobData.employment_type}
                  onChange={(e) => setJobData({ ...jobData, employment_type: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Mode</label>
                <select
                  value={jobData.work_mode}
                  onChange={(e) => setJobData({ ...jobData, work_mode: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="remote">Remote (Work from Anywhere)</option>
                  <option value="hybrid">Hybrid (Office + Remote)</option>
                  <option value="on_site">On-Site (Office)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={jobData.city}
                  onChange={(e) => setJobData({ ...jobData, city: e.target.value })}
                  placeholder="San Francisco"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Vacancies</label>
                <input
                  type="number"
                  min="1"
                  value={jobData.vacancies}
                  onChange={(e) => setJobData({ ...jobData, vacancies: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Description */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white mb-2">2. Role Description & Objectives</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Summary / Role Mission *</label>
              <textarea
                rows={4}
                required
                value={jobData.description}
                onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                placeholder="Give candidates an inspiring summary of why this role exists and what impact they will make on the team..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Key Responsibilities (One per line or paragraph)</label>
              <textarea
                rows={4}
                value={jobData.responsibilities}
                onChange={(e) => setJobData({ ...jobData, responsibilities: e.target.value })}
                placeholder="• Architect distributed systems on AWS and Kubernetes&#10;• Partner with product managers to deliver scalable customer features&#10;• Lead architecture reviews and mentor junior engineers..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Experience & Requirements */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white mb-2">3. Requirements & Experience Levels</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Min Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  value={jobData.experience_min}
                  onChange={(e) => setJobData({ ...jobData, experience_min: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Max Years of Experience (Optional)</label>
                <input
                  type="number"
                  min="0"
                  value={jobData.experience_max}
                  onChange={(e) => setJobData({ ...jobData, experience_max: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Education Requirement</label>
                <select
                  value={jobData.education_requirement}
                  onChange={(e) => setJobData({ ...jobData, education_requirement: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                >
                  <option value="No specific requirement">No specific requirement</option>
                  <option value="High School Diploma">High School Diploma</option>
                  <option value="Associate / Vocational Degree">Associate / Vocational Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Doctorate (Ph.D)">Doctorate (Ph.D)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Technical Qualifications</label>
                <textarea
                  rows={4}
                  value={jobData.requirements}
                  onChange={(e) => setJobData({ ...jobData, requirements: e.target.value })}
                  placeholder="• 4+ years production TypeScript, React, and Node.js experience&#10;• Experience with high-availability relational databases (PostgreSQL)&#10;• Strong communication and collaborative problem solving..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Skills */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white mb-2">4. Required & Preferred Skills Taxonomy</h2>
            <p className="text-xs text-slate-400">
              Select key technical and domain skills for automated matching and candidate filtering.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {selectedSkills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-medium"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSkills(selectedSkills.filter((item) => item !== s))}
                    className="hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Add Popular Skills:</label>
              <div className="flex flex-wrap gap-1.5">
                {['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'Next.js', 'Python', 'Go', 'Tailwind CSS'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    disabled={selectedSkills.includes(item)}
                    onClick={() => setSelectedSkills([...selectedSkills, item])}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:border-indigo-500 hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Compensation */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white mb-2">5. Compensation & Salary Band</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Pay ($)</label>
                <input
                  type="number"
                  value={jobData.salary_min}
                  onChange={(e) => setJobData({ ...jobData, salary_min: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Maximum Pay ($)</label>
                <input
                  type="number"
                  value={jobData.salary_max}
                  onChange={(e) => setJobData({ ...jobData, salary_max: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pay Frequency</label>
                <select
                  value={jobData.salary_period}
                  onChange={(e) => setJobData({ ...jobData, salary_period: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="year">Per Year (Annual)</option>
                  <option value="month">Per Month</option>
                  <option value="hour">Per Hour</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Salary Visibility to Job Seekers</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['visible', 'hidden', 'negotiable'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setJobData({ ...jobData, salary_visibility: mode })}
                      className={`p-3 rounded-xl border text-center text-xs font-medium transition-colors cursor-pointer capitalize ${
                        jobData.salary_visibility === mode
                          ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Benefits */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white mb-2">6. Company Benefits & Perks</h2>
            <div className="space-y-2">
              {[
                'Comprehensive Health & Dental Coverage',
                '401(k) Retirement Plan with Match',
                'Flexible Work from Anywhere Policy',
                'Annual Learning & Conference Stipend ($2,500)',
                'Unlimited Paid Time Off (PTO)',
                'Home Office Setup Allowance ($1,000)',
                'Wellness & Gym Membership Allowance',
                'Parental Leave (16 Weeks Paid)',
              ].map((perk) => {
                const isSelected = selectedBenefits.includes(perk);
                return (
                  <label
                    key={perk}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-white font-medium'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setSelectedBenefits(selectedBenefits.filter((b) => b !== perk));
                        } else {
                          setSelectedBenefits([...selectedBenefits, perk]);
                        }
                      }}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>{perk}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 7: Application Settings */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white mb-2">7. Application Deadlines & Submission Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Application Deadline</label>
                <input
                  type="date"
                  value={jobData.application_deadline}
                  onChange={(e) => setJobData({ ...jobData, application_deadline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Hires / Vacancies</label>
                <input
                  type="number"
                  min="1"
                  value={jobData.vacancies}
                  onChange={(e) => setJobData({ ...jobData, vacancies: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Screening Questions */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">8. Candidate Screening Questions</h2>
                <p className="text-xs text-slate-400">Ask candidates customized qualification questions prior to CV review</p>
              </div>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-600/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-400">Question #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={q.question_text}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[idx].question_text = e.target.value;
                        setQuestions(updated);
                      }}
                      placeholder="e.g. Do you have experience with Kubernetes in production?"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <select
                      value={q.question_type}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[idx].question_type = e.target.value as any;
                        setQuestions(updated);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300"
                    >
                      <option value="text">Short Text</option>
                      <option value="yes_no">Yes / No</option>
                      <option value="number">Number</option>
                    </select>

                    <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.is_required}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[idx].is_required = e.target.checked;
                          setQuestions(updated);
                        }}
                        className="rounded text-indigo-600"
                      />
                      <span>Mandatory</span>
                    </label>
                  </div>
                </div>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  No screening questions added. Candidates will submit standard CV and cover letter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 9: Preview & Publish */}
        {currentStep === 9 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">9. Final Preview & Verification Audit</h2>
                <p className="text-xs text-slate-400">
                  Review the candidate experience exactly as it will appear in public search
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 font-mono font-semibold">
                PREVIEW MODE
              </span>
            </div>

            {/* Candidate Card Replica */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={company?.logo_url || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150'}
                  alt={company?.company_name}
                  className="w-16 h-16 rounded-2xl object-cover ring-1 ring-slate-800 shrink-0 bg-slate-900"
                />
                <div>
                  <h3 className="text-xl font-bold text-white">{jobData.title || 'Untitled Role'}</h3>
                  <p className="text-sm text-indigo-400 font-medium">{company?.company_name}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {jobData.city}, {jobData.state} ({jobData.work_mode})
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      ${(jobData.salary_min / 1000).toFixed(0)}k - ${(jobData.salary_max / 1000).toFixed(0)}k / {jobData.salary_period}
                    </span>
                    <span>•</span>
                    <span>{jobData.employment_type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-900 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Role Mission</h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {jobData.description || 'No description provided.'}
                </p>
              </div>

              {jobData.responsibilities && (
                <div className="pt-3 border-t border-slate-900 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Responsibilities</h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {jobData.responsibilities}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-900">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.map((s) => (
                    <span key={s} className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-900">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Included Benefits</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                  {selectedBenefits.map((b) => (
                    <div key={b} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Verification Warning Notice (Section 12 & 26) */}
            {!isVerified && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-300 text-xs">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <p className="font-semibold text-amber-200">Company Legal Verification Required</p>
                  <p className="mt-0.5 text-slate-400">
                    Your company must be verified before you can publish a job. You can still safely save this job as a Draft and publish once verification is complete.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP CONTROLS (Back / Next / Publish) */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(currentStep - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-30"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Save Draft
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublishJob}
                disabled={isSubmitting || !isVerified}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Publishing Live...' : 'Publish Job Live'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
