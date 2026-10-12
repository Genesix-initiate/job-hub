-- ====================================================================
-- TalentForge: Recruitment & Application Platform Database Foundation
-- Migration 005: Safe Development Seed Data
-- ====================================================================

-- 1. Administrative Roles
INSERT INTO public.roles (id, name, description) VALUES
    ('00000000-0000-0000-0000-000000000001', 'super_admin', 'Complete system administration and security control'),
    ('00000000-0000-0000-0000-000000000002', 'recruitment_admin', 'Oversees job postings, application workflows, and recruiter support'),
    ('00000000-0000-0000-0000-000000000003', 'verification_admin', 'Reviews company registration documents and credentials'),
    ('00000000-0000-0000-0000-000000000004', 'finance_admin', 'Manages billing transactions, invoices, and subscription plans'),
    ('00000000-0000-0000-0000-000000000005', 'support_admin', 'Handles customer tickets, reports, and dispute resolutions'),
    ('00000000-0000-0000-0000-000000000006', 'content_admin', 'Moderates job postings, categories, skills, and platform articles')
ON CONFLICT (name) DO NOTHING;

-- 2. Granular Permissions
INSERT INTO public.permissions (name, description) VALUES
    ('manage_admins', 'Create, update, or revoke administrator accounts'),
    ('manage_roles', 'Define roles and permission matrices'),
    ('view_audit_logs', 'Inspect security and data mutation logs'),
    ('verify_companies', 'Approve or reject company registration documents'),
    ('moderate_jobs', 'Review, approve, pause, or suspend job postings'),
    ('manage_categories', 'Add, modify, and delete job categories and skills'),
    ('manage_finance', 'Refund payments and update subscription tiers'),
    ('resolve_complaints', 'Assign and resolve complaints and disputes'),
    ('manage_system_settings', 'Edit global application parameters and feature flags')
ON CONFLICT (name) DO NOTHING;

-- 3. Map Permissions to Roles
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'recruitment_admin' AND p.name IN ('moderate_jobs', 'manage_categories')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'verification_admin' AND p.name IN ('verify_companies')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'finance_admin' AND p.name IN ('manage_finance')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'support_admin' AND p.name IN ('resolve_complaints')
ON CONFLICT DO NOTHING;

-- 4. Subscription Plans
INSERT INTO public.subscription_plans (id, name, description, price, currency, billing_interval, features, max_active_jobs, max_applications) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Starter Recruiter', 'Ideal for startups hiring for individual roles', 49.00, 'USD', 'month', '["3 active job posts", "Basic applicant filtering", "Email support", "Standard listing visibility"]'::jsonb, 3, 100),
    ('10000000-0000-0000-0000-000000000002', 'Growth Team', 'Perfect for scaling teams and frequent hiring', 149.00, 'USD', 'month', '["15 active job posts", "Advanced skills assessments", "Priority applicant matching", "Candidate video interviews", "Featured job tag"]'::jsonb, 15, 1000),
    ('10000000-0000-0000-0000-000000000003', 'Enterprise Talent Suite', 'Complete recruitment management for high-volume staffing', 399.00, 'USD', 'month', '["Unlimited active jobs", "Custom ATS integration", "Dedicated verification badge", "Dedicated account manager", "Comprehensive analytics"]'::jsonb, 999, 10000)
ON CONFLICT (name) DO NOTHING;

-- 5. System Settings
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
    ('general_platform_name', '"TalentForge"', 'Platform display title'),
    ('require_company_verification_to_post', 'true', 'Whether recruiters require verified company status before publishing jobs'),
    ('max_resume_upload_size_mb', '15', 'Maximum resume file size in megabytes'),
    ('application_cooling_period_days', '30', 'Days before a rejected candidate can re-apply to the same position'),
    ('allowed_salary_currencies', '["USD", "EUR", "GBP", "CAD", "AUD", "SGD", "NGN", "ZAR", "KES"]', 'Supported currencies for compensation display')
