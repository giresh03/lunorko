import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, LayoutDashboard, Shield, Loader2, Trophy, Radar, FileText, CreditCard, Video, Sparkles, ChevronDown, Code2, Users, Palette, Boxes, Brain, Briefcase, Trophy as TrophyIcon, Home as HomeIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useProfile } from "@/hooks/useProfile";
import logo from "@/assets/logo.jpeg";
import { signInWithGoogle } from "@/lib/auth";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

type MenuChild = { to: string; label: string; desc?: string; icon: React.ComponentType<{ className?: string }> };
type MenuGroup = { label: string; to?: string; children?: MenuChild[] };

const menuGroups: MenuGroup[] = [
  {
    label: "Platform",
    children: [
      { to: "/domains", label: "Domains", desc: "Curated learning tracks", icon: Boxes },
      { to: "/visual-builder", label: "Visual Builder", desc: "Figma-like canvas studio", icon: Palette },
      { to: "/projects", label: "Projects", desc: "Team formation & collaboration", icon: Code2 },
      { to: "/assistant", label: "AI Assistant", desc: "Your personal coding copilot", icon: Sparkles },
    ],
  },
  {
    label: "Learn",
    children: [
      { to: "/ai-interview", label: "AI Interview", desc: "Mock technical interviews", icon: Video },
      { to: "/skill-radar", label: "Skill Radar", desc: "0–100 skill scoring", icon: Radar },
      { to: "/resume-builder", label: "Resume Builder", desc: "ATS-optimized resumes", icon: FileText },
      { to: "/internships", label: "Internships", desc: "Apply & earn certificates", icon: Briefcase },
    ],
  },
];

