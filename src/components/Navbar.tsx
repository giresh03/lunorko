import { Link } from "react-router-dom";
import { Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.jpeg";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Lunor.AI logo" className="h-8 w-8 rounded-md object-cover" />
          <span className="text-lg font-bold text-foreground">Lunor.AI</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Home</Link>
          <Link to="/domains" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Domains</Link>
          <Link to="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">About</Link>
          {!loading && (
            user ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard"><LayoutDashboard className="mr-1.5 h-4 w-4" /> Dashboard</Link>
                </Button>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {user.user_metadata?.display_name || user.email?.split("@")[0]}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="mr-1.5 h-4 w-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <Button size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/domains" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>Domains</Link>
            <Link to="/about" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>About</Link>
            {!loading && (
              user ? (
                <>
                  <Link to="/dashboard" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>Dashboard</Link>
                  <span className="text-sm text-muted-foreground">
                    {user.user_metadata?.display_name || user.email?.split("@")[0]}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => { signOut(); setOpen(false); }}>
                    <LogOut className="mr-1.5 h-4 w-4" /> Sign Out
                  </Button>
                </>
              ) : (
                <Button size="sm" asChild>
                  <Link to="/auth" onClick={() => setOpen(false)}>Sign In</Link>
                </Button>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
