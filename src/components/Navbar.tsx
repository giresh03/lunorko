import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, LayoutDashboard, Shield, Loader2, Trophy, Radar, FileText, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
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
import logo from "@/assets/logo.jpeg";
import { lovable } from "@/integrations/lovable";
import { getAuthRedirectUrl } from "@/lib/auth";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/domains", label: "Domains" },
  { to: "/community", label: "Community" },
  { to: "/projects", label: "Projects" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user, loading, signOut } = useAuth();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Main Navbar */}
      <nav
        className={`border-b transition-all duration-300 ${
          scrolled
            ? "border-border bg-background/95 backdrop-blur-xl shadow-lg shadow-background/20"
            : "border-border/50 bg-background/80 backdrop-blur-xl"
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2.5 relative"
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
              {/* Glow effect */}
              <div
                className={`absolute -inset-1 rounded-xl bg-primary/20 blur-md transition-opacity duration-500 ${
                  logoHovered ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
            <div className="flex flex-col">
              <span
                className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
                  logoHovered ? "text-primary" : "text-foreground"
                }`}
              >
                Lunor.AI
              </span>
              <span className="text-[10px] text-muted-foreground/60 -mt-0.5 tracking-wider uppercase hidden sm:block">
                Learn Smarter
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-primary rounded-full transition-all duration-300 group-hover:w-3/4" />
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="hidden items-center gap-2 md:flex">
            {!loading && (
              user ? (
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
                          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.display_name || "User"} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {(user.user_metadata?.display_name || user.email || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.user_metadata?.display_name || "User"}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
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
                    disabled={googleLoading}
                    onClick={async () => {
                      setGoogleLoading(true);
                      const { data, error } = await supabase.auth.signInWithOAuth({
                        provider: "google",
                        options: { redirectTo: getAuthRedirectUrl() },
                      });
                      if (!error && data?.url) window.location.href = data.url;
                      setGoogleLoading(false);
                    }}
                  >
                    {googleLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                    <span className="ml-1.5">Google</span>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="shadow-md shadow-primary/20">
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </div>
              )
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="border-t border-border bg-background/95 backdrop-blur-xl p-4 md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-muted-foreground hover:text-foreground py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              {!loading && (
                user ? (
                  <>
                    <Link to="/dashboard" className="text-sm text-muted-foreground py-2 px-3 rounded-lg hover:bg-muted/50" onClick={() => setOpen(false)}>
                      Dashboard
                    </Link>
                    <span className="text-sm text-muted-foreground py-2 px-3">
                      {user.user_metadata?.display_name || user.email?.split("@")[0]}
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
                        const { data, error } = await supabase.auth.signInWithOAuth({
                          provider: "google",
                          options: { redirectTo: getAuthRedirectUrl() },
                        });
                        if (!error && data?.url) window.location.href = data.url;
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
                )
              )}
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
