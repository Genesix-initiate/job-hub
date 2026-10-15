import { AdminRoleName } from '../types/database';

export const SUPER_ADMIN_EMAILS = [
  'genesixintiate@gmail.com',
  'genesixinitiate@gmail.com',
];

export const SUPER_ADMIN_PASSWORD = 'Ayomhi000';

export interface AdminAccessRequest {
  id: string;
  email: string;
  name: string;
  requestedRole: AdminRoleName;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  password?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

const STORAGE_KEY_REQUESTS = 'jobhub_admin_access_requests';
const STORAGE_KEY_APPROVED = 'jobhub_approved_admin_list';

// Initial requests queue starts empty for production
const SEED_REQUESTS: AdminAccessRequest[] = [];

export const adminApprovalService = {
  /**
   * Checks if an email is strictly the designated Super Admin
   */
  isSuperAdmin(email: string): boolean {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    return SUPER_ADMIN_EMAILS.some((s) => s.toLowerCase() === clean);
  },

  /**
   * Verifies super admin password
   */
  verifySuperAdminPassword(password: string): boolean {
    return password === SUPER_ADMIN_PASSWORD;
  },

  /**
   * Retrieves all admin access requests
   */
  getAllRequests(): AdminAccessRequest[] {
    if (typeof window === 'undefined') return SEED_REQUESTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(SEED_REQUESTS));
        return SEED_REQUESTS;
      }
      return JSON.parse(raw);
    } catch {
      return SEED_REQUESTS;
    }
  },

  /**
   * Retrieves pending admin requests for Super Admin review
   */
  getPendingRequests(): AdminAccessRequest[] {
    return this.getAllRequests().filter((r) => r.status === 'pending');
  },

  /**
   * Checks if an email has been approved by the Super Admin
   */
  checkApprovalStatus(email: string): {
    isSuperAdmin: boolean;
    isApproved: boolean;
    role?: AdminRoleName;
    status: 'pending' | 'approved' | 'rejected' | 'not_requested';
    request?: AdminAccessRequest;
  } {
    const clean = email.trim().toLowerCase();

    // 1. Super Admin is always fully authorized (no password needed)
    if (this.isSuperAdmin(clean)) {
      return {
        isSuperAdmin: true,
        isApproved: true,
        role: 'super_admin',
        status: 'approved',
      };
    }

    const requests = this.getAllRequests();
    const existing = requests.find((r) => r.email.toLowerCase() === clean);

    if (existing) {
      return {
        isSuperAdmin: false,
        isApproved: existing.status === 'approved',
        role: existing.requestedRole,
        status: existing.status,
        request: existing,
      };
    }

    return {
      isSuperAdmin: false,
      isApproved: false,
      status: 'not_requested',
    };
  },

  /**
   * Submit a new admin email request awaiting Super Admin approval
   */
  submitAccessRequest(params: {
    email: string;
    name: string;
    requestedRole: AdminRoleName;
    reason?: string;
    password?: string;
  }): { success: boolean; message: string; request: AdminAccessRequest } {
    const cleanEmail = params.email.trim().toLowerCase();
    const requests = this.getAllRequests();

    // If Super Admin email is submitted, inform them
    if (this.isSuperAdmin(cleanEmail)) {
      return {
        success: true,
        message: 'This is the primary Super Admin email. You can log in directly using your Super Admin password.',
        request: {
          id: 'super-admin-direct',
          email: cleanEmail,
          name: 'Super Admin (Genesix Initiate)',
          requestedRole: 'super_admin',
          status: 'approved',
          requestedAt: new Date().toISOString(),
          reviewedBy: 'Self',
        },
      };
    }

    // Check if already requested
    const existingIndex = requests.findIndex((r) => r.email.toLowerCase() === cleanEmail);
    if (existingIndex >= 0) {
      const existing = requests[existingIndex];
      if (existing.status === 'approved') {
        return {
          success: true,
          message: 'Your email has already been approved by Super Admin. You can log in directly.',
          request: existing,
        };
      }
      if (existing.status === 'pending') {
        return {
          success: false,
          message: 'Your request is currently PENDING approval by Super Admin (genesixintiate@gmail.com).',
          request: existing,
        };
      }
    }

    const newRequest: AdminAccessRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      name: params.name.trim(),
      requestedRole: params.requestedRole,
      status: 'pending',
      reason: params.reason?.trim() || 'Administrative staff portal access request',
      password: params.password,
      requestedAt: new Date().toISOString(),
    };

    const updated = [newRequest, ...requests.filter((r) => r.email.toLowerCase() !== cleanEmail)];
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updated));

    // Dispatch custom event for real-time reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jobhub_admin_requests_updated'));
    }

    return {
      success: true,
      message: 'Access request submitted successfully! Awaiting approval from Super Admin (genesixintiate@gmail.com).',
      request: newRequest,
    };
  },

  /**
   * Super Admin approves an admin email request
   */
  approveRequest(requestId: string, assignedRole?: AdminRoleName): void {
    const requests = this.getAllRequests();
    const updated = requests.map((req) => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'approved' as const,
          requestedRole: assignedRole || req.requestedRole,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'genesixintiate@gmail.com',
        };
      }
      return req;
    });

    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jobhub_admin_requests_updated'));
    }
  },

  /**
   * Super Admin rejects an admin email request
   */
  rejectRequest(requestId: string): void {
    const requests = this.getAllRequests();
    const updated = requests.map((req) => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'rejected' as const,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'genesixintiate@gmail.com',
        };
      }
      return req;
    });

    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jobhub_admin_requests_updated'));
    }
  },

  /**
   * Super Admin revokes an approved admin email
   */
  revokeAccess(requestIdOrEmail: string): void {
    const requests = this.getAllRequests();
    const updated = requests.map((req) => {
      if (req.id === requestIdOrEmail || req.email.toLowerCase() === requestIdOrEmail.toLowerCase()) {
        return {
          ...req,
          status: 'rejected' as const,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'genesixintiate@gmail.com',
        };
      }
      return req;
    });

    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jobhub_admin_requests_updated'));
    }
  },

  /**
   * Super Admin directly adds and authorizes an admin email
   */
  directAuthorizeEmail(email: string, name: string, role: AdminRoleName): void {
    const cleanEmail = email.trim().toLowerCase();
    const requests = this.getAllRequests();

    const newApproved: AdminAccessRequest = {
      id: `req-direct-${Date.now()}`,
      email: cleanEmail,
      name: name.trim() || 'Authorized Staff',
      requestedRole: role,
      status: 'approved',
      reason: 'Pre-authorized directly by Super Admin',
      requestedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'genesixintiate@gmail.com',
    };

    const updated = [newApproved, ...requests.filter((r) => r.email.toLowerCase() !== cleanEmail)];
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jobhub_admin_requests_updated'));
    }
  },
};
