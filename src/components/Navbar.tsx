import { Link } from "react-router-dom";
import { Code2, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Lunor.AI</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Home</Link>
          <Link to="/domains" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Domains</Link>
          <Link to="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">About</Link>
          <Button size="sm" asChild>
            <Link to="/domains">Get Started</Link>
          </Button>
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
            <Button size="sm" asChild>
              <Link to="/domains" onClick={() => setOpen(false)}>Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
