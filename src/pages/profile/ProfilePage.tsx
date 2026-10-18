import React, { useState } from 'react';
import {
  Camera,
  Trash2,
  Save,
  Check,
  Sparkles,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Plus,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/dataService';

export function ProfilePage() {
  const { profile, jobSeekerProfile, updateProfile, updateJobSeekerProfile } = useAuth();

  // Personal Info Form State
  const [firstName, setFirstName] = useState(profile?.first_name || 'Alex');
  const [lastName, setLastName] = useState(profile?.last_name || 'Morgan');
  const [phone, setPhone] = useState(profile?.phone || '+1 (555) 234-5678');
  const [country, setCountry] = useState(profile?.country || 'United States');
  const [state, setState] = useState(profile?.state || 'California');
  const [city, setCity] = useState(profile?.city || 'San Francisco');
  const [address, setAddress] = useState(profile?.address || '452 Mission Street, Suite 800');
  const [avatarUrl, setAvatarUrl] = useState(
    profile?.profile_photo_url ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
  );

  // Professional Info Form State
  const [headline, setHeadline] = useState(jobSeekerProfile?.professional_headline || 'Lead Frontend Engineer & React Specialist');
  const [summary, setSummary] = useState(jobSeekerProfile?.professional_summary || '');
  const [currentPosition, setCurrentPosition] = useState(jobSeekerProfile?.current_position || 'Senior Frontend Developer');
  const [yearsOfExp, setYearsOfExp] = useState(jobSeekerProfile?.years_of_experience || 6);
  const [employmentStatus, setEmploymentStatus] = useState(jobSeekerProfile?.employment_status || 'Employed (Open to offers)');
  const [salaryMin, setSalaryMin] = useState(jobSeekerProfile?.expected_salary_min || 130000);
  const [salaryMax, setSalaryMax] = useState(jobSeekerProfile?.expected_salary_max || 165000);
  const [workMode, setWorkMode] = useState<any>(jobSeekerProfile?.preferred_work_mode || 'remote');
  const [jobType, setJobType] = useState<any>(jobSeekerProfile?.preferred_job_type || 'full_time');
  const [availability, setAvailability] = useState(jobSeekerProfile?.availability || '2 weeks notice');

  const [isSaving, setIsSaving] = useState(false);
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const completionPct = jobSeekerProfile?.profile_completion_percentage || 85;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPEG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds maximum 5MB limit.');
      return;
    }

    setUploadProgress(40);
    const path = `avatars/${profile?.auth_user_id || 'user'}-${Date.now()}.png`;
    const res = await dataService.uploadFile('avatars', path, file);
    setUploadProgress(100);

    if (res.url) {
      setAvatarUrl(res.url);
      await updateProfile({ profile_photo_url: res.url });
    }
    setTimeout(() => setUploadProgress(null), 1000);
  };

  const handleRemoveAvatar = async () => {
    setAvatarUrl('');
    await updateProfile({ profile_photo_url: null });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    await Promise.all([
      updateProfile({
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`.trim(),
        phone,
        country,
        state,
        city,
        address,
        profile_photo_url: avatarUrl,
      }),
      updateJobSeekerProfile({
        professional_headline: headline,
        professional_summary: summary,
        current_position: currentPosition,
        years_of_experience: Number(yearsOfExp),
        employment_status: employmentStatus,
        expected_salary_min: Number(salaryMin),
        expected_salary_max: Number(salaryMax),
        preferred_work_mode: workMode,
        preferred_job_type: jobType,
        availability,
      }),
    ]);

    setIsSaving(false);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">
            Identity &amp; Career Presence
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Job Seeker Profile
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Keep your profile accurate to receive relevant recruiter inbounds and tailored matches.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {isSavedToast ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving Changes...' : isSavedToast ? 'Profile Updated!' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Profile Completeness Checklist Box (Section 13) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Profile Completeness Score
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-400">{completionPct}% Complete</span>
        </div>

        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 pt-1">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            <span>Personal Details</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            <span>Professional Summary</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            <span>Work Experience</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            <span>Uploaded Resume</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section 12: Profile Photo Upload */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Profile Photo
          </h3>

          <div className="flex items-center gap-5">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-xl">
                  {firstName[0]}
                </div>
              )}

              {uploadProgress !== null && (
                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-xs text-emerald-400 font-bold">
                  {uploadProgress}%
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-medium border border-slate-700 transition cursor-pointer flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Upload Photo</span>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition cursor-pointer"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Uploaded to Supabase avatars bucket. Supported: PNG, JPEG, WebP up to 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Section 11: Personal Information */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Email (Primary Account)</label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-3.5 py-2 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">State / Region</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 11: Professional Information */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Professional Information
          </h3>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Professional Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Lead Frontend Engineer & React Specialist"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Professional Summary</label>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Highlight your domain experience, core achievements, and engineering values..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-white leading-relaxed resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Years of Experience</label>
              <input
                type="number"
                value={yearsOfExp}
                onChange={(e) => setYearsOfExp(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Availability / Notice Period</label>
              <input
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="Immediately / 2 weeks"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Preferred Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on_site">On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Preferred Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Bottom Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
