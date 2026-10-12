import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  FileText,
  Upload,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Paperclip,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { JobWithCompany, dataService } from '../../lib/dataService';
import { Resume } from '../../types/database';

interface ApplyJobModalProps {
  job: JobWithCompany;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appReference: string) => void;
}

export function ApplyJobModal({ job, isOpen, onClose, onSuccess }: ApplyJobModalProps) {
  const { profile, jobSeekerProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedSalary, setExpectedSalary] = useState<number>(job.salary_min || 135000);
  const [answers, setAnswers] = useState<Record<string, string>>({
    q1: 'Yes',
    q2: '5+ years',
  });
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedRef, setCompletedRef] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id && isOpen) {
      dataService.getResumes(profile.id).then((list) => {
        setResumes(list);
        const primary = list.find((r) => r.is_primary) || list[0];
        if (primary) setSelectedResumeId(primary.id);
      });
    }
  }, [profile?.id, isOpen]);

  if (!isOpen) return null;

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep === 2 && !selectedResumeId && resumes.length > 0) {
      setErrorMsg('Please select a CV to attach to your application.');
      return;
    }
    setErrorMsg(null);
    setCurrentStep((s) => Math.min(s + 1, totalSteps));
  };

  const handlePrev = () => {
    setErrorMsg(null);
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedDocName(file.name);
    }
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const applicantId = profile?.id || '00000000-0000-0000-0000-000000000101';
      const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
        questionId: qId,
        answer: ans,
      }));

      const res = await dataService.submitApplication({
        jobId: job.id,
        applicantId,
        resumeId: selectedResumeId,
        coverLetter,
        expectedSalary,
        answers: formattedAnswers,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to submit application.');
        setIsSubmitting(false);
        return;
      }

      const ref = res.application?.application_reference || 'APP-2026-X8Y7Z2';
      setCompletedRef(ref);
      onSuccess(ref);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/60">
          <div>
            <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">
              Apply for Position
            </span>
            <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
              {job.title}
            </h3>
            <span className="text-xs text-slate-400">{job.company?.company_name}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        {!completedRef && (
          <div className="px-6 pt-3 pb-2 border-b border-slate-800/60 bg-slate-950/40">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium text-slate-300">
                Step {currentStep} of {totalSteps}:{' '}
                {
                  [
                    'Profile Details',
                    'Select CV',
                    'Cover Letter',
                    'Screening Questions',
                    'Additional Documents',
                    'Review & Submit',
                  ][currentStep - 1]
                }
              </span>
              <span className="text-[11px] font-semibold text-emerald-400">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {completedRef ? (
            /* SUCCESS CONFIRMATION SCREEN (Section 40) */
            <div className="text-center py-6 space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white tracking-tight">Application Submitted Successfully!</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
                  Your application has been received by the hiring team at {job.company?.company_name}.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 inline-block text-left mx-auto max-w-sm w-full space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Application Reference</span>
                  <span className="font-mono font-bold text-emerald-400">{completedRef}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Position</span>
                  <span className="text-slate-200">{job.title}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Initial Status</span>
                  <span className="text-blue-400 font-semibold uppercase">Applied</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Submission Date</span>
                  <span className="text-slate-200">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Close &amp; View Applications
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: VERIFY PROFILE (Section 33) */}
              {currentStep === 1 && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-400">
                    Verify that your contact and location details are up-to-date. Recruiters will reach out via this information.
                  </p>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-500 block mb-1">Full Name</span>
                        <span className="text-white font-medium">
                          {profile?.first_name} {profile?.last_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Email Address</span>
                        <span className="text-white font-medium">{profile?.email}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                      <div>
                        <span className="text-slate-500 block mb-1">Phone Number</span>
                        <span className="text-white font-medium">{profile?.phone || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Current Location</span>
                        <span className="text-white font-medium">
                          {profile?.city}, {profile?.state || profile?.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      Expected Annual Compensation ({job.salary_currency})
                    </label>
                    <input
                      type="number"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Target compensation band for this role: {job.salary_currency} {job.salary_min?.toLocaleString()} - {job.salary_max?.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 2: SELECT CV (Section 34) */}
              {currentStep === 2 && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-400">
                    Choose which CV from your profile to attach with this application.
                  </p>

                  <div className="space-y-2.5">
                    {resumes.map((r) => (
                      <label
                        key={r.id}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                          selectedResumeId === r.id
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="resume"
                            checked={selectedResumeId === r.id}
                            onChange={() => setSelectedResumeId(r.id)}
                            className="text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{r.title}</span>
                              {r.is_primary && (
                                <span className="text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-medium">
                                  Primary
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Updated {new Date(r.updated_at).toLocaleDateString()} &bull; Template: {r.template_name}
                            </span>
                          </div>
                        </div>
                        <FileText className="w-4 h-4 text-slate-500" />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: COVER LETTER (Section 35) */}
              {currentStep === 3 && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-medium">Cover Letter (Optional)</label>
                    <span className="text-[11px] text-slate-500">{coverLetter.length} characters</span>
                  </div>
                  <textarea
                    rows={6}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Introduce yourself, explain your interest in this specific role, and highlight key achievements relevant to Apex Cloud Solutions..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Personalized cover letters increase recruiter callback rates by over 40%.
                  </p>
                </div>
              )}

              {/* STEP 4: SCREENING QUESTIONS (Section 36) */}
              {currentStep === 4 && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-400">
                    The employer has configured the following screening questions for this role:
                  </p>

                  <div className="space-y-4">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <label className="block text-slate-200 font-medium">
                        1. Are you legally authorized to work in the designated job location without sponsorship? <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={answers.q1 || 'Yes'}
                        onChange={(e) => setAnswers({ ...answers, q1: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="Yes">Yes, authorized without sponsorship</option>
                        <option value="No">No, require sponsorship</option>
                      </select>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <label className="block text-slate-200 font-medium">
                        2. How many years of direct experience do you have with the required tech stack / domain? <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={answers.q2 || '5+ years'}
                        onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
                        placeholder="e.g. 5+ years"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: APPLICATION DOCUMENTS (Section 37) */}
              {currentStep === 5 && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-400">
                    Upload supplementary files (portfolios, certifications, reference letters) to private storage:
                  </p>

                  <div className="border border-dashed border-slate-800 rounded-2xl p-6 text-center bg-slate-950/50 hover:border-emerald-500/40 transition">
                    <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <label className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition">
                      <span>Choose File</span>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.png,.jpg"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Supported: PDF, DOCX, PNG up to 20MB
                    </p>
                    {uploadedDocName && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 text-xs">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Attached: {uploadedDocName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 6: REVIEW & SUBMIT (Section 38 & 39) */}
              {currentStep === 6 && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-400">
                    Please review your application summary before final submission:
                  </p>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500">Target Role</span>
                      <span className="font-semibold text-white">{job.title}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500">Company</span>
                      <span className="text-white">{job.company?.company_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500">Applicant Name</span>
                      <span className="text-white">{profile?.first_name} {profile?.last_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500">Attached Resume</span>
                      <span className="text-emerald-400 font-medium">
                        {resumes.find((r) => r.id === selectedResumeId)?.title || 'Selected CV'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Expected Compensation</span>
                      <span className="text-white font-semibold">
                        {job.salary_currency} {expectedSalary.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    By clicking &quot;Submit Application&quot;, your application status will be recorded, generating an audit reference code and notifying the employer&apos;s recruiting team.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!completedRef && (
          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/60">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition cursor-pointer shadow-lg shadow-emerald-500/25 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Submitting...' : 'SUBMIT APPLICATION'}</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