ON CONFLICT (setting_key) DO NOTHING;

-- 6. Job Categories (20 categories)
INSERT INTO public.job_categories (id, name, slug, description, icon) VALUES
    ('20000000-0000-0000-0000-000000000001', 'Information Technology', 'information-technology', 'Software engineering, cloud infrastructure, AI, and cybersecurity', 'Code'),
    ('20000000-0000-0000-0000-000000000002', 'Healthcare & Medicine', 'healthcare-medicine', 'Clinical medicine, nursing, pharmacy, and medical research', 'HeartPulse'),
    ('20000000-0000-0000-0000-000000000003', 'Banking & Financial Services', 'banking-financial-services', 'Investment banking, corporate finance, accounting, and fintech', 'Landmark'),
    ('20000000-0000-0000-0000-000000000004', 'Engineering & Construction', 'engineering-construction', 'Civil, electrical, mechanical engineering, and architecture', 'HardHat'),
    ('20000000-0000-0000-0000-000000000005', 'Marketing & Communications', 'marketing-communications', 'Brand strategy, digital growth, social media, and SEO', 'Megaphone'),
    ('20000000-0000-0000-0000-000000000006', 'Sales & Business Development', 'sales-business-development', 'Account executive, enterprise sales, and client relationships', 'TrendingUp'),
    ('20000000-0000-0000-0000-000000000007', 'Human Resources', 'human-resources', 'Talent acquisition, organizational development, and employee relations', 'Users'),
    ('20000000-0000-0000-0000-000000000008', 'Education & Teaching', 'education-teaching', 'K-12 instruction, university faculty, corporate training, and EdTech', 'GraduationCap'),
    ('20000000-0000-0000-0000-000000000009', 'Legal & Compliance', 'legal-compliance', 'Corporate counsel, litigation, regulatory audit, and contract law', 'Scale'),
    ('20000000-0000-0000-0000-000000000010', 'Logistics & Supply Chain', 'logistics-supply-chain', 'Fleet management, warehousing, freight forwarding, and procurement', 'Truck'),
    ('20000000-0000-0000-0000-000000000011', 'Customer Service & Support', 'customer-service-support', 'Customer success, technical help desk, and omnichannel experience', 'Headphones'),
    ('20000000-0000-0000-0000-000000000012', 'Hospitality & Tourism', 'hospitality-tourism', 'Hotels, fine dining, event management, and travel curation', 'Utensils'),
    ('20000000-0000-0000-0000-000000000013', 'Design & Creative Arts', 'design-creative-arts', 'Product UI/UX design, graphic design, 3D art, and video production', 'Palette'),
    ('20000000-0000-0000-0000-000000000014', 'Manufacturing & Production', 'manufacturing-production', 'Factory operations, quality assurance, CNC, and industrial safety', 'Factory'),
    ('20000000-0000-0000-0000-000000000015', 'Energy & Renewable Resources', 'energy-renewable-resources', 'Solar, wind grid technology, battery storage, and clean utility', 'Zap'),
    ('20000000-0000-0000-0000-000000000016', 'Agriculture & Food Science', 'agriculture-food-science', 'Agronomy, hydroponics, food safety, and veterinary practice', 'Sprout'),
    ('20000000-0000-0000-0000-000000000017', 'Media & Journalism', 'media-journalism', 'Investigative reporting, podcast production, and publishing', 'Newspaper'),
    ('20000000-0000-0000-0000-000000000018', 'NGO & Social Impact', 'ngo-social-impact', 'Humanitarian relief, international development, and grant writing', 'Globe'),
    ('20000000-0000-0000-0000-000000000019', 'Security & Risk Management', 'security-risk-management', 'Physical guarding, executive protection, and loss prevention', 'ShieldCheck'),
    ('20000000-0000-0000-0000-000000000020', 'Remote & Flexible Roles', 'remote-flexible-roles', 'Specialized distributed-first positions worldwide', 'Laptop')
