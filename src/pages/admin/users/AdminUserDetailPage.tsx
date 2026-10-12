import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  Users,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  UserCheck,
  UserX,
  FileText,
  Activity,
  Lock,
} from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { Profile } from '../../../types/database';
import { useAuth } from '../../../context/AuthContext';

export function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { profile: currentAdmin } = useAuth();
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusReason, setStatusReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState(false);

  useEffect(() => {
    if (userId) {
      adminService.getUserById(userId).then((res) => {
        setUser(res);
        setIsLoading(false);
      });
    }
  }, [userId]);

  const handleToggleStatus = async (newStatus: 'active' | 'suspended') => {
    if (!user) return;
    await adminService.updateUserStatus(
      user.id,
      newStatus,
      statusReason || `Admin manual toggle to ${newStatus}`,
      currentAdmin?.id || 'admin'
    );
    setUser({ ...user, account_status: newStatus });
    setActionSuccess(true);
    setTimeout(() => setActionSuccess(false), 3000);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading user dossier...</div>;
  }

  if (!user) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-400">User profile record not found.</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="text-xs text-rose-400 hover:underline"
        >
          &larr; Return to Users Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/users')}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Users</span>
        </button>

        <span className="text-xs font-mono text-slate-500">USER ID: {user.id}</span>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>User status successfully updated in database and logged to audit trail.</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160'}
              alt={user.display_name || 'User'}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-700 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {user.first_name} {user.last_name}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                    user.role === 'super_admin'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : user.role === 'employer'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {user.account_status === 'active' ? (
              <button
                onClick={() => handleToggleStatus('suspended')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
              >
                Suspend Account
              </button>
            ) : (
              <button
                onClick={() => handleToggleStatus('active')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition cursor-pointer"
              >
                Reactivate Account
              </button>
            )}
          </div>
        </div>

        {/* User Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block mb-1 font-mono uppercase text-[10px]">Contact Phone</span>
            <p className="text-slate-200 font-medium">{user.phone || 'None provided'}</p>
          </div>
          <div>
            <span className="text-slate-500 block mb-1 font-mono uppercase text-[10px]">Location</span>
            <p className="text-slate-200 font-medium">
              {user.city ? `${user.city}, ${user.country}` : 'Not specified'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 block mb-1 font-mono uppercase text-[10px]">Registration Date</span>
            <p className="text-slate-200 font-medium font-mono">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="text-slate-500 block mb-1 font-mono uppercase text-[10px]">Email Verified</span>
            <span className={`font-semibold ${user.email_verified ? 'text-emerald-400' : 'text-amber-400'}`}>
              {user.email_verified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>
        </div>
      </div>

      {/* Security & Access Information */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-rose-400" />
          Security Credentials & Role Boundaries
        </h2>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Supabase Auth UID</span>
            <span className="font-mono text-slate-300">{user.auth_user_id || user.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Account Authorization</span>
            <span className="text-emerald-400 font-semibold font-mono">ENFORCED VIA RLS</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Last Authentication Time</span>
            <span className="font-mono text-slate-400">
              {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
