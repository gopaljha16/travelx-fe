"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { getApprovalRequests, updateApprovalRequest, saveApprovalRequest, TravelRequest } from "@/lib/mock-requests";
import { Loader2, CheckCircle2, XCircle, Info, Plane, Building, Bus, Train, FileText } from "lucide-react";
import Link from "next/link";

export default function ManagerDashboard() {
  const { user, loading: authLoading, openLogin } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [showDebug, setShowDebug] = useState(false);
  const [showAll, setShowAll] = useState(false); // Debug mode to see all requests in system
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [new Date().toLocaleTimeString() + ': ' + msg, ...prev].slice(0, 5));
  };

  // Define helper functions first to avoid hoisting/initialization errors
  const loadRequests = useCallback(() => {
    const allReqs = getApprovalRequests();
    
    // Admins see everything. Managers/Sr Managers see only their assigned requests.
    const myReqs = (user?.corporate_role === 'admin' || showAll)
      ? allReqs 
      : allReqs.filter(r => {
          const mId = (r.manager_id || "").trim().toLowerCase();
          const sId = (r.senior_manager_id || "").trim().toLowerCase();
          const uId = (user?.id || "").trim().toLowerCase();
          return mId === uId || sId === uId;
        });
    
    if (user) {
      addLog(`Loaded ${myReqs.length} requests (Total: ${allReqs.length})`);
    }
        
    setRequests(myReqs);
  }, [user, showAll]);

  const handleApprove = (req: TravelRequest) => {
    const isSeniorManager = req.senior_manager_id === user?.id || user?.corporate_role === 'admin';
    const isManager = req.manager_id === user?.id || user?.corporate_role === 'admin';

    if (req.status === 'pending_senior_manager' && isSeniorManager) {
      updateApprovalRequest(req.id, { 
        senior_manager_approved: true,
        status: 'approved'
      });
      addLog(`Approved ${req.id} (Senior Manager)`);
    } else if (req.status === 'pending_manager' && isManager) {
      if (req.requires_dual_approval) {
        updateApprovalRequest(req.id, { 
          manager_approved: true,
          status: 'pending_senior_manager'
        });
        addLog(`Approved ${req.id} (Forwarded to Sr Mgr)`);
      } else {
        updateApprovalRequest(req.id, { 
          manager_approved: true,
          status: 'approved'
        });
        addLog(`Approved ${req.id} (Final)`);
      }
    }
    
    // Force immediate reload after approval
    setTimeout(() => loadRequests(), 100);
  };

  const handleReject = (req: TravelRequest) => {
    updateApprovalRequest(req.id, { 
      status: 'rejected',
      rejection_reason: "Rejected by manager"
    });
    addLog(`Rejected ${req.id}`);
    
    // Force immediate reload after rejection
    setTimeout(() => loadRequests(), 100);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      openLogin();
      router.push("/");
      return;
    }
    if (!user) return;

    if (user.corporate_role !== 'manager' && user.corporate_role !== 'senior_manager' && user.corporate_role !== 'admin') {
      router.push("/mybiz");
      return;
    }

    // FORCE IMMEDIATE LOAD
    console.log('[ManagerPortal] Initial load triggered');
    loadRequests();
    setLoading(false);
    
    // Auto-fix: If all requests are approved/rejected, offer to reset
    const allReqs = getApprovalRequests();
    const hasPending = allReqs.some(r => r.status === 'pending_manager' || r.status === 'pending_senior_manager');
    if (allReqs.length > 0 && !hasPending) {
      console.warn('[ManagerPortal] All requests are already processed. Data may be stale.');
      addLog('⚠️ All requests processed - data may be stale');
    }

    // Poll every 1 second for faster real-time updates
    const interval = setInterval(() => {
      loadRequests();
    }, 1000);

    // Sync via custom event (same tab) and storage event (cross tab)
    const handleSync = () => {
      console.log('[ManagerPortal] Event triggered - syncing...');
      loadRequests();
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mybiz_approval_requests_v2') {
        console.log('[ManagerPortal] Storage event detected');
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
  }, [user, authLoading, router, openLogin, loadRequests]);

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

  const pendingRequests = requests.filter(r => {
    if (user?.corporate_role === 'admin') {
      return r.status === 'pending_manager' || r.status === 'pending_senior_manager';
    }
    
    // Normalize IDs for comparison (same as loadRequests logic)
    const mId = (r.manager_id || "").trim().toLowerCase();
    const sId = (r.senior_manager_id || "").trim().toLowerCase();
    const uId = (user?.id || "").trim().toLowerCase();
    
    return (mId === uId && r.status === 'pending_manager') ||
           (sId === uId && r.status === 'pending_senior_manager');
  });

  const historyRequests = requests.filter(r => {
    if (r.status === 'approved' || r.status === 'rejected') return true;
    
    // Normalize IDs for comparison
    const mId = (r.manager_id || "").trim().toLowerCase();
    const uId = (user?.id || "").trim().toLowerCase();
    
    if (r.status === 'pending_senior_manager' && mId === uId && r.manager_approved) return true;
    return false;
  });

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
            <p className="text-on-surface-variant mt-2 font-medium">
              Review and manage travel requests from your team. 
              <span className="ml-2 text-[10px] bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant/70">
                User: {user?.id} ({user?.corporate_role})
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowDebug(!showDebug)} 
              className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 hover:text-primary transition-colors"
            >
              {showDebug ? 'Hide Debug' : 'System Debug'}
            </button>
            <Link href="/mybiz" className="text-primary font-bold hover:underline text-sm uppercase tracking-widest">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {showDebug && (
          <div className="mb-8 p-4 bg-surface-container-high rounded-2xl border border-outline-variant/20">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-3">System-Wide Request Audit (Debug)</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {getApprovalRequests().length === 0 ? (
                <p className="text-xs text-on-surface-variant italic text-center py-2">LocalStorage is empty.</p>
              ) : (
                getApprovalRequests().map(r => (
                  <div key={r.id} className="text-[10px] flex justify-between items-center py-1 border-b border-outline-variant/5">
                    <span>
                      <strong className="text-on-surface">{r.id}</strong> | {r.employee_name} | {r.type}
                    </span>
                    <span className="flex gap-2">
                      <span className="text-on-surface-variant">Status: <span className="text-primary font-bold">{r.status}</span></span>
                      <span className="text-on-surface-variant">Manager: <span className="font-bold">{r.manager_id}</span></span>
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-outline-variant/10">
              <button 
                onClick={() => {
                  const testReq: TravelRequest = {
                    id: 'TEST-' + Math.floor(Math.random() * 1000),
                    employee_id: 'EMP-001',
                    employee_name: 'Test John',
                    type: 'flight',
                    details: 'Test Flight IndiGo · DEL → BOM',
                    travel_date: '2026-10-15',
                    amount: 5500,
                    spending_limit: 10000,
                    requires_dual_approval: false,
                    manager_id: user?.id || 'MGR-001',
                    senior_manager_id: 'SMGR-001',
                    manager_approved: false,
                    senior_manager_approved: false,
                    status: 'pending_manager',
                    submitted_at: new Date().toISOString()
                  };
                  saveApprovalRequest(testReq);
                  addLog('Created test request');
                  loadRequests();
                }}
                className="text-[9px] px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md font-bold hover:bg-emerald-100 transition-colors"
              >
                Seed Test Request
              </button>
              <button 
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                className="text-[9px] px-3 py-1 bg-red-50 text-red-600 rounded-md font-bold hover:bg-red-100 transition-colors"
              >
                Reset System Data (Clear LocalStorage)
              </button>
              <button 
                onClick={() => { setShowAll(!showAll); addLog(showAll ? 'Standard View' : 'Show All View'); }}
                className={`text-[9px] px-3 py-1 rounded-md font-bold transition-colors ${showAll ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {showAll ? 'Standard Filtering: ON' : 'Show All System Requests'}
              </button>
              <button 
                onClick={() => { addLog('Manual sync triggered'); loadRequests(); }}
                className="text-[9px] px-3 py-1 bg-primary text-white rounded-md font-bold hover:bg-primary-dark transition-colors"
              >
                Force Sync State
              </button>
            </div>
            
            <div className="mt-4 bg-black/5 rounded-lg p-2 font-mono text-[9px] text-on-surface-variant">
              <p className="font-bold mb-1 border-b border-black/5 pb-1">Activity Log:</p>
              {logs.map((log, i) => <p key={i}>{log}</p>)}
            </div>
          </div>
        )}

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
                      req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                      req.status === 'pending_senior_manager' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {req.status === 'pending_senior_manager' ? 'Forwarded to Sr Mgr' : req.status}
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
