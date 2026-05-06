"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { getApprovalRequests, TravelRequest } from "@/lib/mock-requests";
import { Loader2, Plane, Building, Bus, Train, FileText, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function MyRequestsPage() {
  const { user, loading: authLoading, openLogin } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMyRequests = useCallback((userId: string) => {
    const allReqs = getApprovalRequests();
    const myReqs = allReqs
      .filter(r => r.employee_id === userId)
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
    
    setRequests(myReqs);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      openLogin();
      router.push("/");
      return;
    }
    if (!user) return;

    loadMyRequests(user.id);
    setLoading(false);

    // Poll every 1 second for faster real-time updates when manager approves
    const interval = setInterval(() => {
      loadMyRequests(user.id);
    }, 1000);

    // Sync via custom event (same tab) and storage event (cross tab)
    const handleSync = () => {
      loadMyRequests(user.id);
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mybiz_approval_requests_v2') {
        handleSync();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('mybiz_requests_updated' as any, handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('mybiz_requests_updated' as any, handleSync);
    };
  }, [user, authLoading, router, openLogin, loadMyRequests]);

  if (authLoading || loading) {
    return (
      <div className="bg-background min-h-screen text-on-surface font-body">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center flex-col gap-4">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Loading Your Requests...</p>
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch(type) {
      case 'flight': return <Plane size={20} className="text-blue-500" />;
      case 'hotel': return <Building size={20} className="text-orange-500" />;
      case 'bus': return <Bus size={20} className="text-emerald-500" />;
      case 'train': return <Train size={20} className="text-purple-500" />;
      default: return <FileText size={20} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending_manager':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-200"><Clock size={12}/> Pending Manager</span>;
      case 'pending_senior_manager':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-200"><Clock size={12}/> Pending Sr. Manager</span>;
      case 'approved':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200"><CheckCircle2 size={12}/> Approved</span>;
      case 'rejected':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-200"><XCircle size={12}/> Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-surface font-body">
      <Navbar />

      <main className="pt-24 pb-24 max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8 border-b border-outline-variant/10 pb-6">
          <div>
            <h1 className="font-headline text-3xl font-black text-on-surface">My Approval Requests</h1>
            <p className="text-on-surface-variant mt-2 font-medium">Track your corporate travel bookings pending for manager approval.</p>
          </div>
          <Link href="/bookings" className="voyage-button px-5 py-2.5 rounded-xl text-white font-bold bg-primary hover:bg-primary-dark transition-colors">
            All Bookings
          </Link>
        </div>

        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest rounded-[2rem] border border-dashed border-outline-variant/20">
              <div className="w-16 h-16 bg-surface-container flex items-center justify-center rounded-full mx-auto mb-4">
                <FileText size={32} className="text-on-surface-variant/40" />
              </div>
              <h3 className="text-xl font-bold text-on-surface">No Requests Found</h3>
              <p className="text-on-surface-variant mt-2">You haven't submitted any bookings for approval yet.</p>
              <Link href="/mybiz/portal" className="text-primary font-bold hover:underline mt-4 inline-block">
                Go to Corporate Portal
              </Link>
            </div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 mt-1">
                    {getIcon(req.type)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="font-bold text-on-surface text-lg">{req.type.toUpperCase()} Booking</span>
                      {getStatusBadge(req.status)}
                    </div>
                    <p className="text-sm font-medium text-on-surface-variant mb-1">{req.details}</p>
                    <div className="text-xs text-on-surface-variant flex gap-4 mt-2">
                      <span>Travel Date: {new Date(req.travel_date).toLocaleDateString()}</span>
                      <span>Requested on: {new Date(req.submitted_at).toLocaleDateString()}</span>
                    </div>
                    
                    {req.status === 'rejected' && req.rejection_reason && (
                      <p className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                        <strong>Reason:</strong> {req.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-left md:text-right shrink-0 pt-2 md:pt-0 border-t md:border-0 border-outline-variant/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Amount</p>
                  <p className="font-headline text-2xl font-black text-on-surface">₹{req.amount.toLocaleString()}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Limit: ₹{req.spending_limit.toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