const flatLinks: MenuChild[] = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/studio", label: "Studio", icon: Sparkles },
  { to: "/community", label: "Community", icon: Users },
  { to: "/pricing", label: "Pricing", icon: CreditCard },
  { to: "/about", label: "About", icon: TrophyIcon },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { profile } = useProfile();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
  }, [location.pathname]);

  const handleEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const handleLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Hairline red top gradient */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-primary/20" />
      <nav
        className={`border-b transition-all duration-300 ${
          scrolled
            ? "border-border bg-background/90 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
            : "border-border/40 bg-background/70 backdrop-blur-2xl"
        }`}
      >
        <div className={`container mx-auto flex items-center justify-between px-4 transition-all duration-300 lg:px-6 ${scrolled ? "h-14" : "h-16"}`}>
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2.5 relative shrink-0"
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            <div className="relative">
              <img
                src={logo}
                alt="Lunor.AI logo"
                className={`h-9 w-9 rounded-lg object-cover ring-2 transition-all duration-500 ${
                  logoHovered
                    ? "ring-primary shadow-lg shadow-primary/30 scale-110 rotate-3"
                    : "ring-border/30 scale-100 rotate-0"
                }`}
              />
              <div
                className={`absolute -inset-1 rounded-xl bg-primary/20 blur-md transition-opacity duration-500 ${
                  logoHovered ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
            <span
              className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
                logoHovered ? "text-primary" : "text-foreground"
              }`}
            >
              Lunor.AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {/* Flat links */}
            {flatLinks.map((link) => {
              const active = isActive(link.to);
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:scale-110" />
                    {link.label}
                  </span>
                  <span
                    className={`absolute -bottom-0.5 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-primary transition-all duration-300 ${
                      active ? "w-6 opacity-100" : "w-0 opacity-0 group-hover:w-5 group-hover:opacity-70"
                    }`}
                  />
                </Link>
              );
            })}

            {/* Mega menu groups */}
            {menuGroups.map((group) => {
              const hasChildActive = group.children?.some((c) => isActive(c.to));
              const open = openMenu === group.label;
              return (
                <div
                  key={group.label}
                  className="relative"
                  onMouseEnter={() => handleEnter(group.label)}
                  onMouseLeave={handleLeave}
                >
                  <button
                    className={`group relative flex items-center gap-1 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      hasChildActive || open
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                    }`}
                  >
                    {group.label}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                    />
                    <span
                      className={`absolute -bottom-0.5 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-primary transition-all duration-300 ${
                        hasChildActive ? "w-6 opacity-100" : "w-0 opacity-0 group-hover:w-5 group-hover:opacity-70"
                      }`}
                    />
                  </button>

                  {/* Mega menu panel */}
                  <div
                    className={`absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 transition-all duration-200 ${
                      open ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-1"
                    }`}
                  >
                    <div className="min-w-[340px] rounded-2xl border border-border/70 bg-background/95 p-2 shadow-2xl backdrop-blur-2xl">
                      <div className="grid gap-0.5">
                        {group.children?.map((child) => {
                          const active = isActive(child.to);
                          const Icon = child.icon;
                          return (
                            <Link
                              key={child.to}
                              to={child.to}
                              className={`group/item flex items-start gap-3 rounded-xl p-3 transition-all duration-200 ${
                                active ? "bg-primary/10" : "hover:bg-muted/60"
                              }`}
                            >
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ${
                                  active
                                    ? "border-primary/50 bg-primary/15 text-primary"
                                    : "border-border/60 bg-muted/40 text-muted-foreground group-hover/item:border-primary/40 group-hover/item:text-primary"
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="flex flex-col">
                                <span
                                  className={`text-sm font-semibold transition-colors ${
                                    active ? "text-primary" : "text-foreground"
                                  }`}
                                >
                                  {child.label}
                                </span>
                                {child.desc && (
                                  <span className="text-xs text-muted-foreground">{child.desc}</span>
                                )}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right section */}
          <div className="hidden items-center gap-2 lg:flex">
            {!loading &&
              (user ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                    <Link to="/dashboard">
                      <LayoutDashboard className="mr-1.5 h-4 w-4" /> Dashboard
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <Avatar className="h-8 w-8 border-2 border-border hover:border-primary transition-colors cursor-pointer">
                          <AvatarImage src={profile?.avatar_url ?? user.user_metadata?.avatar_url} alt={profile?.username || user.user_metadata?.display_name || "User"} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {(profile?.username || profile?.display_name || user.user_metadata?.display_name || user.email || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{profile?.display_name || profile?.username || user.user_metadata?.display_name || "User"}</p>
                          {profile?.username && <p className="text-xs font-medium leading-none text-primary">@{profile.username}</p>}
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" /> My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/studio" className="cursor-pointer">
                          <Sparkles className="mr-2 h-4 w-4" /> Lunor Studio
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/assistant" className="cursor-pointer">
                          <Sparkles className="mr-2 h-4 w-4" /> AI Assistant
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/skill-radar" className="cursor-pointer">
                          <Radar className="mr-2 h-4 w-4" /> Skill Radar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/resume-builder" className="cursor-pointer">
                          <FileText className="mr-2 h-4 w-4" /> Resume Builder
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/ai-interview" className="cursor-pointer">
                          <Video className="mr-2 h-4 w-4" /> AI Interview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/pricing" className="cursor-pointer">
                          <CreditCard className="mr-2 h-4 w-4" /> Subscription
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to="/admin" className="cursor-pointer text-primary">
                              <Shield className="mr-2 h-4 w-4" /> Admin Panel
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="btn-outline-glow bg-transparent border-border/70"
                    disabled={googleLoading}
                    onClick={async () => {
                      setGoogleLoading(true);
                      await signInWithGoogle();
                      setGoogleLoading(false);
                    }}
                  >
                    {googleLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                    <span className="ml-1.5">Google</span>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="relative font-medium text-muted-foreground hover:text-foreground hover:bg-transparent">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="btn-sheen group font-semibold bg-gradient-to-r from-primary to-primary-glow text-primary-foreground border border-primary/40 shadow-glow"
                  >
                    <Link to="/auth">
                      Get Started <span className="ml-1.5 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </Link>
                  </Button>
                </div>
              ))}
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="border-t border-border bg-background/95 backdrop-blur-2xl p-4 lg:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex flex-col gap-1">
              {/* Flat links */}
              {flatLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 text-sm py-2.5 px-3 rounded-lg transition-colors ${
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="h-4 w-4" /> {link.label}
                  </Link>
                );
              })}

              {/* Collapsible groups */}
              {menuGroups.map((group) => (
                <div key={group.label} className="rounded-lg">
                  <button
                    className="flex w-full items-center justify-between py-2.5 px-3 text-sm font-medium text-foreground/80"
                    onClick={() => setOpenMenu(openMenu === group.label ? null : group.label)}
                  >
                    {group.label}
                    <ChevronDown className={`h-4 w-4 transition-transform ${openMenu === group.label ? "rotate-180" : ""}`} />
                  </button>
                  {openMenu === group.label && (
                    <div className="ml-3 flex flex-col gap-0.5 border-l border-border/60 pl-2">
                      {group.children?.map((child) => {
                        const Icon = child.icon;
                        const active = isActive(child.to);
                        return (
                          <Link
                            key={child.to}
                            to={child.to}
                            className={`flex items-center gap-2 text-sm py-2 px-3 rounded-lg transition-colors ${
                              active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                            onClick={() => setOpen(false)}
                          >
                            <Icon className="h-4 w-4" /> {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              <div className="h-px bg-border my-2" />
              {!loading &&
                (user ? (
                  <>
                    <Link to="/profile" className="text-sm text-muted-foreground py-2 px-3 rounded-lg hover:bg-muted/50 flex items-center gap-2" onClick={() => setOpen(false)}>
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                    <Link to="/dashboard" className="text-sm text-muted-foreground py-2 px-3 rounded-lg hover:bg-muted/50 flex items-center gap-2" onClick={() => setOpen(false)}>
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link to="/studio" className="text-sm text-muted-foreground py-2 px-3 rounded-lg hover:bg-muted/50 flex items-center gap-2" onClick={() => setOpen(false)}>
                      <Sparkles className="h-4 w-4" /> Lunor Studio
                    </Link>
                    <Link to="/assistant" className="text-sm text-muted-foreground py-2 px-3 rounded-lg hover:bg-muted/50 flex items-center gap-2" onClick={() => setOpen(false)}>
                      <Sparkles className="h-4 w-4" /> AI Assistant
                    </Link>
                    <Link to="/skill-radar" className="text-sm text-muted-foreground py-2 px-3 rounded-lg hover:bg-muted/50 flex items-center gap-2" onClick={() => setOpen(false)}>
                      <Radar className="h-4 w-4" /> Skill Radar
                    </Link>
                    <Link to="/resume-builder" className="text-sm text-muted-foreground py-2 px-3 rounded-lg hover:bg-muted/50 flex items-center gap-2" onClick={() => setOpen(false)}>
                      <FileText className="h-4 w-4" /> Resume Builder
                    </Link>
                    <Link to="/ai-interview" className="text-sm text-muted-foreground py-2 px-3 rounded-lg hover:bg-muted/50 flex items-center gap-2" onClick={() => setOpen(false)}>
                      <Video className="h-4 w-4" /> AI Interview
                    </Link>
                    <Link to="/pricing" className="text-sm text-muted-foreground py-2 px-3 rounded-lg hover:bg-muted/50 flex items-center gap-2" onClick={() => setOpen(false)}>
                      <CreditCard className="h-4 w-4" /> Subscription
                    </Link>
                    {isAdmin && (
                      <>
                        <div className="h-px bg-border my-1" />
                        <Link to="/admin" className="text-sm text-primary font-medium py-2 px-3 rounded-lg hover:bg-primary/10 flex items-center gap-2" onClick={() => setOpen(false)}>
                          <Shield className="h-4 w-4" /> Admin Panel
                        </Link>
                      </>
                    )}
                    <div className="h-px bg-border my-1" />
                    <span className="text-sm text-muted-foreground py-2 px-3">
                      {profile?.username ? `@${profile.username}` : profile?.display_name || user.email?.split("@")[0]}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => { signOut(); setOpen(false); }}>
                      <LogOut className="mr-1.5 h-4 w-4" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 w-full"
                      disabled={googleLoading}
                      onClick={async () => {
                        setGoogleLoading(true);
                        await signInWithGoogle();
                        setGoogleLoading(false);
                        setOpen(false);
                      }}
                    >
                      {googleLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                      <span className="ml-1.5">Sign in with Google</span>
                    </Button>
                    <Button size="sm" asChild className="mt-1">
                      <Link to="/auth" onClick={() => setOpen(false)}>Sign In with Email</Link>
                    </Button>
                  </>
                ))}
            </div>
          </div>
        )}
      </nav>

      {/* Shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default Navbar;
