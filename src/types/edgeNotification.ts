import { ApplicationStatus } from './database';

export type ApplicationNotificationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected';

export type SubscriptionNotificationEvent =
  | 'subscription_created'
  | 'subscription_upgraded'
  | 'subscription_renewed'
  | 'plan_price_changed'
  | 'payment_received'
  | 'subscription_expiring'
  | 'subscription_cancelled';

export interface ApplicationEmailTrigger {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
  companyName: string;
  status: ApplicationNotificationStatus;
  notes?: string;
  interviewDate?: string;
  interviewMeetingLink?: string;
  salaryOffer?: string;
  feedbackMessage?: string;
  portalUrl?: string;
}

export interface SubscriptionEmailTrigger {
  subscriptionId: string;
  customerName: string;
  customerEmail: string;
  companyName?: string;
  planName: string;
  eventType: SubscriptionNotificationEvent;
  amount: number;
  currency: string;
  previousPlan?: string;
  newPrice?: number;
  effectiveDate?: string;
  nextBillingDate?: string;
  invoiceNumber?: string;
  paymentChannel?: string;
  portalUrl?: string;
}

export interface EdgeNotificationResponse {
  id: string;
  success: boolean;
  executionMode: 'live_edge_function' | 'edge_simulated_runtime';
  functionName: string;
  edgeExecutionId: string;
  durationMs: number;
  recipient: string;
  subject: string;
  category: 'application_status' | 'subscription_update';
  eventType: string;
  status: 'queued' | 'dispatched' | 'delivered' | 'failed';
  timestamp: string;
  htmlPreview: string;
  payload: Record<string, any>;
  httpStatusCode: number;
  error?: string;
}

export interface TriggerRuleConfig {
  id: string;
  name: string;
  category: 'application_status' | 'subscription_update';
  eventType: string;
  description: string;
  enabled: boolean;
  edgeFunctionName: string;
  totalTriggered: number;
  lastTriggeredAt?: string;
  sampleRecipient: string;
}

export interface EdgeFunctionSettings {
  functionName: string;
  supabaseUrl: string;
  anonKeyPresent: boolean;
  autoDispatchOnApplicationChange: boolean;
  autoDispatchOnPricingChange: boolean;
  senderName: string;
  senderEmail: string;
  testMode: boolean;
}
