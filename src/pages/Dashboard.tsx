import { Link, Navigate } from "react-router-dom";
import { BookOpen, Clock, Trophy, TrendingUp, Bookmark, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { domains } from "@/lib/domains";
import { formatDistanceToNow, format, isPast, parseISO, isToday } from "date-fns";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  confirmed: { label: "Confirmed", icon: CheckCircle2, className: "bg-primary/10 text-primary border-primary/20" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-primary/10 text-primary border-primary/20" },
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { progress, bookmarks, activity, bookings, loading, toggleBookmark, cancelBooking } = useDashboard();

  if (!authLoading && !user) return <Navigate to="/auth" replace />;

  const totalTopics = domains.reduce((sum, d) => sum + d.topics.length, 0);
  const completedTopics = progress.reduce((sum, p) => sum + p.completed_topics.length, 0);
  const overallPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const activeDomains = progress.filter((p) => p.completed_topics.length > 0).length;

  const getDomain = (id: string) => domains.find((d) => d.id === id);

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && b.slot_date && !isPast(new Date(b.slot_date + "T23:59:59"))
  );
  const pastBookings = bookings.filter(
    (b) => b.status !== "confirmed" || (b.slot_date && isPast(new Date(b.slot_date + "T23:59:59")))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {user?.user_metadata?.display_name || user?.email?.split("@")[0]}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">Loading…</div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: TrendingUp, label: "Overall Progress", value: `${overallPercent}%` },
                { icon: BookOpen, label: "Active Domains", value: String(activeDomains) },
                { icon: Trophy, label: "Topics Completed", value: String(completedTopics) },
                { icon: CalendarDays, label: "Upcoming Sessions", value: String(upcomingBookings.length) },
              ].map((s, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* My Bookings */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" /> My Bookings
                </h2>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/guidance">Find Mentors</Link>
                </Button>
              </div>

              {bookings.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
                  <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No mentor sessions booked yet.</p>
                  <Button size="sm" className="mt-3" asChild>
                    <Link to="/guidance">Browse Guidance Roadmap</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Upcoming */}
                  {upcomingBookings.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Upcoming</h3>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {upcomingBookings.map((b) => {
                          const domain = getDomain(b.domain_id);
                          const isSessionToday = b.slot_date && isToday(parseISO(b.slot_date));
                          return (
                            <div
                              key={b.id}
                              className={`rounded-lg border bg-card p-4 transition-colors ${isSessionToday ? "border-primary/50 ring-1 ring-primary/20" : "border-border"}`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="min-w-0">
                                  <p className="font-semibold text-foreground truncate">{b.mentor_name || "Mentor"}</p>
                                  <p className="text-xs text-muted-foreground truncate">{b.mentor_role} · {b.mentor_company}</p>
                                </div>
                                {isSessionToday && (
                                  <Badge variant="outline" className="shrink-0 text-[10px] bg-primary/10 text-primary border-primary/20">
                                    Today
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1.5 mb-3">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                  <span>{b.slot_date ? format(parseISO(b.slot_date), "EEE, MMM d, yyyy") : "TBD"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5 shrink-0" />
                                  <span>{b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)}</span>
                                </div>
                                {domain && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <span
                                      className="rounded-sm px-1.5 py-0.5 text-[10px] font-medium"
                                      style={{
                                        backgroundColor: `hsl(${domain.color} / 0.15)`,
                                        color: `hsl(${domain.color})`,
                                      }}
                                    >
                                      {domain.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {b.notes && (
                                <p className="text-xs text-muted-foreground mb-3 line-clamp-1 italic">"{b.notes}"</p>
                              )}
                              <div className="flex gap-2">
                                {b.meeting_link && (
                                  <Button size="sm" className="flex-1 text-xs h-7" asChild>
                                    <a href={b.meeting_link} target="_blank" rel="noopener noreferrer">
                                      <Video className="mr-1.5 h-3 w-3" /> Join
                                    </a>
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7 text-destructive hover:text-destructive"
                                  onClick={() => cancelBooking(b.id)}
                                >
                                  <XCircle className="mr-1 h-3 w-3" /> Cancel
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Past */}
                  {pastBookings.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Past</h3>
                      <div className="space-y-2">
                        {pastBookings.slice(0, 5).map((b) => {
                          const domain = getDomain(b.domain_id);
                          const cfg = statusConfig[b.status] || statusConfig.confirmed;
                          const StatusIcon = cfg.icon;
                          return (
                            <div key={b.id} className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-foreground truncate">{b.mentor_name || "Mentor"}</p>
                                  <Badge variant="outline" className={`text-[10px] ${cfg.className}`}>
                                    <StatusIcon className="mr-1 h-2.5 w-2.5" /> {cfg.label}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {b.mentor_company} · {b.slot_date ? format(parseISO(b.slot_date), "MMM d") : ""} · {domain?.name}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Domain Progress */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Domain Progress</h2>
                {progress.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
                    <p className="text-sm text-muted-foreground">No progress yet. Start exploring a domain!</p>
                    <Button size="sm" className="mt-3" asChild>
                      <Link to="/domains">Browse Domains</Link>
                    </Button>
                  </div>
                ) : (
                  progress.map((p) => {
                    const domain = getDomain(p.domain_id);
                    if (!domain) return null;
                    const pct = Math.round((p.completed_topics.length / domain.topics.length) * 100);
                    const Icon = domain.icon;
                    return (
                      <Link
                        key={p.id}
                        to={`/domain/${p.domain_id}`}
                        className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30"
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
                          style={{ backgroundColor: `hsl(${domain.color} / 0.15)` }}
                        >
                          <Icon className="h-5 w-5" style={{ color: `hsl(${domain.color})` }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-foreground truncate">{domain.name}</p>
                            <span className="ml-2 text-xs text-muted-foreground">{pct}%</span>
                          </div>
                          <Progress value={pct} className="mt-2 h-2" />
                          <p className="mt-1 text-xs text-muted-foreground">
                            {p.completed_topics.length}/{domain.topics.length} topics
                          </p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>

              {/* Right column */}
              <div className="space-y-8">
                {/* Bookmarks */}
                <div>
                  <h2 className="mb-4 text-lg font-semibold text-foreground">Bookmarks</h2>
                  {bookmarks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No bookmarks yet</p>
                  ) : (
                    <div className="space-y-2">
                      {bookmarks.slice(0, 8).map((b) => (
                        <div key={b.id} className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{b.resource_title}</p>
                            <p className="text-xs text-muted-foreground">{getDomain(b.domain_id)?.name || b.domain_id}</p>
                          </div>
                          <button
                            onClick={() => toggleBookmark(b.domain_id, b.resource_id, b.resource_title, b.resource_type)}
                            className="ml-2 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div>
                  <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h2>
                  {activity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activity yet</p>
                  ) : (
                    <div className="space-y-3">
                      {activity.slice(0, 10).map((a) => (
                        <div key={a.id} className="flex items-start gap-3">
                          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-foreground">
                              <span className="font-medium">{a.action}</span>
                              {a.detail && <span className="text-muted-foreground"> — {a.detail}</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getDomain(a.domain_id)?.name} · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
