export interface AutomatedEmailMessage {
  id: string;
  triggerId: string;
  triggerName: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  previewText: string;
  htmlBody: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked';
  sentAt: string;
  deliveredAt: string;
  openedAt?: string;
  channel: 'email' | 'in_app' | 'both';
}

export interface InAppNotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'payment' | 'application' | 'interview' | 'security' | 'system';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface AutomationTriggerConfig {
  id: string;
  name: string;
  category: 'Billing & Payments' | 'Recruitment & Jobs' | 'Interviews' | 'Account & Security';
  description: string;
  enabled: boolean;
  totalTriggered: number;
  openRate: number; // percentage
  deliveryRate: number; // percentage
  sampleRecipient: string;
}

class EmailAutomationService {
  private listeners: Array<() => void> = [];

  public getTriggers(): AutomationTriggerConfig[] {
    const saved = localStorage.getItem('jobhub_email_triggers') || localStorage.getItem('talentforge_email_triggers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'payment_confirmation',
        name: 'Instant Payment Confirmation & Tax Invoice',
        category: 'Billing & Payments',
        description: 'Auto-dispatched immediately after Paystack, Bank Transfer, USSD, or OPay settlement with breakdown in selected currency.',
        enabled: true,
        totalTriggered: 0,
        openRate: 100,
        deliveryRate: 100,
        sampleRecipient: 'finance@jobhub.io',
      },
      {
        id: 'welcome_candidate',
        name: 'Candidate Welcome & ATS Profile Activation',
        category: 'Account & Security',
        description: 'Sent upon candidate registration with personalized job recommendations and CV builder guide.',
        enabled: true,
        totalTriggered: 0,
        openRate: 100,
        deliveryRate: 100,
        sampleRecipient: 'candidate@jobhub.io',
      },
      {
        id: 'employer_welcome',
        name: 'Employer Account Setup & KYC Verification',
        category: 'Account & Security',
        description: 'Sent to recruiting managers with company verification document upload guide and hiring workspace links.',
        enabled: true,
        totalTriggered: 0,
        openRate: 100,
        deliveryRate: 100,
        sampleRecipient: 'recruiter@company.com',
      },
      {
        id: 'interview_invitation',
        name: 'Technical Interview Invitation & Calendar Link',
        category: 'Interviews',
        description: 'Automated video conference link, time zone synchronization, and interviewer briefing notes.',
        enabled: true,
        totalTriggered: 0,
        openRate: 100,
        deliveryRate: 100,
        sampleRecipient: 'applicant@candidate.com',
      },
      {
        id: 'application_submitted',
        name: 'Job Application Received & Tracking Digest',
        category: 'Recruitment & Jobs',
        description: 'Instant notification to candidate confirming receipt of application and next screening steps.',
        enabled: true,
        totalTriggered: 0,
        openRate: 100,
        deliveryRate: 100,
        sampleRecipient: 'applicant@candidate.com',
      },
      {
        id: 'employer_new_candidate',
        name: 'New High-Match Applicant Alert for Recruiter',
        category: 'Recruitment & Jobs',
        description: 'Instant alert dispatched to hiring managers whenever a top-tier candidate matches job posting criteria.',
        enabled: true,
        totalTriggered: 0,
        openRate: 100,
        deliveryRate: 100,
        sampleRecipient: 'recruiting-team@company.com',
      },
    ];
  }

  public saveTriggers(triggers: AutomationTriggerConfig[]): void {
    localStorage.setItem('jobhub_email_triggers', JSON.stringify(triggers));
    this.notify();
  }

  public toggleTrigger(triggerId: string): void {
    const list = this.getTriggers();
    const updated = list.map((t) => (t.id === triggerId ? { ...t, enabled: !t.enabled } : t));
    this.saveTriggers(updated);
  }

  public getSentEmails(): AutomatedEmailMessage[] {
    const saved = localStorage.getItem('jobhub_sent_emails') || localStorage.getItem('talentforge_sent_emails');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [];
  }

  public getInAppNotifications(): InAppNotificationItem[] {
    const saved = localStorage.getItem('jobhub_inapp_notifications') || localStorage.getItem('talentforge_inapp_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [];
  }

  public markNotificationRead(id: string): void {
    const notifs = this.getInAppNotifications();
    const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem('jobhub_inapp_notifications', JSON.stringify(updated));
    this.notify();
  }

  public markAllNotificationsRead(): void {
    const notifs = this.getInAppNotifications();
    const updated = notifs.map((n) => ({ ...n, read: true }));
    localStorage.setItem('jobhub_inapp_notifications', JSON.stringify(updated));
    this.notify();
  }

  public addInAppNotification(notif: Omit<InAppNotificationItem, 'id' | 'createdAt' | 'read'>): void {
    const list = this.getInAppNotifications();
    const newItem: InAppNotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newItem);
    localStorage.setItem('jobhub_inapp_notifications', JSON.stringify(list));
    this.notify();
  }

  public recordSentEmail(email: AutomatedEmailMessage): void {
    const list = this.getSentEmails();
    list.unshift(email);
    localStorage.setItem('jobhub_sent_emails', JSON.stringify(list));

    // Update trigger total
    const triggers = this.getTriggers();
    const trig = triggers.find((t) => t.id === email.triggerId);
    if (trig) {
      trig.totalTriggered += 1;
      this.saveTriggers(triggers);
    }
    this.notify();
  }

  public async triggerPaymentConfirmation(params: {
    customerName: string;
    customerEmail: string;
    planName: string;
    amount: number;
    currency: string;
    formattedAmount: string;
    paymentChannel: string;
    transactionReference: string;
    invoiceNumber: string;
    paidAt: string;
  }): Promise<AutomatedEmailMessage> {
    const htmlBody = this.generatePaymentEmailHtml(params);
    const email: AutomatedEmailMessage = {
      id: `em-${Date.now()}`,
      triggerId: 'payment_confirmation',
      triggerName: 'Instant Payment Confirmation & Tax Invoice',
      recipientEmail: params.customerEmail,
      recipientName: params.customerName,
      subject: `Payment Confirmed: ${params.planName} [${params.transactionReference}]`,
      previewText: `Payment of ${params.formattedAmount} via ${params.paymentChannel} received. Your invoice ${params.invoiceNumber} is attached.`,
      htmlBody,
      status: 'delivered',
      sentAt: params.paidAt,
      deliveredAt: new Date().toISOString(),
      channel: 'both',
    };

    this.recordSentEmail(email);

    // Also push to in-app notification
    this.addInAppNotification({
      title: `Payment Received: ${params.formattedAmount}`,
      message: `Your payment for ${params.planName} via ${params.paymentChannel} was confirmed successfully. Ref: ${params.transactionReference}`,
      category: 'payment',
      actionUrl: '/employer/billing',
      actionLabel: 'View Invoices',
    });

    return email;
  }

  public async triggerTestEmail(triggerId: string): Promise<AutomatedEmailMessage> {
    const triggers = this.getTriggers();
    const trigger = triggers.find((t) => t.id === triggerId) || triggers[0];

    let subject = '';
    let preview = '';
    let html = '';

    if (triggerId === 'payment_confirmation') {
      subject = 'Payment Confirmed: Enterprise Talent Suite [TXN-TEST-99214]';
      preview = 'Official receipt of ₦148,000 via Paystack / Bank Transfer.';
      html = this.generatePaymentEmailHtml({
        customerName: 'Test Account User',
        customerEmail: 'test@jobhub.platform',
        planName: 'Enterprise Talent Suite',
        amount: 148000,
        currency: 'NGN',
        formattedAmount: '₦148,000',
        paymentChannel: 'Paystack Automated Rail',
        transactionReference: 'TXN-TEST-99214',
        invoiceNumber: 'INV-2026-99214',
        paidAt: new Date().toISOString(),
      });
    } else if (triggerId === 'interview_invitation') {
      subject = 'Interview Scheduled: Technical Staff Interview';
      preview = 'Your interview is confirmed for tomorrow at 2:00 PM WAT on Google Meet.';
      html = this.generateInterviewEmailHtml('Applicant', 'Verified Organization', 'Staff Engineer');
    } else if (triggerId === 'application_submitted') {
      subject = 'Application Confirmed: Technical Application Received';
      preview = 'Your application has been delivered to the hiring team.';
      html = this.generateApplicationSubmittedEmailHtml('Applicant', 'Staff Engineer', 'Hiring Organization');
    } else {
      subject = `Welcome to JOBHUB! [${trigger.name}]`;
      preview = 'Your account has been activated.';
      html = this.generateWelcomeEmailHtml('Member', 'member@jobhub.platform', 'candidate');
    }

    const email: AutomatedEmailMessage = {
      id: `em-test-${Date.now()}`,
      triggerId: trigger.id,
      triggerName: trigger.name,
      recipientEmail: 'test-recipient@jobhub.platform',
      recipientName: 'Test Recipient',
      subject,
      previewText: preview,
      htmlBody: html,
      status: 'delivered',
      sentAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
      channel: 'email',
    };

    this.recordSentEmail(email);

    this.addInAppNotification({
      title: `Automation Trigger Fired: ${trigger.name}`,
      message: `Test email dispatched to test-recipient@jobhub.platform with 100% delivery score.`,
      category: 'system',
    });

    return email;
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  // Responsive HTML Email Templates
  public generatePaymentEmailHtml(params: {
    customerName: string;
    customerEmail: string;
    planName: string;
    amount: number;
    currency: string;
    formattedAmount: string;
    paymentChannel: string;
    transactionReference: string;
    invoiceNumber: string;
    paidAt: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt - JOBHUB</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f1f5f9; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; }
          .header { background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .badge { display: inline-block; background: rgba(255,255,255,0.2); backdrop-filter: blur(8px); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #ffffff; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
          .content { padding: 32px 24px; }
          .intro { font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px; }
          .receipt-box { background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 20px; margin-bottom: 24px; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #334155; font-size: 14px; }
          .row:last-child { border-bottom: none; }
          .label { color: #94a3b8; }
          .value { color: #f8fafc; font-weight: 600; text-align: right; }
          .total-row { padding-top: 14px; font-size: 18px; font-weight: 800; color: #38bdf8; }
          .stamp { display: inline-block; border: 2px solid #10b981; color: #10b981; font-weight: 800; font-size: 12px; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; letter-spacing: 1px; margin-top: 8px; }
          .cta-btn { display: block; text-align: center; background: #4f46e5; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 24px; border-radius: 10px; margin-top: 24px; }
          .footer { background: #0b1120; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JOBHUB</h1>
            <p style="margin:4px 0 0; font-size:12px; color:#c7d2fe;">powered by genesix initiate group ltd</p>
            <div class="badge">Official Payment Receipt & Tax Invoice</div>
          </div>
          <div class="content">
            <p class="intro">
              Hello <strong>${params.customerName}</strong>,<br>
              We have successfully confirmed your settlement of <strong>${params.formattedAmount}</strong> via <strong>${params.paymentChannel}</strong>. Your plan entitlements have been unlocked in your organization workspace.
            </p>

            <div class="receipt-box">
              <div class="row">
                <span class="label">Invoice Reference:</span>
                <span class="value">${params.invoiceNumber}</span>
              </div>
              <div class="row">
                <span class="label">Transaction Reference:</span>
                <span class="value" style="font-family: monospace;">${params.transactionReference}</span>
              </div>
              <div class="row">
                <span class="label">Subscription Tier / Package:</span>
                <span class="value">${params.planName}</span>
              </div>
              <div class="row">
                <span class="label">Payment Rail:</span>
                <span class="value">${params.paymentChannel}</span>
              </div>
              <div class="row">
                <span class="label">Currency & Amount:</span>
                <span class="value">${params.currency} (${params.formattedAmount})</span>
              </div>
              <div class="row">
                <span class="label">Date & Time Settled:</span>
                <span class="value">${new Date(params.paidAt).toLocaleString()}</span>
              </div>
              <div class="row">
                <span class="label">Settlement Status:</span>
                <span class="value"><span class="stamp">PAID & SETTLED</span></span>
              </div>
            </div>

            <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
              This email serves as your official electronic value-added tax invoice. All multi-currency transactions are processed via audited bank integrations and PCI-DSS compliant payment switches.
            </p>

            <a href="#dashboard" class="cta-btn">Access Employer Console & Entitlements &rarr;</a>
          </div>
          <div class="footer">
            &copy; 2026 JOBHUB powered by genesix initiate group ltd. All rights reserved.<br>
            Multi-currency rails: Paystack &bull; Automated Bank Transfer &bull; USSD (All Banks) &bull; OPay Transfer
          </div>
        </div>
      </body>
      </html>
    `;
  }

  public generateWelcomeEmailHtml(name: string, email: string, role: 'candidate' | 'employer'): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #f1f5f9; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; }
          .header { background: linear-gradient(135deg, #10b981, #3b82f6); padding: 32px 24px; text-align: center; color: white; }
          .content { padding: 32px 24px; font-size: 15px; line-height: 1.6; color: #cbd5e1; }
          .cta-btn { display: block; text-align: center; background: #10b981; color: #ffffff; text-decoration: none; font-weight: 700; padding: 14px 24px; border-radius: 10px; margin-top: 24px; }
          .footer { background: #0b1120; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">Welcome to JOBHUB</h1>
            <p style="margin:6px 0 0; font-size:14px; opacity:0.9;">powered by genesix initiate group ltd</p>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Welcome to JOBHUB! Your ${role === 'candidate' ? 'Job Seeker & Candidate' : 'Employer & Recruiter'} workspace has been configured.</p>
            <p>Here is what you can do right away:</p>
            <ul>
              <li><strong>${role === 'candidate' ? 'Explore 14,000+ Verified Tech Positions' : 'Post Verified Job Openings'}</strong></li>
              <li><strong>${role === 'candidate' ? 'Build ATS-Ready CV with Real-time Scoring' : 'Automated Candidate Screening & Assessments'}</strong></li>
              <li><strong>Real-time Application Status & Video Interview Rooms</strong></li>
            </ul>
            <a href="#portal" class="cta-btn">Enter Your Portal Now &rarr;</a>
          </div>
          <div class="footer">
            JOBHUB Network &bull; powered by genesix initiate group ltd
          </div>
        </div>
      </body>
      </html>
    `;
  }

  public generateInterviewEmailHtml(candidateName: string, companyName: string, jobTitle: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #f1f5f9; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; }
          .header { background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 30px; text-align: center; color: white; }
          .content { padding: 30px; font-size: 15px; line-height: 1.6; color: #cbd5e1; }
          .card { background: #1e293b; border-radius: 10px; padding: 18px; margin: 18px 0; border: 1px solid #334155; }
          .btn { display: block; text-align: center; background: #8b5cf6; color: white; font-weight: 700; padding: 14px; border-radius: 10px; text-decoration: none; }
          .footer { background: #0b1120; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">Interview Invitation</h1>
            <p style="margin:4px 0 0; opacity:0.9;">${companyName} &bull; ${jobTitle}</p>
          </div>
          <div class="content">
            <p>Dear <strong>${candidateName}</strong>,</p>
            <p>Congratulations! Your background and engineering portfolio have impressed the hiring team at <strong>${companyName}</strong>.</p>
            <div class="card">
              <p style="margin:4px 0;"><strong>Role:</strong> ${jobTitle}</p>
              <p style="margin:4px 0;"><strong>Company:</strong> ${companyName}</p>
              <p style="margin:4px 0;"><strong>Format:</strong> High-Definition Video Architecture Discussion</p>
              <p style="margin:4px 0;"><strong>Duration:</strong> 45 minutes</p>
            </div>
            <a href="#interviews" class="btn">Confirm Interview Slot & Access Video Room &rarr;</a>
          </div>
          <div class="footer">JOBHUB Video Screening Automation</div>
        </div>
      </body>
      </html>
    `;
  }

  public generateApplicationSubmittedEmailHtml(candidateName: string, jobTitle: string, companyName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #f1f5f9; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; }
          .header { background: linear-gradient(135deg, #0284c7, #14b8a6); padding: 30px; text-align: center; color: white; }
          .content { padding: 30px; font-size: 15px; line-height: 1.6; color: #cbd5e1; }
          .footer { background: #0b1120; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">Application Confirmed</h1>
            <p style="margin:4px 0 0; opacity:0.9;">${jobTitle} at ${companyName}</p>
          </div>
          <div class="content">
            <p>Hi <strong>${candidateName}</strong>,</p>
            <p>Your application for <strong>${jobTitle}</strong> has been transmitted to <strong>${companyName}</strong>.</p>
            <p>You can track the progress of your application in real-time through your Candidate Portal dashboard.</p>
          </div>
          <div class="footer">JOBHUB Automated Application Rail</div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailAutomationService = new EmailAutomationService();
export const emailAutomation = emailAutomationService;
