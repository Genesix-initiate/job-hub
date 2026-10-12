import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserX,
  UserCheck,
} from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { Profile } from '../../../types/database';
import { useAuth } from '../../../context/AuthContext';

export function AdminUsersPage() {
  const navigate = useNavigate();
  const { profile: currentAdmin, adminRole } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Status mutation modal state
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [actionType, setActionType] = useState<'suspend' | 'activate' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getUsers({
        role: roleFilter,
        status: statusFilter,
        search,
        page,
        limit: 15,
      });
      setUsers(res.users);
      setTotalCount(res.total);
    } catch (err) {
      console.warn('Error fetching users', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleStatusChange = async () => {
    if (!selectedUser || !actionType) return;
    setIsSubmitting(true);
    const newStatus = actionType === 'suspend' ? 'suspended' : 'active';
    await adminService.updateUserStatus(
      selectedUser.id,
      newStatus,
      actionReason || `Administrative ${actionType} action`,
      currentAdmin?.id || 'admin'
    );
    setIsSubmitting(false);
    setSelectedUser(null);
    setActionType(null);
    setActionReason('');
    fetchUsers();
  };

  const handleExportCSV = async () => {
    const csv = await adminService.exportDataset('users', currentAdmin?.id || 'admin');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobhub-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-400" />
            User Management & Authorization
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global repository of candidate profiles, enterprise recruiters, and staff administrators
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-200 transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Users CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or profile ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Roles</option>
            <option value="job_seeker">Job Seekers</option>
            <option value="employer">Employers</option>
            <option value="admin">Administrators</option>
            <option value="super_admin">Super Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Querying Supabase users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No users matching criteria found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={u.display_name || 'User'}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-white">
                            {u.first_name} {u.last_name}
                          </p>
                          <p className="text-slate-400 text-[11px] font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          u.role === 'super_admin'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : u.role === 'admin'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : u.role === 'employer'
                            ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                          u.account_status === 'active'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : u.account_status === 'suspended'
                            ? 'text-rose-400 bg-rose-500/10'
                            : 'text-slate-400 bg-slate-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.account_status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        {u.account_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {u.city ? `${u.city}, ${u.country || ''}` : u.country || 'Not specified'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        title="View Full Profile Dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {u.account_status === 'active' ? (
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setActionType('suspend');
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                          title="Suspend User Account"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setActionType('activate');
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 transition cursor-pointer"
                          title="Reactivate Account"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {users.length} of {totalCount} users
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-300 px-2">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={users.length < 15}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Reason Action Modal */}
      {selectedUser && actionType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-white text-base">
                Confirm {actionType === 'suspend' ? 'Account Suspension' : 'Account Reactivation'}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Target user: <strong className="text-white">{selectedUser.first_name} {selectedUser.last_name}</strong> ({selectedUser.email}).
              {actionType === 'suspend' && ' This will immediately invalidate active login tokens and prevent applications.'}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Mandatory Administrative Reason
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Document reason for compliance and audit trail..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 placeholder-slate-600"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setActionType(null);
                }}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={isSubmitting || !actionReason.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer ${
                  actionType === 'suspend' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isSubmitting ? 'Recording Action...' : `Confirm ${actionType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
