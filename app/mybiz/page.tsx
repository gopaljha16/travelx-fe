"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  getMyOrganization,
  getEmployees,
  Organization,
  OrgEmployee,
} from "@/lib/api";
import {
  Building2,
  Loader2,
  Users,
  Wallet,
  ShieldCheck,
  ChevronRight,
  BadgeCheck,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";

export default function MyBizDashboardPage() {
  const { user, loading: authLoading, openLogin } = useAuth();
  const router = useRouter();

  const [org, setOrg] = useState<Organization | null>(null);
  const [employees, setEmployees] = useState<OrgEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      openLogin();
      router.push("/");
      return;
    }
    if (user) {
      Promise.all([getMyOrganization(), getEmployees()])
        .then(([orgData, empData]) => {
          setOrg(orgData);
          setEmployees(empData);
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : "Failed to load data";
          if (msg.toLowerCase().includes("not belong") || msg.toLowerCase().includes("not found")) {
            // No org yet — redirect to onboarding
            router.push("/mybiz/onboard");
          } else {
            setError(msg);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, openLogin, router]);

  if (authLoading || loading) {
    return (
      <div className="bg-background min-h-screen text-on-surface font-body">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center flex-col gap-4">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Loading MyBiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen text-on-surface font-body">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center px-6 pt-20 flex-col gap-4 text-center">
          <div className="w-16 h-16 rounded-[1.5rem] bg-red-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
          </div>
          <h2 className="font-headline text-2xl font-black text-on-surface">{error}</h2>
          <Link href="/mybiz/onboard" className="voyage-button px-8 py-3 rounded-2xl text-white font-bold inline-flex items-center gap-2 mt-2">
            Register Organisation <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const adminCount = org?.adminIds.length ?? 0;
  const managerCount = org?.managerIds.length ?? 0;
  const employeeCount = employees.length;

  return (
    <div className="bg-background min-h-screen text-on-surface font-body">
      <Navbar />

      <main className="pb-24">
        {/* Hero Banner */}
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0f1c2c_0%,#1a3a5f_100%)] px-6 pt-32 pb-16 sm:pt-40 sm:pb-20">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-tertiary/10 blur-3xl" />
          <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary-fixed">
                <LayoutDashboard size={14} />
                MyBiz Dashboard
              </span>
              <h1 className="mt-5 font-headline text-4xl sm:text-5xl font-black tracking-tight text-white">
                Welcome, <span className="text-primary-fixed-dim italic">{org?.name}</span>
              </h1>
              <p className="mt-3 text-white/60 font-medium">
                {org?.city && org.state ? `${org.city}, ${org.state}` : org?.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/mybiz/employees"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-on-surface font-bold text-sm hover:bg-primary hover:text-white transition-all shadow-lg"
              >
                <Users size={18} />
                Manage Employees
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <Users size={22} className="text-primary" />,
                bg: "bg-primary/10",
                label: "Total Employees",
                value: employeeCount,
                sub: "in your organisation",
              },
              {
                icon: <ShieldCheck size={22} className="text-emerald-600" />,
                bg: "bg-emerald-50",
                label: "Admins",
                value: adminCount,
                sub: "with full access",
              },
              {
                icon: <Wallet size={22} className="text-orange-500" />,
                bg: "bg-orange-50",
                label: "Wallet Balance",
                value: `₹${(org?.wallet_balance ?? 0).toLocaleString()}`,
                sub: "corporate credits",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 shadow-sm p-6 flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{stat.label}</p>
                  <p className="font-headline text-3xl font-black text-on-surface mt-1">{stat.value}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Org Info + Quick Actions */}
        <section className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* Org Details */}
          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 shadow-sm overflow-hidden">
            <div className="bg-surface-container-low px-7 py-5 border-b border-outline-variant/10 flex items-center gap-3">
              <Building2 size={18} className="text-primary" />
              <h2 className="font-headline text-lg font-black text-on-surface">Organisation Info</h2>
            </div>
            <div className="p-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { label: "Company Name", value: org?.name },
                { label: "Business Email", value: org?.email },
                { label: "GST Number", value: org?.gst_number },
                { label: "Address", value: org?.address || "—" },
                { label: "City", value: org?.city || "—" },
                { label: "State", value: org?.state || "—" },
                { label: "Country", value: org?.country || "—" },
                { label: "Registered On", value: org?.created_at ? new Date(org.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{item.label}</p>
                  <p className="mt-1.5 font-semibold text-on-surface text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-5">
            <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 shadow-sm overflow-hidden">
              <div className="bg-surface-container-low px-7 py-5 border-b border-outline-variant/10">
                <h2 className="font-headline text-lg font-black text-on-surface">Quick Actions</h2>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { href: "/mybiz/employees", icon: <Users size={18} />, label: "Manage Employees", sub: "Add, update roles, remove", color: "text-primary", bg: "bg-primary/10" },
                  { href: "/mybiz/employees?add=true", icon: <span className="material-symbols-outlined text-base leading-none">person_add</span>, label: "Add New Employee", sub: "Invite or create account", color: "text-emerald-600", bg: "bg-emerald-50" },
                  { href: "/bookings", icon: <span className="material-symbols-outlined text-base leading-none">luggage</span>, label: "View All Trips", sub: "Hotel & bus bookings", color: "text-tertiary", bg: "bg-tertiary/10" },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center justify-between rounded-2xl bg-surface-container-low p-4 hover:bg-surface-container-high transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${action.bg} ${action.color} flex items-center justify-center shrink-0`}>
                        {action.icon}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface">{action.label}</p>
                        <p className="text-[11px] text-on-surface-variant">{action.sub}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Employees Preview */}
            <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 shadow-sm overflow-hidden">
              <div className="bg-surface-container-low px-7 py-5 border-b border-outline-variant/10 flex items-center justify-between">
                <h2 className="font-headline text-lg font-black text-on-surface">Team</h2>
                <Link href="/mybiz/employees" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">
                  See All
                </Link>
              </div>
              <div className="p-5 space-y-3">
                {employees.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-4">No employees added yet.</p>
                ) : (
                  employees.slice(0, 4).map((emp) => (
                    <div key={emp.user_id} className="flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-black uppercase">
                          {emp.email.slice(0, 2)}
                        </div>
                        <p className="text-sm font-semibold text-on-surface truncate max-w-[140px]">{emp.email}</p>
                      </div>
                      <RoleBadge role={emp.role} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: "bg-primary/10 text-primary",
    employee: "bg-surface-container-high text-on-surface-variant",
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${styles[role] ?? styles.employee}`}>
      {role === 'manager' ? 'employee' : role}
    </span>
  );
}
