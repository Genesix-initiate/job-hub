import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Printer,
  Download,
  Share2,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';

export function CvBuilderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, jobSeekerProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern' | 'professional'>('modern');

  // Multi-step form state
  const [cvTitle, setCvTitle] = useState('Professional Resume');
  const [personalInfo, setPersonalInfo] = useState({
    fullName: profile ? `${profile.first_name} ${profile.last_name}`.trim() : '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.city ? `${profile.city}, ${profile.country}` : '',
    website: '',
    linkedin: '',
    github: '',
  });

  const [summary, setSummary] = useState(
    jobSeekerProfile?.professional_summary || ''
  );

  const [experiences, setExperiences] = useState<any[]>([]);

  const [educationList, setEducationList] = useState<any[]>([]);

  const [skillsList, setSkillsList] = useState<string[]>([
    'Problem Solving',
    'Communication',
    'Project Management',
    'Data Analysis',
    'Team Leadership',
  ]);

  const [certifications, setCertifications] = useState<any[]>([]);

  const [languages, setLanguages] = useState([
    { language: 'English', proficiency: 'Fluent' },
  ]);

  const [references, setReferences] = useState<any[]>([]);

  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const steps = [
    'Personal Info',
    'Summary',
    'Experience',
    'Education',
    'Skills',
    'Certifications',
    'Languages',
    'References',
    'Portfolio',
    'Choose Template',
    'Live Preview & Export',
  ];

  const handleSaveProgress = async () => {
    if (profile?.id) {
      await dataService.createResume(profile.id, {
        title: cvTitle,
        summary,
        template_name: selectedTemplate,
      });
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/job-seeker/cv')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400">11-Step CV Builder</span>
            <input
              type="text"
              value={cvTitle}
              onChange={(e) => setCvTitle(e.target.value)}
              className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none px-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSavedNotice && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          <button
            onClick={handleSaveProgress}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Progress</span>
          </button>
          {currentStep === 11 && (
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Steps Pill Navigator */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-1.5 min-w-max">
          {steps.map((stgName, idx) => {
            const stepNum = idx + 1;
            const isCurrent = currentStep === stepNum;
            const isPast = currentStep > stepNum;
            return (
              <button
                key={stgName}
                onClick={() => setCurrentStep(stepNum)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : isPast
                    ? 'bg-slate-900 border border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{stepNum}.</span>
                <span>{stgName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Contents */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        {/* STEP 1: PERSONAL INFO */}
        {currentStep === 1 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-white">Step 1: Personal &amp; Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Location (City, Country)</label>
                <input
                  type="text"
                  value={personalInfo.location}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SUMMARY */}
        {currentStep === 2 && (
          <div className="space-y-3 text-xs">
            <h3 className="text-sm font-semibold text-white">Step 2: Professional Summary</h3>
            <p className="text-slate-400">A concise 3-4 sentence hook outlining your domain strengths and career focus.</p>
            <textarea
              rows={6}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl p-4 text-xs text-white leading-relaxed resize-none"
            />
          </div>
        )}

        {/* STEP 3: WORK EXPERIENCE */}
        {currentStep === 3 && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Step 3: Work Experience</h3>
              <button
                type="button"
                onClick={() =>
                  setExperiences([
                    ...experiences,
                    {
                      id: String(Date.now()),
                      company: 'New Enterprise Company',
                      title: 'Role Title',
                      startDate: '2023-01',
                      endDate: 'Present',
                      isCurrent: true,
                      description: 'Key deliverables and architectural achievements.',
                    },
                  ])
                }
                className="text-emerald-400 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>

            <div className="space-y-4">
              {experiences.map((exp, i) => (
                <div key={exp.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Position #{i + 1}</span>
                    <button
                      onClick={() => setExperiences(experiences.filter((e) => e.id !== exp.id))}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => {
                        const copy = [...experiences];
                        copy[i].title = e.target.value;
                        setExperiences(copy);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={exp.company}
                      onChange={(e) => {
                        const copy = [...experiences];
                        copy[i].company = e.target.value;
                        setExperiences(copy);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Responsibilities and measurable impacts..."
                    value={exp.description}
                    onChange={(e) => {
                      const copy = [...experiences];
                      copy[i].description = e.target.value;
                      setExperiences(copy);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: EDUCATION */}
        {currentStep === 4 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-white">Step 4: Academic Credentials</h3>
            {educationList.map((edu, i) => (
              <div key={edu.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <input
                  type="text"
                  placeholder="Institution / University"
                  value={edu.institution}
                  onChange={(e) => {
                    const copy = [...educationList];
                    copy[i].institution = e.target.value;
                    setEducationList(copy);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Qualification (e.g. B.S.)"
                    value={edu.qualification}
                    onChange={(e) => {
                      const copy = [...educationList];
                      copy[i].qualification = e.target.value;
                      setEducationList(copy);
                    }}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Field of Study"
                    value={edu.field}
                    onChange={(e) => {
                      const copy = [...educationList];
                      copy[i].field = e.target.value;
                      setEducationList(copy);
                    }}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 5: SKILLS */}
        {currentStep === 5 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-white">Step 5: Professional Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((sk, idx) => (
                <span
                  key={idx}
                  className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2 text-slate-200"
                >
                  <span>{sk}</span>
                  <button
                    onClick={() => setSkillsList(skillsList.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: CERTIFICATIONS */}
        {currentStep === 6 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-white">Step 6: Certifications</h3>
            {certifications.map((c) => (
              <div key={c.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">{c.name}</span>
                  <span className="text-slate-400">{c.org} &bull; {c.year}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 7: LANGUAGES */}
        {currentStep === 7 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-white">Step 7: Languages</h3>
            {languages.map((l, i) => (
              <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between">
                <span className="text-white font-medium">{l.language}</span>
                <span className="text-emerald-400">{l.proficiency}</span>
              </div>
            ))}
          </div>
        )}

        {/* STEP 8: REFERENCES */}
        {currentStep === 8 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-white">Step 8: Professional References</h3>
            {references.map((r, i) => (
              <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-white block">{r.name}</span>
                <span className="text-slate-400">{r.role} at {r.company} &bull; {r.email}</span>
              </div>
            ))}
          </div>
        )}

        {/* STEP 9: PORTFOLIO */}
        {currentStep === 9 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-white">Step 9: Professional Portfolio &amp; Profiles</h3>
            <div className="space-y-3">
              <input
                type="url"
                placeholder="Personal Portfolio Website URL"
                value={personalInfo.website}
                onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="LinkedIn Profile URL"
                value={personalInfo.linkedin}
                onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="GitHub / Code Portfolio URL"
                value={personalInfo.github}
                onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        )}

        {/* STEP 10: TEMPLATE SELECTOR (Section 22) */}
        {currentStep === 10 && (
          <div className="space-y-5 text-xs">
            <h3 className="text-sm font-semibold text-white">Step 10: Select Template Style</h3>
            <p className="text-slate-400">
              All 3 templates render from your same underlying resume data without duplication.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'modern', name: 'Modern Template', desc: 'Sleek dark headers with compact timeline alignment.' },
                { id: 'classic', name: 'Classic Template', desc: 'Timeless traditional serif styling favored by academia and law.' },
                { id: 'professional', name: 'Professional Template', desc: 'Two-column layout with dedicated skills sidebar.' },
              ].map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id as any)}
                  className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    selectedTemplate === tmpl.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <span className="font-bold text-sm text-white">{tmpl.name}</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{tmpl.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 uppercase font-semibold">
                      {selectedTemplate === tmpl.id ? 'Selected' : 'Click to Select'}
                    </span>
                    {selectedTemplate === tmpl.id && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 11: PREVIEW & DOWNLOAD (Section 23) */}
        {currentStep === 11 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Step 11: High-Fidelity Resume Document</h3>
                <p className="text-xs text-slate-400">
                  Formatted using <strong className="text-emerald-400 capitalize">{selectedTemplate}</strong> template.
                </p>
              </div>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>

            {/* Resume Sheet Preview (Simulating 8.5x11 page) */}
            <div
              id="printable-cv"
              className={`bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl max-w-3xl mx-auto space-y-6 ${
                selectedTemplate === 'classic' ? 'font-serif' : 'font-sans'
              }`}
            >
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{personalInfo.fullName}</h1>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  {personalInfo.email} &bull; {personalInfo.phone} &bull; {personalInfo.location}
                </p>
                {personalInfo.website && (
                  <p className="text-xs text-emerald-700 mt-0.5">{personalInfo.website}</p>
                )}
              </div>

              {/* Summary */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1 border-b border-slate-300 pb-0.5">
                  Professional Summary
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">{summary}</p>
              </div>

              {/* Experience */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-0.5">
                  Work Experience
                </h2>
                <div className="space-y-3">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{exp.title} &mdash; {exp.company}</span>
                        <span className="text-slate-600 font-normal">{exp.startDate} &ndash; {exp.endDate}</span>
                      </div>
                      <p className="text-slate-700 mt-0.5 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-0.5">
                  Education
                </h2>
                {educationList.map((edu) => (
                  <div key={edu.id} className="text-xs flex justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{edu.qualification} in {edu.field}</span>
                      <p className="text-slate-600">{edu.institution}</p>
                    </div>
                    <span className="text-slate-600">{edu.endYear}</span>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1 border-b border-slate-300 pb-0.5">
                  Technical Expertise
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {skillsList.join(' &bull; ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 11 ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Complete &amp; Download PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
