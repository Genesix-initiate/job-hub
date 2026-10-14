import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import { JobSeekerLayout } from './components/layout/JobSeekerLayout';
import { EmployerLayout } from './components/layout/EmployerLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Admin Auth Pages
import { AdminLoginPage } from './pages/admin/auth/AdminLoginPage';
import { AdminForgotPasswordPage } from './pages/admin/auth/AdminForgotPasswordPage';
import { AdminResetPasswordPage } from './pages/admin/auth/AdminResetPasswordPage';
import { AdminVerifyEmailPage } from './pages/admin/auth/AdminVerifyEmailPage';

// Admin Portal Pages
import { AdminDashboard } from './pages/admin/dashboard/AdminDashboard';
import { AdminUsersPage } from './pages/admin/users/AdminUsersPage';
import { AdminUserDetailPage } from './pages/admin/users/AdminUserDetailPage';
import { AdminJobSeekersPage } from './pages/admin/users/AdminJobSeekersPage';
import { AdminEmployersPage } from './pages/admin/users/AdminEmployersPage';
import { AdminTeamPage } from './pages/admin/users/AdminTeamPage';
import { AdminCompaniesPage } from './pages/admin/companies/AdminCompaniesPage';
import { AdminCompanyDetailPage } from './pages/admin/companies/AdminCompanyDetailPage';
import { AdminJobsPage } from './pages/admin/jobs/AdminJobsPage';
import { AdminJobDetailPage } from './pages/admin/jobs/AdminJobDetailPage';
import { AdminApplicationsPage } from './pages/admin/applications/AdminApplicationsPage';
import { AdminApplicationDetailPage } from './pages/admin/applications/AdminApplicationDetailPage';
import { AdminInterviewsPage } from './pages/admin/recruitment/AdminInterviewsPage';
import { AdminReportsPage } from './pages/admin/reports/AdminReportsPage';
import { AdminSupportTicketsPage } from './pages/admin/support/AdminSupportTicketsPage';
import { AdminCategoriesPage } from './pages/admin/content/AdminCategoriesPage';
import { AdminSkillsPage } from './pages/admin/content/AdminSkillsPage';
import { AdminCareerResourcesPage as AdminCareerResourcesCMS } from './pages/admin/content/AdminCareerResourcesPage';
import { AdminLandingPageCMS } from './pages/admin/content/AdminLandingPageCMS';
import { AdminBroadcastsPage } from './pages/admin/notifications/AdminBroadcastsPage';
import { AdminEmailAutomationPage } from './pages/admin/notifications/AdminEmailAutomationPage';
import { AdminSubscriptionsPage } from './pages/admin/finance/AdminSubscriptionsPage';
import { AdminPaymentsPage } from './pages/admin/finance/AdminPaymentsPage';
import { AdminInvoicesPage } from './pages/admin/finance/AdminInvoicesPage';
import { AdminAnalyticsPage } from './pages/admin/analytics/AdminAnalyticsPage';
import { AdminAuditLogsPage } from './pages/admin/system/AdminAuditLogsPage';
import { AdminSecurityPage } from './pages/admin/system/AdminSecurityPage';
import { AdminSettingsPage } from './pages/admin/system/AdminSettingsPage';
import { AdminFeatureFlagsPage } from './pages/admin/system/AdminFeatureFlagsPage';
import { AdminSystemHealthPage } from './pages/admin/system/AdminSystemHealthPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Employer Auth Pages
import { EmployerLoginPage } from './pages/employer/auth/EmployerLoginPage';
import { EmployerRegisterPage } from './pages/employer/auth/EmployerRegisterPage';
import { EmployerVerifyEmailPage } from './pages/employer/auth/EmployerVerifyEmailPage';
import { EmployerForgotPasswordPage } from './pages/employer/auth/EmployerForgotPasswordPage';

