"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { getApprovalRequests, updateApprovalRequest, TravelRequest } from "@/lib/mock-requests";
import { Loader2, CheckCircle2, XCircle, Info, Plane, Building, Bus, Train, FileText } from "lucide-react";
import Link from "next/link";

export default function ManagerDashboard() {
  const { user, loading: authLoading, openLogin } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  useEffect(() => {
    if (!authLoading && !user) {
      openLogin();
      router.push("/");
      return;
    }
    if (user) {
      if (user.corporate_role !== 'manager' && user.corporate_role !== 'senior_manager' && user.corporate_role !== 'admin') {
        router.push("/mybiz");
        return;
      }
      loadRequests();
    }
  }, [user, authLoading, router, openLogin]);

  const loadRequests = () => {
    setLoading(true);
    const allReqs = getApprovalRequests();
    
    // Filter requests where this user is the manager or senior manager
    const myReqs = allReqs.filter(r => 
      r.manager_id === user?.id || r.senior_manager_id === user?.id
    );
    setRequests(myReqs);
    setLoading(false);
  };

  const handleApprove = (req: TravelRequest) => {
    const isSeniorManager = req.senior_manager_id === user?.id;
    const isManager = req.manager_id === user?.id;

    if (isSeniorManager && req.status === 'pending_senior_manager') {
      updateApprovalRequest(req.id, { 
        senior_manager_approved: true,
        status: 'approved'
      });
    } else if (isManager && req.status === 'pending_manager') {
      if (req.requires_dual_approval) {
        updateApprovalRequest(req.id, { 
          manager_approved: true,
          status: 'pending_senior_manager'
        });
      } else {
        updateApprovalRequest(req.id, { 
          manager_approved: true,
          status: 'approved'
        });
      }
    }
    loadRequests();
  };

  const handleReject = (req: TravelRequest) => {
    updateApprovalRequest(req.id, { 
      status: 'rejected',
      rejection_reason: "Rejected by manager"
    });
    loadRequests();
  };

  if (authLoading || loading) {
    return (
      <div className="bg-background min-h-screen text-on-surface font-body">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center flex-col gap-4">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Loading Manager Portal...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => 
    (r.manager_id === user?.id && r.status === 'pending_manager') ||
    (r.senior_manager_id === user?.id && r.status === 'pending_senior_manager')
  );

  const historyRequests = requests.filter(r => r.status === 'approved' || r.status === 'rejected');

  const getIcon = (type: string) => {
    switch(type) {
      case 'flight': return <Plane size={20} className="text-blue-500" />;
      case 'hotel': return <Building size={20} className="text-orange-500" />;
      case 'bus': return <Bus size={20} className="text-emerald-500" />;
      case 'train': return <Train size={20} className="text-purple-500" />;
      default: return <FileText size={20} />;
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-surface font-body">
      <Navbar />

      <main className="pt-24 pb-24 max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8 border-b border-outline-variant/10 pb-6">
          <div>
            <h1 className="font-headline text-3xl font-black text-on-surface flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">fact_check</span>
              Manager Approvals
            </h1>
            <p className="text-on-surface-variant mt-2 font-medium">Review and manage travel requests from your team.</p>
          </div>
          <Link href="/mybiz" className="text-primary font-bold hover:underline text-sm uppercase tracking-widest">
            Back to Dashboard
          </Link>
        </div>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'pending' 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'history' 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Decision History
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-lowest rounded-[2rem] border border-dashed border-outline-variant/20">
                <div className="w-16 h-16 bg-surface-container flex items-center justify-center rounded-full mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-on-surface">All Caught Up!</h3>
                <p className="text-on-surface-variant mt-2">There are no pending travel requests for you to approve.</p>
              </div>
            ) : (
              pendingRequests.map(req => (
                <div key={req.id} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
                      {getIcon(req.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-on-surface text-lg">{req.employee_name}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                          Pending Approval
                        </span>
                      </div>
                      <p className="text-sm font-medium text-on-surface-variant mb-1">{req.details}</p>
                      <p className="text-xs text-on-surface-variant/70">Travel Date: {new Date(req.travel_date).toLocaleDateString()}</p>
                      
                      {req.requires_dual_approval && (
                        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                          <Info size={14} /> 
                          {req.senior_manager_id === user?.id 
                            ? "This booking exceeds the employee's spending limit. Normal manager has approved."
                            : "This booking exceeds the limit. Will require Senior Manager approval next."
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-4 shrink-0">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Amount</p>
                      <p className={`font-headline text-2xl font-black ${req.amount > req.spending_limit ? 'text-amber-600' : 'text-on-surface'}`}>
                        ₹{req.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">Limit: ₹{req.spending_limit.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => handleReject(req)}
                        className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                      <button 
                        onClick={() => handleApprove(req)}
                        className="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-white font-bold text-sm bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {historyRequests.length === 0 ? (
              <p className="text-center py-10 text-on-surface-variant">No past decisions found.</p>
            ) : (
              historyRequests.map(req => (
                <div key={req.id} className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-on-surface">{req.employee_name}</p>
                    <p className="text-xs text-on-surface-variant">{req.details}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-on-surface">₹{req.amount.toLocaleString()}</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                      req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>
    </div>
  );
}
