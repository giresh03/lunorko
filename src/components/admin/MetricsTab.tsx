import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminPanelCard } from "@/components/admin/AdminCharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Users,
  Rocket,
  IndianRupee,
  GraduationCap,
  Activity,
  RefreshCw,
  Building2,
} from "lucide-react";

interface Overview {
  signups: number;
  signups_30d: number;
  active_students_30d: number;
  builds_total: number;
  builds_30d: number;
  paying_users: number;
  mrr_cents: number;
  institutions: number;
  institution_students: number;
  levels_completed: number;
}

interface DailyRow {
  day: string;
  signups: number;
  active_users: number;
  builds: number;
  revenue_cents: number;
}

interface InstitutionRow {
  institution_id: string;
  name: string;
  students: number;
  builds: number;
  levels_completed: number;
}

interface RetentionRow {
  cohort_week: string;
  cohort_size: number;
  week1: number;
  week2: number;
  week4: number;
}

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function MetricsTab() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionRow[]>([]);
  const [retention, setRetention] = useState<RetentionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const load = useCallback(async () => {
    setLoading(true);
    const [ov, dl, inst, ret] = await Promise.all([
      supabase.rpc("metrics_overview"),
      supabase.rpc("metrics_daily", { _days: days }),
      supabase.rpc("metrics_by_institution"),
      supabase.rpc("metrics_retention"),
    ]);
    if (ov.data) setOverview(ov.data as unknown as Overview);
    setDaily(((dl.data as unknown as DailyRow[]) || []).map((r) => ({ ...r })));
    setInstitutions((inst.data as unknown as InstitutionRow[]) || []);
    setRetention((ret.data as unknown as RetentionRow[]) || []);
    setLoading(false);
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const mrr = Math.round((overview?.mrr_cents ?? 0) / 100);
  const arr = mrr * 12;

  const revenueSeries = daily.map((d) => ({
    label: shortDate(d.day),
    value: Math.round(Number(d.revenue_cents) / 100),
  }));
  const growthSeries = daily.map((d) => ({
    label: shortDate(d.day),
    signups: Number(d.signups),
    active: Number(d.active_users),
    builds: Number(d.builds),
  }));
  const retentionSeries = retention.map((r) => ({
    label: shortDate(r.cohort_week),
    w1: r.cohort_size ? Math.round((Number(r.week1) / Number(r.cohort_size)) * 100) : 0,
    w2: r.cohort_size ? Math.round((Number(r.week2) / Number(r.cohort_size)) * 100) : 0,
    w4: r.cohort_size ? Math.round((Number(r.week4) / Number(r.cohort_size)) * 100) : 0,
  }));

  if (loading && !overview) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Growth & investor metrics</h2>
          <p className="text-sm text-muted-foreground">
            Live numbers straight from the database — safe to show in a pitch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <Button
              key={d}
              size="sm"
              variant={days === d ? "default" : "outline"}
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => setDays(d)}
            >
              {d}d
            </Button>
          ))}
          <Button size="sm" variant="outline" className="h-8 rounded-full px-3" onClick={load}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <AdminStatCard index={0} label="MRR" value={mrr} prefix="₹" icon={IndianRupee} tone="text-green-400" />
        <AdminStatCard index={1} label="ARR (run rate)" value={arr} prefix="₹" icon={IndianRupee} tone="text-green-400" />
        <AdminStatCard index={2} label="Paying users" value={overview?.paying_users ?? 0} icon={Users} tone="text-primary" />
        <AdminStatCard index={3} label="Total signups" value={overview?.signups ?? 0} icon={Users} tone="text-primary" />
        <AdminStatCard index={4} label="Active (30d)" value={overview?.active_students_30d ?? 0} icon={Activity} tone="text-yellow-400" />
        <AdminStatCard index={5} label="Apps built" value={overview?.builds_total ?? 0} icon={Rocket} tone="text-pink-400" />
        <AdminStatCard index={6} label="Levels completed" value={overview?.levels_completed ?? 0} icon={GraduationCap} tone="text-primary" />
        <AdminStatCard index={7} label="Colleges" value={overview?.institutions ?? 0} icon={Building2} tone="text-yellow-400" />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <AdminPanelCard title="Revenue" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueSeries}>
              <defs>
                <linearGradient id="metricsRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v}`, "Revenue"]} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#metricsRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </AdminPanelCard>

        <AdminPanelCard title="Weekly cohort retention (%)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={retentionSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="w1" name="Week 1" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="w2" name="Week 2" stroke="#facc15" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="w4" name="Week 4" stroke="#4ade80" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </AdminPanelCard>
      </div>

      <AdminPanelCard title="Signups · active users · builds">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={growthSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="signups" name="Signups" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="active" name="Active" fill="#facc15" radius={[4, 4, 0, 0]} />
            <Bar dataKey="builds" name="Builds" fill="#4ade80" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </AdminPanelCard>

      <AdminPanelCard title="By college">
        {institutions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No colleges onboarded yet. Add one to track cohort usage.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2">College</th>
                  <th className="pb-2">Students</th>
                  <th className="pb-2">Builds</th>
                  <th className="pb-2">Levels done</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((row) => (
                  <tr key={row.institution_id} className="border-t border-border/50">
                    <td className="py-2 font-medium">{row.name}</td>
                    <td className="py-2">{row.students}</td>
                    <td className="py-2">{row.builds}</td>
                    <td className="py-2">{row.levels_completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanelCard>
    </div>
  );
}