ON CONFLICT (name) DO NOTHING;

-- 7. Skills (45 skills across categories)
INSERT INTO public.skills (name, slug, category_id) VALUES
    ('TypeScript', 'typescript', '20000000-0000-0000-0000-000000000001'),
    ('React', 'react', '20000000-0000-0000-0000-000000000001'),
    ('Node.js', 'nodejs', '20000000-0000-0000-0000-000000000001'),
    ('PostgreSQL', 'postgresql', '20000000-0000-0000-0000-000000000001'),
    ('Python', 'python', '20000000-0000-0000-0000-000000000001'),
    ('Docker & Kubernetes', 'docker-kubernetes', '20000000-0000-0000-0000-000000000001'),
    ('Cloud Architecture (AWS/GCP)', 'cloud-architecture', '20000000-0000-0000-0000-000000000001'),
    ('Cybersecurity & Pen Testing', 'cybersecurity', '20000000-0000-0000-0000-000000000001'),
    ('Machine Learning & LLMs', 'machine-learning', '20000000-0000-0000-0000-000000000001'),
    ('UI/UX Prototyping (Figma)', 'figma-ui-ux', '20000000-0000-0000-0000-000000000013'),
    ('Design Systems', 'design-systems', '20000000-0000-0000-0000-000000000013'),
    ('Financial Modeling', 'financial-modeling', '20000000-0000-0000-0000-000000000003'),
    ('Accounting & Audit (GAAP/IFRS)', 'accounting-audit', '20000000-0000-0000-0000-000000000003'),
    ('Portfolio Management', 'portfolio-management', '20000000-0000-0000-0000-000000000003'),
    ('SEO & Growth Marketing', 'seo-growth-marketing', '20000000-0000-0000-0000-000000000005'),
    ('Content Strategy', 'content-strategy', '20000000-0000-0000-0000-000000000005'),
    ('Paid Advertising (SEM/PPC)', 'sem-ppc', '20000000-0000-0000-0000-000000000005'),
    ('B2B Enterprise Sales', 'b2b-enterprise-sales', '20000000-0000-0000-0000-000000000006'),
    ('CRM Management (Salesforce)', 'salesforce-crm', '20000000-0000-0000-0000-000000000006'),
    ('Contract Negotiation', 'contract-negotiation', '20000000-0000-0000-0000-000000000006'),
    ('Talent Sourcing', 'talent-sourcing', '20000000-0000-0000-0000-000000000007'),
    ('Compensation & Benefits', 'compensation-benefits', '20000000-0000-0000-0000-000000000007'),
    ('Employee Onboarding', 'employee-onboarding', '20000000-0000-0000-0000-000000000007'),
    ('Project Management (Agile/Scrum)', 'agile-scrum', '20000000-0000-0000-0000-000000000001'),
    ('Clinical Patient Care', 'clinical-patient-care', '20000000-0000-0000-0000-000000000002'),
    ('Electronic Health Records (EHR)', 'ehr-systems', '20000000-0000-0000-0000-000000000002'),
    ('Pharmaceutical Compounding', 'pharmaceutical-compounding', '20000000-0000-0000-0000-000000000002'),
    ('Structural Engineering', 'structural-engineering', '20000000-0000-0000-0000-000000000004'),
    ('AutoCAD & Revit BIM', 'autocad-revit', '20000000-0000-0000-0000-000000000004'),
    ('Site Safety Supervision (OSHA)', 'osha-site-safety', '20000000-0000-0000-0000-000000000004'),
    ('Warehouse Management (WMS)', 'warehouse-management', '20000000-0000-0000-0000-000000000010'),
    ('Supply Chain Optimization', 'supply-chain-optimization', '20000000-0000-0000-0000-000000000010'),
    ('Customer Success Strategy', 'customer-success-strategy', '20000000-0000-0000-0000-000000000011'),
    ('Zendesk & Intercom', 'zendesk-intercom', '20000000-0000-0000-0000-000000000011'),
    ('Corporate Legal Drafting', 'corporate-legal-drafting', '20000000-0000-0000-0000-000000000009'),
    ('Intellectual Property Law', 'intellectual-property', '20000000-0000-0000-0000-000000000009'),
    ('Lean Manufacturing & 6 Sigma', 'lean-six-sigma', '20000000-0000-0000-0000-000000000014'),
    ('Renewable Energy Grid Design', 'renewable-grid-design', '20000000-0000-0000-0000-000000000015'),
    ('Grant Writing & NGO Fundraising', 'grant-writing', '20000000-0000-0000-0000-000000000018'),
    ('Curriculum Development', 'curriculum-development', '20000000-0000-0000-0000-000000000008'),
    ('SQL & Data Analytics', 'sql-data-analytics', '20000000-0000-0000-0000-000000000001'),
    ('Copywriting & Technical Writing', 'technical-writing', '20000000-0000-0000-0000-000000000017'),
    ('Public Relations', 'public-relations', '20000000-0000-0000-0000-000000000005'),
    ('Video Editing (Premiere/After Effects)', 'video-editing', '20000000-0000-0000-0000-000000000013'),
    ('Hotel Operations Management', 'hotel-operations', '20000000-0000-0000-0000-000000000012')
