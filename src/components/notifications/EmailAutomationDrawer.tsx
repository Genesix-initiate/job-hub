import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Mail,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  Monitor,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  ShieldCheck,
  Check,
  RefreshCw,
  Zap,
} from 'lucide-react';
import {
  emailAutomationService,
  AutomatedEmailMessage,
  InAppNotificationItem,
  AutomationTriggerConfig,
} from '../../lib/emailAutomation';

export interface EmailAutomationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'notifications' | 'automation';
}

export function EmailAutomationDrawer({
  isOpen,
  onClose,
  defaultTab = 'notifications',
}: EmailAutomationDrawerProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'automation' | 'history'>(defaultTab);
  const [notifications, setNotifications] = useState<InAppNotificationItem[]>([]);
  const [triggers, setTriggers] = useState<AutomationTriggerConfig[]>([]);
  const [sentEmails, setSentEmails] = useState<AutomatedEmailMessage[]>([]);
  const [selectedEmailPreview, setSelectedEmailPreview] = useState<AutomatedEmailMessage | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [testFiringId, setTestFiringId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    const loadState = () => {
      setNotifications(emailAutomationService.getInAppNotifications());
      setTriggers(emailAutomationService.getTriggers());
      setSentEmails(emailAutomationService.getSentEmails());
    };

    loadState();
    const unsub = emailAutomationService.subscribe(loadState);
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleTestTrigger = async (triggerId: string) => {
    setTestFiringId(triggerId);
    try {
      const email = await emailAutomationService.triggerTestEmail(triggerId);
      setSuccessToast(`Automated email dispatched: "${email.subject}"`);
      setTimeout(() => setSuccessToast(null), 4000);
      setSelectedEmailPreview(email);
    } catch (e) {
      console.error(e);
    } finally {
      setTestFiringId(null);
    }
  };

  const handleToggle = (id: string) => {
    emailAutomationService.toggleTrigger(id);
    setTriggers(emailAutomationService.getTriggers());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                {activeTab === 'notifications' ? <Bell className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Email Automation & Notifications
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">Live webhook rails & transactional automated templates</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Bar */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-3 px-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'notifications'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Live Alerts ({notifications.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('automation')}
              className={`py-3 px-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'automation'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Active Automation Triggers ({triggers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Dispatched Emails ({sentEmails.length})</span>
            </button>
          </div>

          {/* Success Toast */}
          {successToast && (
            <div className="bg-emerald-950 border-b border-emerald-800 text-emerald-300 text-xs py-2 px-4 flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {successToast}
              </span>
              <button
                onClick={() => setSuccessToast(null)}
                className="text-emerald-400 hover:text-emerald-200"
              >
                &times;
              </button>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* TAB 1: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs text-slate-400">System Notification Feed</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => emailAutomationService.markAllNotificationsRead()}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No new notifications in stream.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => emailAutomationService.markNotificationRead(notif.id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        notif.read
                          ? 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                          : 'bg-indigo-950/20 border-indigo-500/30 text-white shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                          )}
                          <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 pl-4 leading-relaxed">{notif.message}</p>
                      {notif.actionUrl && (
                        <div className="mt-2 pl-4">
                          <a
                            href={notif.actionUrl}
                            onClick={onClose}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                          >
                            {notif.actionLabel || 'View Details'} &rarr;
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: AUTOMATION TRIGGERS */}
            {activeTab === 'automation' && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                  <strong className="text-white">Continuous Transactional Automation:</strong> Real-time triggers
                  fire responsive multi-device HTML emails for candidate onboarding, receipts in any currency (NGN ₦, USD $, etc.), interview links, and recruiter alerts.
                </div>

                <div className="space-y-3">
                  {triggers.map((trigger) => (
                    <div
                      key={trigger.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white">{trigger.name}</h4>
                            <span className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                              {trigger.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {trigger.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggle(trigger.id)}
                          className="text-slate-400 hover:text-white transition cursor-pointer shrink-0"
                          title={trigger.enabled ? 'Disable trigger' : 'Enable trigger'}
                        >
                          {trigger.enabled ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                              PAUSED
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Performance metrics & Test button */}
                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-3 text-slate-400 font-mono">
                          <span>Sent: <strong className="text-white">{trigger.totalTriggered}</strong></span>
                          <span>Delivered: <strong className="text-emerald-400">{trigger.deliveryRate}%</strong></span>
                          <span>Opened: <strong className="text-indigo-400">{trigger.openRate}%</strong></span>
                        </div>

                        <button
                          type="button"
                          disabled={testFiringId === trigger.id}
                          onClick={() => handleTestTrigger(trigger.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] transition cursor-pointer disabled:opacity-50"
                        >
                          {testFiringId === trigger.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>Test Email</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: DISPATCHED EMAIL LOG */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                <span className="text-xs text-slate-400">Dispatched Transactional Emails Log</span>
                {sentEmails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmailPreview(email)}
                    className="p-3.5 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded">
                        {email.triggerName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(email.sentAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1">{email.subject}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">To: {email.recipientEmail}</p>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {email.status.toUpperCase()}
                      </span>
                      <span className="text-indigo-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Preview HTML Email
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive HTML Email Preview Modal */}
      {selectedEmailPreview && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  Email Preview: {selectedEmailPreview.subject}
                </h3>
                <p className="text-xs text-slate-400">
                  Recipient: {selectedEmailPreview.recipientEmail} &bull; Delivered via Automated Rail
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded transition ${
                      previewDevice === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded transition ${
                      previewDevice === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setSelectedEmailPreview(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/90 flex justify-center">
              <div
                className={`transition-all duration-200 shadow-2xl rounded-xl overflow-hidden bg-slate-900 border border-slate-800 ${
                  previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-2xl'
                }`}
              >
                <iframe
                  title="email-preview"
                  srcDoc={selectedEmailPreview.htmlBody}
                  className="w-full min-h-[500px] border-none"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>Status: Delivered &bull; Open tracking pixel enabled</span>
              <button
                onClick={() => setSelectedEmailPreview(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