// Employer Portal Pages
import { EmployerDashboard } from './pages/employer/dashboard/EmployerDashboard';
import { CompanyProfilePage } from './pages/employer/company/CompanyProfilePage';
import { CompanyVerificationPage } from './pages/employer/company/CompanyVerificationPage';
import { CompanyTeamPage } from './pages/employer/team/CompanyTeamPage';
import { EmployerJobsPage } from './pages/employer/jobs/EmployerJobsPage';
import { CreateJobPage } from './pages/employer/jobs/CreateJobPage';
import { EmployerApplicantsPage } from './pages/employer/applicants/EmployerApplicantsPage';
import { ApplicationDetailPage } from './pages/employer/applicants/ApplicationDetailPage';
import { RecruitmentPipelinePage } from './pages/employer/pipeline/RecruitmentPipelinePage';
import { EmployerInterviewsPage } from './pages/employer/interviews/EmployerInterviewsPage';
import { EmployerAssessmentsPage } from './pages/employer/assessments/EmployerAssessmentsPage';
import { EmployerMessagesPage } from './pages/employer/messages/EmployerMessagesPage';
import { EmployerNotificationsPage } from './pages/employer/notifications/EmployerNotificationsPage';
import { EmployerAnalyticsPage } from './pages/employer/analytics/EmployerAnalyticsPage';
import { EmployerBillingPage } from './pages/employer/billing/EmployerBillingPage';
import { EmployerSettingsPage } from './pages/employer/settings/EmployerSettingsPage';

// Job Seeker Pages
import { JobSeekerDashboard } from './pages/dashboard/JobSeekerDashboard';
import { ProfilePage } from './pages/profile/ProfilePage';
import { JobSearchPage } from './pages/jobs/JobSearchPage';
import { JobDetailsPage } from './pages/jobs/JobDetailsPage';
import { CompaniesListPage } from './pages/companies/CompaniesListPage';
import { CompanyDetailsPage } from './pages/companies/CompanyDetailsPage';
import { SavedJobsPage } from './pages/saved/SavedJobsPage';
import { ApplicationsListPage } from './pages/applications/ApplicationsListPage';
import { ApplicationDetailsPage } from './pages/applications/ApplicationDetailsPage';
import { CvListPage } from './pages/cv/CvListPage';
import { CvBuilderPage } from './pages/cv/CvBuilderPage';
import { InterviewsListPage } from './pages/interviews/InterviewsListPage';
import { InterviewDetailsPage } from './pages/interviews/InterviewDetailsPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { JobAlertsPage } from './pages/alerts/JobAlertsPage';
import { AssessmentsListPage } from './pages/assessments/AssessmentsListPage';
import { TakeAssessmentPage } from './pages/assessments/TakeAssessmentPage';
import { CareerResourcesPage } from './pages/career/CareerResourcesPage';
import { SettingsPage } from './pages/settings/SettingsPage';

// Backend & Database Inspection Console (from Prompt 1)
import { BackendConsolePage } from './pages/admin/BackendConsolePage';

// Master Landing Page
import { LandingPage } from './pages/landing/LandingPage';

// Protected Route Wrapper for Job Seekers
function ProtectedJobSeekerRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 text-xs">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <JobSeekerLayout>{children}</JobSeekerLayout>;
}

// Protected Route Wrapper for Employers & Recruiters
function ProtectedEmployerRoute({ children }: { children: React.ReactNode }) {
  const { user, employerProfile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-400 text-xs font-mono">
        Authenticating employer session...
      </div>
    );
  }

  if (!user || !employerProfile) {
    return <Navigate to="/employer/login" replace />;
  }

  return <EmployerLayout>{children}</EmployerLayout>;
}

// Protected Route Wrapper for Administrators (Strictly Protected - No Auto Demo)
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-rose-400 text-xs font-mono">
        Authenticating administrative session...
      </div>
    );
  }

  if (!user || (userRole !== 'admin' && userRole !== 'super_admin')) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

