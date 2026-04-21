"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { forceChangePassword } from "@/lib/api";
import { ShieldCheck, Loader2, Lock, LogOut, CheckCircle2, KeyRound } from "lucide-react";

export default function ForcePasswordChangeModal() {
  const { user, refetch, logout } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Prevent scrolling when the modal is active
  useEffect(() => {
    if (user?.must_change_password) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [user?.must_change_password]);

  if (!user || user.must_change_password !== true) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (oldPassword === newPassword) {
      setError("New password cannot be the same as the old password.");
      return;
    }

    setLoading(true);
    try {
      await forceChangePassword(oldPassword, newPassword);
      setSuccess(true);
      // Wait a bit to show success before refetching which dismisses the modal
      setTimeout(async () => {
        await refetch();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update password. Please check your temporary password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 transform overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <KeyRound className="text-blue-600" size={28} />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Security Update</h2>
          <p className="text-slate-500 font-medium text-xs mt-1 leading-relaxed px-4">
            Please set your private password to access TravelX.
          </p>
        </div>

        {success ? (
          <div className="py-8 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Success!</h3>
              <p className="text-xs text-slate-500 font-medium mt-1 italic">Unlocking your dashboard...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-100 text-[12px] font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-xs">error</span>
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Temporary Password</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter temporary password"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-semibold text-slate-900 outline-none text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">New Password</label>
              <div className="relative group">
                <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-semibold text-slate-900 outline-none text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Confirm New Password</label>
              <div className="relative group">
                <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-semibold text-slate-900 outline-none text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 hover:shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 tracking-wider uppercase"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <>
                  UPDATE PASSWORD
                </>}
              </button>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-400 font-bold text-[10px] hover:bg-slate-50 hover:text-slate-600 transition-all flex items-center justify-center gap-2 group tracking-widest uppercase"
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
            <p className="text-[9px] text-slate-300 font-bold tracking-widest uppercase italic">TravelX Enterprise Security</p>
        </div>
      </div>
    </div>
  );
}