ON CONFLICT (name) DO NOTHING;

-- 8. Sample Verified Seed Companies (6 companies)
INSERT INTO public.companies (id, company_name, slug, logo_url, description, industry, company_size, founded_year, website, email, country, state, city, verification_status, verified_at) VALUES
    ('30000000-0000-0000-0000-000000000001', 'Apex Cloud Solutions', 'apex-cloud-solutions', 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150', 'Next-generation cloud infrastructure orchestration and developer toolchain.', 'Information Technology', '51-200', 2019, 'https://apexcloud.example.com', 'careers@apexcloud.example.com', 'United States', 'California', 'San Francisco', 'verified', timezone('utc'::text, now())),
    ('30000000-0000-0000-0000-000000000002', 'Vanguard Health Systems', 'vanguard-health-systems', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150', 'Premier regional hospital network delivering compassionate patient-first medical care.', 'Healthcare & Medicine', '500-1000', 2008, 'https://vanguardhealth.example.com', 'jobs@vanguardhealth.example.com', 'United States', 'Massachusetts', 'Boston', 'verified', timezone('utc'::text, now())),
    ('30000000-0000-0000-0000-000000000003', 'Meridian Capital Partners', 'meridian-capital-partners', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150', 'Global investment banking, asset management, and fintech advisory advisory firm.', 'Banking & Financial Services', '201-500', 2012, 'https://meridiancap.example.com', 'recruitment@meridiancap.example.com', 'United Kingdom', 'Greater London', 'London', 'verified', timezone('utc'::text, now())),
    ('30000000-0000-0000-0000-000000000004', 'Solaris Green Power', 'solaris-green-power', 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=150', 'Building utility-scale clean solar arrays and grid energy storage systems.', 'Energy & Renewable Resources', '51-200', 2021, 'https://solarisgreen.example.com', 'talent@solarisgreen.example.com', 'Germany', 'Berlin', 'Berlin', 'verified', timezone('utc'::text, now())),
    ('30000000-0000-0000-0000-000000000005', 'Kinetix Global Logistics', 'kinetix-global-logistics', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150', 'Automated supply chain forwarding and smart cold-chain distribution network.', 'Logistics & Supply Chain', '1000+', 2014, 'https://kinetixlogistics.example.com', 'hr@kinetixlogistics.example.com', 'Canada', 'Ontario', 'Toronto', 'verified', timezone('utc'::text, now())),
    ('30000000-0000-0000-0000-000000000006', 'Elevate Creative Studio', 'elevate-creative-studio', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=150', 'Boutique branding agency designing digital experiences for fast-growing startups.', 'Design & Creative Arts', '11-50', 2022, 'https://elevatestudio.example.com', 'hello@elevatestudio.example.com', 'United States', 'New York', 'New York', 'under_review', NULL)
ON CONFLICT (slug) DO NOTHING;

-- 9. Sample Development Jobs (18 jobs across diverse roles and locations)
-- Notice: We create dummy author profile ID placeholder or use nil UUID for seed jobs
INSERT INTO public.jobs (
    id, company_id, created_by, category_id, title, slug, reference_number,
    description, responsibilities, requirements, education_requirement,
    experience_min, experience_max, salary_min, salary_max, salary_currency,
    salary_period, employment_type, work_mode, country, state, city,
    vacancies, status, is_featured, published_at
) VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        'Senior Full-Stack TypeScript Engineer',
        'senior-full-stack-typescript-engineer',
        'JOB-2026-0001',
        'Join our core cloud infrastructure team building high-performance web APIs and real-time distributed dashboards.',
        'Architect scalable microservices in Node.js and React; implement resilient PostgreSQL schemas and real-time WebSocket feeds.',
        'At least 5 years of professional TypeScript experience, strong proficiency in modern React, and deep knowledge of relational SQL.',
        'Bachelor in Computer Science or equivalent practical experience',
        5.0, 9.0, 140000.00, 180000.00, 'USD', 'year', 'full_time', 'remote',
        'United States', 'California', 'San Francisco', 2, 'published', true, timezone('utc'::text, now())
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        'DevOps & Kubernetes Specialist',
        'devops-kubernetes-specialist',
        'JOB-2026-0002',
        'Manage high-availability multi-region Kubernetes clusters on AWS and Google Cloud Platform.',
        'Build automated CI/CD pipelines with GitHub Actions; maintain Terraform infrastructure as code.',
        'Hands-on expertise with Docker, Kubernetes, Helm, Terraform, Prometheus, and Grafana.',
        'Certifications like CKA or AWS Solutions Architect preferred',
        4.0, 8.0, 130000.00, 165000.00, 'USD', 'year', 'full_time', 'hybrid',
        'United States', 'California', 'San Francisco', 1, 'published', false, timezone('utc'::text, now())
    ),
    (
        '40000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000002',
        'Registered Nurse (ICU Critical Care)',
        'registered-nurse-icu-critical-care',
        'JOB-2026-0003',
        'Deliver round-the-clock intensive critical patient care within a state-of-the-art cardiovascular ICU.',
        'Monitor vital telemetry; administer acute therapeutics; collaborate with multidisciplinary medical teams.',
        'Active RN license, BLS and ACLS certifications required, minimum 2 years intensive care experience.',
        'Bachelor of Science in Nursing (BSN)',
        2.0, 6.0, 85000.00, 115000.00, 'USD', 'year', 'full_time', 'on_site',
        'United States', 'Massachusetts', 'Boston', 4, 'published', true, timezone('utc'::text, now())
    ),
    (
        '40000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000003',
        'Senior Quantitative Financial Analyst',
        'senior-quantitative-financial-analyst',
        'JOB-2026-0004',
        'Conduct deep valuation modeling, capital allocation reviews, and private debt risk assessment.',
        'Construct financial forecast models; produce pitch decks for institutional investors.',
        'CFA designation or MBA, advanced Excel modeling and Python data processing skills.',
        'Master in Finance, Economics, or Mathematics',
        3.0, 7.0, 95000.00, 130000.00, 'GBP', 'year', 'full_time', 'hybrid',
        'United Kingdom', 'Greater London', 'London', 2, 'published', true, timezone('utc'::text, now())
    ),
    (
        '40000000-0000-0000-0000-000000000005',
        '30000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000015',
        'Lead Renewable Energy Project Engineer',
        'lead-renewable-energy-project-engineer',
        'JOB-2026-0005',
        'Oversee engineering, procurement, and construction of commercial 50MW solar energy installations.',
        'Perform grid interconnection simulations; supervise site contractor safety and timeline compliance.',
        'BS in Electrical Engineering, minimum 4 years in PV solar project engineering, knowledge of PVSyst.',
        'Bachelor of Science in Electrical or Energy Engineering',
        4.0, 10.0, 75000.00, 95000.00, 'EUR', 'year', 'full_time', 'hybrid',
        'Germany', 'Berlin', 'Berlin', 1, 'published', false, timezone('utc'::text, now())
    ),
    (
        '40000000-0000-0000-0000-000000000006',
        '30000000-0000-0000-0000-000000000005',
        '00000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000010',
        'Logistics Operations & Route Coordinator',
        'logistics-operations-route-coordinator',
        'JOB-2026-0006',
        'Optimize multi-stop cross-border trucking freight routes and carrier capacity utilization.',
        'Track active shipments; resolve customs clearance delays; audit fuel and driver safety logs.',
        'Familiarity with modern Transportation Management Systems (TMS) and freight billing compliance.',
        'Diploma or Degree in Supply Chain or Logistics Management',
        2.0, 5.0, 65000.00, 80000.00, 'CAD', 'year', 'full_time', 'on_site',
        'Canada', 'Ontario', 'Toronto', 3, 'published', false, timezone('utc'::text, now())
    ),
    (
        '40000000-0000-0000-0000-000000000006',
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000013',
        'Product UI/UX Designer',
        'product-ui-ux-designer',
        'JOB-2026-0007',
        'Create intuitive interfaces, user journey maps, and modular Figma design systems for web products.',
        'Produce high-fidelity wireframes; conduct interactive usability testing; collaborate with frontend devs.',
        'Strong visual design portfolio, proficiency in Figma and prototyping tools.',
        'Degree in HCI, Interaction Design, or relevant portfolio experience',
        3.0, 6.0, 90000.00, 120000.00, 'USD', 'year', 'contract', 'remote',
        'United States', 'New York', 'New York', 1, 'published', true, timezone('utc'::text, now())
    ),
    (
        '40000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000005',
        'Growth Marketing & SEO Specialist',
        'growth-marketing-seo-specialist',
        'JOB-2026-0008',
        'Drive organic traffic acquisition and qualified recruiter lead generation through data-backed content loops.',
        'Manage search marketing strategy, keyword research, on-page optimization, and technical SEO health.',
        'Proven track record scaling organic traffic in SaaS, proficiency in Google Analytics 4, Ahrefs, and Semrush.',
        'Bachelor degree in Marketing, Communications, or Business',
        3.0, 6.0, 80000.00, 110000.00, 'USD', 'year', 'full_time', 'remote',
        'United States', 'California', 'Los Angeles', 1, 'published', false, timezone('utc'::text, now())
    ),
    (
        '40000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000006',
        'Enterprise Account Executive',
        'enterprise-account-executive',
        'JOB-2026-0009',
        'Prospect, negotiate, and close high-value corporate recruitment subscriptions and software contracts.',
        'Run product demos for VP and C-level decision-makers; exceed quarterly ACV quota targets.',
        'Minimum 4 years closing B2B software deals, proficiency in Salesforce and consultative sales methodologies.',
        'Bachelor degree required',
        4.0, 8.0, 100000.00, 140000.00, 'GBP', 'year', 'full_time', 'hybrid',
        'United Kingdom', 'Greater London', 'London', 2, 'published', false, timezone('utc'::text, now())
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000002',
        'Clinical Pharmacist',
        'clinical-pharmacist',
        'JOB-2026-0010',
        'Review inpatient medication therapy regimens, dose adjustments, and compound sterile admixtures.',
        'Provide clinical guidance to attending physicians on drug interactions and antimicrobial stewardship.',
        'PharmD degree, active state board pharmacy license, residency training preferred.',
        'Doctor of Pharmacy (PharmD)',
        2.0, 5.0, 120000.00, 145000.00, 'USD', 'year', 'full_time', 'on_site',
        'United States', 'Massachusetts', 'Boston', 1, 'published', false, timezone('utc'::text, now())
    ),
    (
        '40000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000007',
        'Technical Recruiter',
        'technical-recruiter',
        'JOB-2026-0011',
        'Source, screen, and interview top software engineering talent across global timezones.',
        'Partner with engineering managers to draft role scorecards and run structured interview debriefs.',
        'Experience sourcing via LinkedIn Recruiter and GitHub, strong technical domain understanding.',
        'Bachelor degree in HR or relevant experience',
        3.0, 7.0, 85000.00, 115000.00, 'USD', 'year', 'full_time', 'remote',
        'United States', 'Texas', 'Austin', 1, 'published', false, timezone('utc'::text, now())
    ),
    (
        '40000000-0000-0000-0000-000000000005',
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000011',
        'Customer Support Team Lead',
        'customer-support-team-lead',
        'JOB-2026-0012',
        'Lead our 24/7 customer support specialist team resolving recruiter and applicant inquiries.',
        'Track First Contact Resolution (FCR) and CSAT metrics; train tier-1 agents on escalation paths.',
        'Experience administering Zendesk or Intercom, exceptional empathy and crisis communication skills.',
        'High School Diploma or equivalent; college degree preferred',
        3.0, 6.0, 60000.00, 75000.00, 'CAD', 'year', 'full_time', 'hybrid',
        'Canada', 'Ontario', 'Toronto', 1, 'published', false, timezone('utc'::text, now())
    ),
    (
        '40000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000009',
        'Corporate Legal Counsel',
        'corporate-legal-counsel',
        'JOB-2026-0013',
        'Review commercial SaaS agreements, vendor contracts, GDPR/privacy policies, and labor compliance.',
        'Negotiate master service agreements and security data processing addenda with enterprise counterparties.',
        'Qualified solicitor or admitted to the bar, minimum 4 years PQE in corporate or tech commercial law.',
        'Juris Doctor or LLB with active practicing certificate',
        4.0, 8.0, 110000.00, 150000.00, 'GBP', 'year', 'full_time', 'hybrid',
        'United Kingdom', 'Greater London', 'London', 1, 'published', false, timezone('utc'::text, now())
    ),
    (
        '40000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000004',
        'Civil Structural Project Architect',
        'civil-structural-project-architect',
        'JOB-2026-0014',
        'Design structural frameworks, wind load calculations, and foundation piles for renewable substations.',
        'Generate detailed architectural drawings in Revit BIM and coordinate with municipal permitting bodies.',
        'Licensed Professional Engineer (PE) or Registered Architect, proficiency in AutoCAD and Revit.',
        'Master or Bachelor of Architecture / Civil Engineering',
        5.0, 10.0, 80000.00, 105000.00, 'EUR', 'year', 'full_time', 'on_site',
        'Germany', 'Bavaria', 'Munich', 1, 'published', false, timezone('utc'::text, now())
    ),
    (
        '40000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        'Junior Frontend Engineer (React/Vite)',
        'junior-frontend-engineer-react',
        'JOB-2026-0015',
        'Build accessible user interfaces, component libraries, and interactive career search filters.',
        'Implement responsive designs using Tailwind CSS; write unit tests with Vitest.',
        'Solid grounding in modern JavaScript, HTML5 semantic markup, CSS, and basic React hooks.',
        'Bachelor in Computer Science, Bootcamp graduate, or equivalent self-taught portfolio',
        1.0, 2.5, 75000.00, 95000.00, 'USD', 'year', 'full_time', 'remote',
        'United States', 'Washington', 'Seattle', 2, 'published', false, timezone('utc'::text, now())
    )
ON CONFLICT (reference_number) DO NOTHING;