// Public with Layout Wrapper
function PublicJobSeekerRoute({ children }: { children: React.ReactNode }) {
  return <JobSeekerLayout>{children}</JobSeekerLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ForgotPasswordPage />} />

          {/* Public Job & Company Browsing Routes */}
          <Route
            path="/jobs"
            element={
              <PublicJobSeekerRoute>
                <JobSearchPage />
              </PublicJobSeekerRoute>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <PublicJobSeekerRoute>
                <JobDetailsPage />
              </PublicJobSeekerRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <PublicJobSeekerRoute>
                <CompaniesListPage />
              </PublicJobSeekerRoute>
            }
          />
          <Route
            path="/companies/:id"
            element={
              <PublicJobSeekerRoute>
                <CompanyDetailsPage />
              </PublicJobSeekerRoute>
            }
          />
          <Route
            path="/career-resources"
            element={
              <PublicJobSeekerRoute>
                <CareerResourcesPage />
              </PublicJobSeekerRoute>
            }
          />
          <Route
            path="/career-resources/:slug"
            element={
              <PublicJobSeekerRoute>
                <CareerResourcesPage />
              </PublicJobSeekerRoute>
            }
          />

          {/* Protected Job Seeker Portal Routes */}
          <Route
            path="/job-seeker/dashboard"
            element={
              <ProtectedJobSeekerRoute>
                <JobSeekerDashboard />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/profile"
            element={
              <ProtectedJobSeekerRoute>
                <ProfilePage />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/cv"
            element={
              <ProtectedJobSeekerRoute>
                <CvListPage />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/cv/create"
            element={
              <ProtectedJobSeekerRoute>
                <CvBuilderPage />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/cv/:id"
            element={
              <ProtectedJobSeekerRoute>
                <CvBuilderPage />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/applications"
            element={
              <ProtectedJobSeekerRoute>
                <ApplicationsListPage />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/applications/:id"
            element={
              <ProtectedJobSeekerRoute>
                <ApplicationDetailsPage />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/saved-jobs"
            element={
              <ProtectedJobSeekerRoute>
                <SavedJobsPage />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/interviews"
            element={
              <ProtectedJobSeekerRoute>
                <InterviewsListPage />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/interviews/:id"
            element={
              <ProtectedJobSeekerRoute>
                <InterviewDetailsPage />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/messages"
            element={
              <ProtectedJobSeekerRoute>
                <MessagesPage />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/messages/:id"
            element={
              <ProtectedJobSeekerRoute>
                <MessagesPage />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/notifications"
            element={
              <ProtectedJobSeekerRoute>
                <NotificationsPage />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/job-alerts"
            element={
              <ProtectedJobSeekerRoute>
                <JobAlertsPage />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/assessments"
            element={
              <ProtectedJobSeekerRoute>
                <AssessmentsListPage />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/assessments/:id"
            element={
              <ProtectedJobSeekerRoute>
                <TakeAssessmentPage />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/career-resources"
            element={
              <ProtectedJobSeekerRoute>
                <CareerResourcesPage />
              </ProtectedJobSeekerRoute>
            }
          />
          <Route
            path="/job-seeker/settings"
            element={
              <ProtectedJobSeekerRoute>
                <SettingsPage />
              </ProtectedJobSeekerRoute>
            }
          />

          {/* ======================================================== */}
          {/* EMPLOYER & RECRUITER PORTAL ROUTES (PROMPT 3) */}
          {/* ======================================================== */}
          {/* Public Employer Auth */}
          <Route path="/employer/login" element={<EmployerLoginPage />} />
          <Route path="/employer/register" element={<EmployerRegisterPage />} />
          <Route path="/employer/verify-email" element={<EmployerVerifyEmailPage />} />
          <Route path="/employer/forgot-password" element={<EmployerForgotPasswordPage />} />
          <Route path="/employer/reset-password" element={<EmployerForgotPasswordPage />} />

          {/* Protected Employer Portal Routes */}
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedEmployerRoute>
                <EmployerDashboard />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/company"
            element={
              <ProtectedEmployerRoute>
                <CompanyProfilePage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/company/edit"
            element={
              <ProtectedEmployerRoute>
                <CompanyProfilePage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/verification"
            element={
              <ProtectedEmployerRoute>
                <CompanyVerificationPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/team"
            element={
              <ProtectedEmployerRoute>
                <CompanyTeamPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/team/invite"
            element={
              <ProtectedEmployerRoute>
                <CompanyTeamPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/jobs"
            element={
              <ProtectedEmployerRoute>
                <EmployerJobsPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/jobs/create"
            element={
              <ProtectedEmployerRoute>
                <CreateJobPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/jobs/:jobId"
            element={
              <ProtectedEmployerRoute>
                <EmployerJobsPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/jobs/:jobId/edit"
            element={
              <ProtectedEmployerRoute>
                <CreateJobPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/jobs/:jobId/preview"
            element={
              <ProtectedEmployerRoute>
                <CreateJobPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/applicants"
            element={
              <ProtectedEmployerRoute>
                <EmployerApplicantsPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/applicants/:applicantId"
            element={
              <ProtectedEmployerRoute>
                <EmployerApplicantsPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/applications"
            element={
              <ProtectedEmployerRoute>
                <EmployerApplicantsPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/applications/:applicationId"
            element={
              <ProtectedEmployerRoute>
                <ApplicationDetailPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/pipeline"
            element={
              <ProtectedEmployerRoute>
                <RecruitmentPipelinePage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/interviews"
            element={
              <ProtectedEmployerRoute>
                <EmployerInterviewsPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/interviews/create"
            element={
              <ProtectedEmployerRoute>
                <EmployerInterviewsPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/interviews/:interviewId"
            element={
              <ProtectedEmployerRoute>
                <EmployerInterviewsPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/assessments"
            element={
              <ProtectedEmployerRoute>
                <EmployerAssessmentsPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/assessments/:assessmentId"
            element={
              <ProtectedEmployerRoute>
                <EmployerAssessmentsPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/messages"
            element={
              <ProtectedEmployerRoute>
                <EmployerMessagesPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/messages/:conversationId"
            element={
              <ProtectedEmployerRoute>
                <EmployerMessagesPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/notifications"
            element={
              <ProtectedEmployerRoute>
                <EmployerNotificationsPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/analytics"
            element={
              <ProtectedEmployerRoute>
                <EmployerAnalyticsPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/analytics/jobs/:jobId"
            element={
              <ProtectedEmployerRoute>
                <EmployerAnalyticsPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/billing"
            element={
              <ProtectedEmployerRoute>
                <EmployerBillingPage />
              </ProtectedEmployerRoute>
            }
          />
          <Route
            path="/employer/settings"
            element={
              <ProtectedEmployerRoute>
                <EmployerSettingsPage />
              </ProtectedEmployerRoute>
            }
          />

          {/* ======================================================== */}
          {/* ADMIN & SUPER ADMIN PORTAL ROUTES (PROMPT 4) */}
          {/* ======================================================== */}
          {/* Public Admin Auth */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/privacy" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
          <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
          <Route path="/admin/verify-email" element={<AdminVerifyEmailPage />} />

          {/* Protected Admin Console Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedAdminRoute>
                <AdminUsersPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/users/:userId"
            element={
              <ProtectedAdminRoute>
                <AdminUserDetailPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/job-seekers"
            element={
              <ProtectedAdminRoute>
                <AdminJobSeekersPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/job-seekers/:userId"
            element={
              <ProtectedAdminRoute>
                <AdminUserDetailPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/employers"
            element={
              <ProtectedAdminRoute>
                <AdminEmployersPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/employers/:employerId"
            element={
              <ProtectedAdminRoute>
                <AdminUserDetailPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/administrators"
            element={
              <ProtectedAdminRoute>
                <AdminTeamPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/companies"
            element={
              <ProtectedAdminRoute>
                <AdminCompaniesPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/companies/pending"
            element={
              <ProtectedAdminRoute>
                <AdminCompaniesPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/companies/verified"
            element={
              <ProtectedAdminRoute>
                <AdminCompaniesPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/companies/rejected"
            element={
              <ProtectedAdminRoute>
                <AdminCompaniesPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/companies/:companyId"
            element={
              <ProtectedAdminRoute>
                <AdminCompanyDetailPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <ProtectedAdminRoute>
                <AdminJobsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/jobs/pending"
            element={
              <ProtectedAdminRoute>
                <AdminJobsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/jobs/published"
            element={
              <ProtectedAdminRoute>
                <AdminJobsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/jobs/reported"
            element={
              <ProtectedAdminRoute>
                <AdminJobsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/jobs/:jobId"
            element={
              <ProtectedAdminRoute>
                <AdminJobDetailPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <ProtectedAdminRoute>
                <AdminApplicationsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/applications/:applicationId"
            element={
              <ProtectedAdminRoute>
                <AdminApplicationDetailPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/recruitment/interviews"
            element={
              <ProtectedAdminRoute>
                <AdminInterviewsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedAdminRoute>
                <AdminReportsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/reports/:reportId"
            element={
              <ProtectedAdminRoute>
                <AdminReportsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/support"
            element={
              <ProtectedAdminRoute>
                <AdminSupportTicketsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/support/:ticketId"
            element={
              <ProtectedAdminRoute>
                <AdminSupportTicketsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/content/landing-page"
            element={
              <ProtectedAdminRoute>
                <AdminLandingPageCMS />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/content/job-categories"
            element={
              <ProtectedAdminRoute>
                <AdminCategoriesPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/content/skills"
            element={
              <ProtectedAdminRoute>
                <AdminSkillsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/content/locations"
            element={
              <ProtectedAdminRoute>
                <AdminCategoriesPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/content/career-resources"
            element={
              <ProtectedAdminRoute>
                <AdminCareerResourcesCMS />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedAdminRoute>
                <AdminBroadcastsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/notifications/email-automation"
            element={
              <ProtectedAdminRoute>
                <AdminEmailAutomationPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/email-automation"
            element={
              <ProtectedAdminRoute>
                <AdminEmailAutomationPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/subscriptions"
            element={
              <ProtectedAdminRoute>
                <AdminSubscriptionsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedAdminRoute>
                <AdminPaymentsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/invoices"
            element={
              <ProtectedAdminRoute>
                <AdminInvoicesPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedAdminRoute>
                <AdminAnalyticsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/analytics/users"
            element={
              <ProtectedAdminRoute>
                <AdminAnalyticsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/analytics/jobs"
            element={
              <ProtectedAdminRoute>
                <AdminAnalyticsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/analytics/applications"
            element={
              <ProtectedAdminRoute>
                <AdminAnalyticsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/analytics/employers"
            element={
              <ProtectedAdminRoute>
                <AdminAnalyticsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/analytics/revenue"
            element={
              <ProtectedAdminRoute>
                <AdminAnalyticsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedAdminRoute>
                <AdminAuditLogsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/security"
            element={
              <ProtectedAdminRoute>
                <AdminSecurityPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedAdminRoute>
                <AdminSettingsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/system/health"
            element={
              <ProtectedAdminRoute>
                <AdminSystemHealthPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/system/feature-flags"
            element={
              <ProtectedAdminRoute>
                <AdminFeatureFlagsPage />
              </ProtectedAdminRoute>
            }
          />

          {/* Database & RLS Inspection Console - Admin Only */}
          <Route
            path="/backend-console"
            element={
              <ProtectedAdminRoute>
                <BackendConsolePage />
              </ProtectedAdminRoute>
            }
          />

          {/* Master Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
