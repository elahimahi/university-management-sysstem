import React from 'react';
import { Clock, AlertCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PendingApprovalPage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isPending = user.approvalStatus === 'pending';
  const isRejected = user.approvalStatus === 'rejected';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {isPending ? (
          <div className="bg-slate-800/50 border border-yellow-500/50 rounded-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center animate-pulse">
                  <Clock size={40} className="text-yellow-400" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">Awaiting Approval</h1>

            <p className="text-gray-300 mb-6">
              Your registration as <span className="font-semibold text-blue-400">{user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}</span> is pending approval.
            </p>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-200 text-sm">
                A <span className="font-semibold">superadmin</span> needs to approve your registration before you can access your dashboard. This usually takes a few minutes.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span>Status: <span className="text-yellow-400 font-semibold">Pending Approval</span></span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span>Role: <span className="text-blue-400 font-semibold capitalize">{user.role}</span></span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span>Email: <span className="text-purple-400 font-semibold">{user.email}</span></span>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
            >
              Logout
            </button>
          </div>
        ) : isRejected ? (
          <div className="bg-slate-800/50 border border-red-500/50 rounded-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle size={40} className="text-red-400" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">Registration Rejected</h1>

            <p className="text-gray-300 mb-6">
              Your registration as <span className="font-semibold text-blue-400">{user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}</span> has been rejected.
            </p>

            {user.rejectionReason && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-red-200 font-semibold mb-2">Reason:</p>
                    <p className="text-red-200 text-sm">{user.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-gray-400 text-sm mb-6">
              If you believe this is a mistake, please contact the administration for more information.
            </p>

            <button
              onClick={() => logout()}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PendingApprovalPage;
