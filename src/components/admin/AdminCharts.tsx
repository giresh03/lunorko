import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "10px",
  color: "hsl(var(--foreground))",
  fontSize: "12px",
  boxShadow: "var(--shadow-lg)",
} as const;

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const AdminPanelCard = ({
  title,
  subtitle,
  icon,
  action,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`rounded-xl border border-border gradient-card p-4 sm:p-6 animate-fade-in ${className}`}>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <h3 className="text-sm sm:text-base font-bold font-display text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
    {children}
  </div>
);

export const VisitorsAreaChart = ({
  data,
}: {
  data: { visit_date: string; visitor_count: number }[];
}) => {
  if (!data.length) return <p className="text-sm text-muted-foreground">No visitor data yet</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="visit_date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.3 }}
          labelFormatter={(v) => new Date(v).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          formatter={(value: number) => [value, "Visitors"]}
        />
        <Area
          type="monotone"
          dataKey="visitor_count"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#visitorGradient)"
          animationDuration={1100}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const RevenueBarChart = ({ data }: { data: { label: string; amount: number }[] }) => {
  if (!data.length) return <p className="text-sm text-muted-foreground">No revenue yet</p>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.95} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "hsl(var(--primary) / 0.08)" }}
          formatter={(value: number) => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
        />
        <Bar dataKey="amount" fill="url(#revenueGradient)" radius={[6, 6, 0, 0]} animationDuration={1000} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const PlanDonutChart = ({ data }: { data: { name: string; value: number }[] }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return <p className="text-sm text-muted-foreground">No plan data yet</p>;
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={3}
            stroke="hsl(var(--background))"
            strokeWidth={2}
            animationDuration={1000}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n) => [v, String(n)]} />
          <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 top-[86px] text-center">
        <p className="text-xl font-bold font-display text-foreground tabular-nums">{total}</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">users</p>
      </div>
    </div>
  );
};
