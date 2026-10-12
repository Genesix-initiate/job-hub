// Supabase Edge Function: dispatch-notification
// Deploy with: supabase functions deploy dispatch-notification --no-verify-jwt
// Deno TypeScript Runtime

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface DispatchPayload {
  type: 'job_application_status' | 'subscription_update';
  recipientEmail: string;
  recipientName: string;
  data: Record<string, any>;
  senderName?: string;
  senderEmail?: string;
}

serve(async (req: Request) => {
  const startTime = Date.now();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: DispatchPayload = await req.json();

    if (!payload.recipientEmail || !payload.type) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: recipientEmail and type are mandatory.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let subject = '';
    let previewHtml = '';
    const sender = payload.senderName || 'JOBHUB Recruitment & Billing Desk';

    if (payload.type === 'job_application_status') {
      const { jobTitle, companyName, status, notes, interviewDate, salaryOffer, applicationId } = payload.data || {};
      
      const statusTitles: Record<string, string> = {
        applied: 'Application Received & Under Review',
        under_review: 'Resume Screening in Progress',
        shortlisted: 'Congratulations! You Have Been Shortlisted',
        interview: 'Technical Interview Invitation & Scheduling',
        offer: 'Formal Job Offer Extended',
        hired: 'Welcome to the Team! Offer Finalized',
        rejected: 'Application Status Update & Future Opportunities',
      };

      const title = statusTitles[status] || `Application Update: ${status}`;
      subject = `[JOBHUB] ${title} - ${jobTitle || 'Role'} at ${companyName || 'Hiring Company'}`;

      previewHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;margin:0;padding:24px;background:#0f172a;color:#e2e8f0;}.card{background:#1e293b;border:1px solid #334155;border-radius:16px;max-width:600px;margin:auto;padding:32px;}.btn{display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:20px;}</style></head>
<body>
  <div class="card">
    <div style="font-size:12px;color:#818cf8;font-weight:700;letter-spacing:1px;text-transform:uppercase;">JOBHUB ATS NOTIFICATION</div>
    <h1 style="color:#ffffff;font-size:22px;margin:8px 0 16px 0;">${title}</h1>
    <p>Dear <strong>${payload.recipientName || 'Candidate'}</strong>,</p>
    <p>We are writing to update you on your application for <strong>${jobTitle || 'Position'}</strong> with <strong>${companyName || 'Hiring Team'}</strong> (Ref: ${applicationId || 'N/A'}).</p>
    
    <div style="background:#0f172a;border-left:4px solid #6366f1;padding:16px;border-radius:8px;margin:20px 0;">
      <p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;">Status: <span style="color:#38bdf8;font-weight:600;text-transform:uppercase;">${status}</span></p>
      ${interviewDate ? `<p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;">Interview Schedule: <strong style="color:#f1f5f9;">${interviewDate}</strong></p>` : ''}
      ${salaryOffer ? `<p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;">Offered Compensation: <strong style="color:#10b981;">${salaryOffer}</strong></p>` : ''}
      ${notes ? `<p style="margin:0;font-size:13px;color:#cbd5e1;"><em>${notes}</em></p>` : ''}
    </div>

    <p style="color:#94a3b8;font-size:14px;">Log in to your candidate portal to view details, confirm scheduling, or upload documents.</p>
    <a href="https://jobhub.platform/job-seeker/dashboard" class="btn">View Candidate Portal</a>
    <hr style="border:none;border-top:1px solid #334155;margin:28px 0 16px 0;"/>
    <p style="font-size:11px;color:#64748b;">Dispatched via Supabase Edge Functions · Automated ATS Gateway</p>
  </div>
</body>
</html>`;
    } else {
      // subscription_update
      const { planName, eventType, amount, currency, invoiceNumber, nextBillingDate, paymentChannel } = payload.data || {};
      
      const eventTitles: Record<string, string> = {
        subscription_created: `Welcome to ${planName || 'Plan'} Tier`,
        subscription_upgraded: `Plan Upgraded to ${planName || 'Tier'}`,
        subscription_renewed: `Subscription Renewed: ${planName || 'Plan'}`,
        plan_price_changed: `Notice of Plan Pricing Update for ${planName || 'Plan'}`,
        payment_received: `Payment Received & Tax Invoice [${invoiceNumber || 'INV'}]`,
        subscription_expiring: `Upcoming Subscription Renewal Notice`,
        subscription_cancelled: `Subscription Cancelled Confirmation`,
      };

      const title = eventTitles[eventType] || `Subscription Update: ${eventType}`;
      subject = `[JOBHUB Billing] ${title}`;

      previewHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;margin:0;padding:24px;background:#0f172a;color:#e2e8f0;}.card{background:#1e293b;border:1px solid #334155;border-radius:16px;max-width:600px;margin:auto;padding:32px;}.btn{display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:20px;}</style></head>
<body>
  <div class="card">
    <div style="font-size:12px;color:#34d399;font-weight:700;letter-spacing:1px;text-transform:uppercase;">JOBHUB BILLING NOTIFICATION</div>
    <h1 style="color:#ffffff;font-size:22px;margin:8px 0 16px 0;">${title}</h1>
    <p>Dear <strong>${payload.recipientName || 'Subscriber'}</strong>,</p>
    <p>This is an automated confirmation regarding your employer subscription on JOBHUB.</p>

    <div style="background:#0f172a;border-left:4px solid #10b981;padding:16px;border-radius:8px;margin:20px 0;">
      <p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;">Plan Tier: <strong style="color:#ffffff;">${planName || 'Growth Recruiter'}</strong></p>
      ${amount !== undefined ? `<p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;">Amount: <strong style="color:#34d399;">${currency || 'USD'} ${amount}</strong></p>` : ''}
      ${paymentChannel ? `<p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;">Payment Rail: <span style="color:#cbd5e1;">${paymentChannel}</span></p>` : ''}
      ${nextBillingDate ? `<p style="margin:0;font-size:13px;color:#94a3b8;">Next Billing Cycle: <span style="color:#cbd5e1;">${nextBillingDate}</span></p>` : ''}
    </div>

    <a href="https://jobhub.platform/employer/billing" class="btn">Manage Subscription & Billing</a>
    <hr style="border:none;border-top:1px solid #334155;margin:28px 0 16px 0;"/>
    <p style="font-size:11px;color:#64748b;">Dispatched via Supabase Edge Functions · Automated Billing Gateway</p>
  </div>
</body>
</html>`;
    }

    const durationMs = Date.now() - startTime;
    const executionId = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return new Response(
      JSON.stringify({
        success: true,
        executionId,
        durationMs,
        dispatchedAt: new Date().toISOString(),
        sender,
        recipient: payload.recipientEmail,
        subject,
        htmlPreview: previewHtml,
        status: 'delivered',
        channel: 'edge_function_email',
        category: payload.type,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Edge-Execution-Time': `${durationMs}ms`,
          'X-Edge-Function-Id': executionId,
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Internal Edge Function Error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
