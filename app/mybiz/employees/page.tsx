"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  getEmployees,
  addEmployee,
  updateEmployeeRole,
  removeEmployee,
  OrgEmployee,
  EmployeeAdd
} from "@/lib/api";
import {
  Users,
  UserPlus,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  UserCircle,
  MoreVertical,
  Trash2,
  Mail,
  User,
  ExternalLink,
  ChevronLeft,
  X,
  CheckCircle2,
  Copy,
  Plus
} from "lucide-react";

function EmployeeManagementContent() {
  const { user: currentUser, loading: authLoading, openLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [employees, setEmployees] = useState<OrgEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // UI State
  const [showAddModal, setShowAddModal] = useState(searchParams.get("add") === "true");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; email: string; password?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [newEmployee, setNewEmployee] = useState<EmployeeAdd>({
    email: "",
    name: "",
    role: "employee",
    password: "",
    employee_id: "",
    department: "",
    cost_center: "",
    manager_id: "",
    senior_manager_id: "",
    spending_limit: 10000
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err: any) {
      setError(err.message || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !currentUser) {
      openLogin();
      router.push("/");
      return;
    }
    if (currentUser) {
      fetchData();
    }
  }, [authLoading, currentUser, openLogin, router]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("adding");
    setError("");
    setSuccessInfo(null);
    try {
      const res = await addEmployee(newEmployee);
      setSuccessInfo({ message: res.message, email: newEmployee.email, password: res.password });
      setNewEmployee({ email: "", name: "", role: "employee", password: "", employee_id: "", department: "", cost_center: "", manager_id: "", senior_manager_id: "", spending_limit: 10000 });
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to add employee.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      await updateEmployeeRole(userId, newRole);
      setEmployees(prev => prev.map(emp => emp.user_id === userId ? { ...emp, role: newRole as any } : emp));
    } catch (err: any) {
      alert(err.message || "Failed to update role.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this employee?")) return;
    setActionLoading(userId);
    try {
      await removeEmployee(userId);
      setEmployees(prev => prev.filter(emp => emp.user_id !== userId));
    } catch (err: any) {
      alert(err.message || "Failed to remove employee.");
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowAddModal(false);
    }, 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center flex-col gap-4">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Syncing Team Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-on-surface font-body">
      <Navbar />

      <main className="pt-20 pb-24">
        {/* Header */}
        <section className="bg-surface-container-low px-6 py-12 border-b border-outline-variant/10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <button 
                onClick={() => router.push("/mybiz")}
                className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4 hover:underline"
              >
                <ChevronLeft size={16} /> Back to Dashboard
              </button>
              <h1 className="font-headline text-4xl font-black tracking-tight text-on-surface flex items-center gap-4">
                <Users size={36} className="text-primary" />
                Team Management
              </h1>
              <p className="mt-2 text-on-surface-variant max-w-xl font-medium">
                Add employees, manage roles, and control access levels for your corporate organisation.
              </p>
            </div>
            <button 
              onClick={() => {
                setSuccessInfo(null);
                setError("");
                setShowAddModal(true);
              }}
              className="voyage-button px-6 py-3.5 rounded-2xl text-white font-bold inline-flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <UserPlus size={18} />
              Add Employee
            </button>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          {employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-outline-variant/20 bg-surface-container-lowest p-20 text-center shadow-inner">
               <div className="w-20 h-20 rounded-[2rem] bg-surface-container flex items-center justify-center mb-6">
                 <Users size={40} className="text-on-surface-variant/40" />
               </div>
               <h3 className="text-2xl font-black text-on-surface">No Employees Yet</h3>
               <p className="mt-2 text-on-surface-variant max-w-sm font-medium">Your team is empty. Start by adding your first employee to enable corporate booking.</p>
               <button 
                onClick={() => setShowAddModal(true)}
                className="mt-8 text-primary font-black uppercase tracking-widest text-sm hover:underline flex items-center gap-2"
               >
                 <Plus size={18} /> Add first employee
               </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden lg:block bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/10 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low border-b border-outline-variant/10">
                      <tr>
                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Employee</th>
                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Identity</th>
                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Role</th>
                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                      {employees.map((emp) => (
                        <tr key={emp.user_id} className="hover:bg-surface-container-low/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm uppercase">
                                {emp.email.slice(0, 2)}
                              </div>
                              <div>
                                 <p className="font-bold text-on-surface">{emp.name || emp.email}</p>
                                 <p className="text-[10px] uppercase font-black tracking-tighter text-on-surface-variant/60">ID: {emp.employee_id || emp.user_id.slice(-6)}</p>
                                 {emp.department && <p className="text-[10px] text-on-surface-variant/80 font-medium mt-0.5">{emp.department} • {emp.cost_center}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
                               <Mail size={14} className="text-primary" />
                               {emp.email}
                             </div>
                          </td>
                          <td className="px-8 py-6">
                            <select 
                              value={emp.role}
                              className={`text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border-none outline-none cursor-pointer transition-all ${
                                emp.role === 'admin' ? 'bg-primary/10 text-primary' : 
                                emp.role === 'senior_manager' ? 'bg-orange-50 text-orange-600' :
                                emp.role === 'manager' ? 'bg-tertiary/10 text-tertiary' : 
                                'bg-surface-container-high text-on-surface-variant'
                              }`}
                              onChange={(e) => handleUpdateRole(emp.user_id, e.target.value)}
                              disabled={actionLoading === emp.user_id || emp.user_id === currentUser?.id || emp.role === 'admin'}
                            >
                              <option value="employee">Employee</option>
                              <option value="manager">Manager</option>
                              <option value="senior_manager">Senior Mgr</option>
                              {emp.role === 'admin' && <option value="admin">Admin</option>}
                            </select>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2">
                               <button 
                                  onClick={() => handleRemove(emp.user_id)}
                                  disabled={actionLoading === emp.user_id || emp.user_id === currentUser?.id}
                                  className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0"
                               >
                                 {actionLoading === emp.user_id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                               </button>
                               {emp.user_id === currentUser?.id && (
                                 <span className="text-[10px] font-black uppercase tracking-tighter text-on-surface-variant/40 py-2">You</span>
                               )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {employees.map((emp) => (
                  <div key={emp.user_id} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs uppercase">
                          {emp.email.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-sm">{emp.name || emp.email}</p>
                          <p className="text-[10px] font-black uppercase text-on-surface-variant/60">ID: {emp.employee_id || emp.user_id.slice(-6)}</p>
                        </div>
                      </div>
                      <select 
                        value={emp.role}
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg border-none outline-none cursor-pointer ${
                          emp.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                        onChange={(e) => handleUpdateRole(emp.user_id, e.target.value)}
                        disabled={actionLoading === emp.user_id || emp.user_id === currentUser?.id || emp.role === 'admin'}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="senior_manager">Senior Mgr</option>
                        {emp.role === 'admin' && <option value="admin">Admin</option>}
                      </select>
                    </div>
                    
                    <div className="space-y-2 border-t border-outline-variant/5 pt-4">
                      <div className="flex items-center gap-2 text-on-surface-variant text-xs">
                        <Mail size={14} className="text-primary" />
                        {emp.email}
                      </div>
                      {emp.department && (
                        <p className="text-[11px] font-medium text-on-surface-variant/70">
                          {emp.department} • {emp.cost_center}
                        </p>
                      )}
                    </div>
                    
                    {emp.user_id !== currentUser?.id && (
                      <div className="mt-4 flex justify-end">
                        <button 
                          onClick={() => handleRemove(emp.user_id)}
                          disabled={actionLoading === emp.user_id}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 font-bold text-[11px] uppercase tracking-wider"
                        >
                          {actionLoading === emp.user_id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-xl bg-surface rounded-[3rem] shadow-2xl border border-outline-variant/10 overflow-hidden scale-in">
              <div className="bg-surface-container-low px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-2xl font-black text-on-surface">Add Team Member</h2>
                  <p className="text-sm font-medium text-on-surface-variant">Invites will be sent to the registered email.</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                {successInfo ? (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={32} className="text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-on-surface">Employee Added Successfully!</h3>
                    <p className="mt-2 text-on-surface-variant font-medium">{successInfo.message}</p>
                    
                    {successInfo.password ? (
                      <div className="mt-8 p-6 rounded-[2rem] bg-surface-container-lowest border border-dashed border-primary/20 text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">Generated Credentials</p>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-xs font-bold text-on-surface-variant">Email</p>
                            <p className="font-bold text-on-surface">{successInfo.email}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-on-surface-variant">Temporary Password</p>
                            <p className="font-headline font-black text-lg text-primary tracking-tighter">{successInfo.password}</p>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(successInfo.password!)}
                            className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:scale-110 transition-transform"
                          >
                            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                        <p className="mt-4 text-[11px] text-on-surface-variant leading-relaxed">
                          <ShieldAlert size={12} className="inline mr-1 text-orange-500" />
                          {copied ? <span className="text-emerald-600 font-bold tracking-tight">Copied! </span> : null}
                          Please copy this password now. It will not be shown again. The employee should change it after logging in.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-8 p-6 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/10 text-left flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                          <UserCircle size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-sm">Existing Account Linked</p>
                          <p className="mt-1 text-xs text-on-surface-variant font-medium leading-relaxed">
                            This person already has an existing YatraSqure consumer account. We have upgraded their account to a Corporate Account without generating a new password. They can simply log in using their normal credentials or OTP.
                          </p>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => setShowAddModal(false)}
                      className="voyage-button w-full h-12 rounded-2xl text-white font-bold mt-8 shadow-lg shadow-primary/20"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAddEmployee} className="space-y-6">
                    {error && (
                      <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 px-5 py-4">
                        <span className="material-symbols-outlined text-red-600">error</span>
                        <p className="text-sm font-bold text-red-700">{error}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Email Address *</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                          <input 
                            type="email"
                            required
                            placeholder="employee@company.com"
                            className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-11 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface outline-none"
                            value={newEmployee.email}
                            onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Full Name *</label>
                        <div className="relative">
                          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                          <input 
                            type="text"
                            required
                            placeholder="John Doe"
                            className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-11 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface outline-none"
                            value={newEmployee.name}
                            onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Employee ID *</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. EMP-101"
                            className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface outline-none"
                            value={newEmployee.employee_id}
                            onChange={(e) => setNewEmployee({...newEmployee, employee_id: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Department</label>
                          <input 
                            type="text"
                            placeholder="e.g. Engineering"
                            className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface outline-none"
                            value={newEmployee.department}
                            onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Cost Center</label>
                        <input 
                          type="text"
                          placeholder="e.g. ENG-CC-001"
                          className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface outline-none"
                          value={newEmployee.cost_center}
                          onChange={(e) => setNewEmployee({...newEmployee, cost_center: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                         <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Organisation Role *</label>
                         <div className="grid grid-cols-3 gap-3">
                           {['employee', 'manager', 'senior_manager'].map((role) => (
                             <button
                               key={role}
                               type="button"
                               onClick={() => setNewEmployee({...newEmployee, role: role as any})}
                               className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                 newEmployee.role === role 
                                 ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                 : 'bg-surface-container-low border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-high'
                               }`}
                             >
                               {role.replace('_', ' ')}
                             </button>
                           ))}
                         </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Reporting Manager *</label>
                          <select 
                            required
                            className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface outline-none appearance-none"
                            value={newEmployee.manager_id}
                            onChange={(e) => setNewEmployee({...newEmployee, manager_id: e.target.value})}
                          >
                            <option value="">Select Manager</option>
                            {employees.filter(e => e.role === 'manager' || e.role === 'senior_manager' || e.role === 'admin').map(m => (
                              <option key={m.user_id} value={m.user_id}>{m.name || m.email}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Senior Reporting Manager *</label>
                          <select 
                            required
                            className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface outline-none appearance-none"
                            value={newEmployee.senior_manager_id}
                            onChange={(e) => setNewEmployee({...newEmployee, senior_manager_id: e.target.value})}
                          >
                            <option value="">Select Sr. Manager</option>
                            {employees.filter(e => e.role === 'senior_manager' || e.role === 'admin').map(m => (
                              <option key={m.user_id} value={m.user_id}>{m.name || m.email}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Monthly Spending Limit (₹) *</label>
                        <input 
                          type="number"
                          required
                          min="0"
                          placeholder="e.g. 10000"
                          className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface outline-none"
                          value={newEmployee.spending_limit}
                          onChange={(e) => setNewEmployee({...newEmployee, spending_limit: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={actionLoading === 'adding'}
                      className="voyage-button w-full h-14 rounded-2xl text-white font-bold text-base shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                    >
                      {actionLoading === 'adding' ? <Loader2 className="animate-spin" size={22} /> : <>Add to Team <UserPlus size={20} /></>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function EmployeeManagementPage() {
  return (
    <Suspense fallback={
      <div className="bg-background min-h-screen">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      </div>
    }>
      <EmployeeManagementContent />
    </Suspense>
  );
}
