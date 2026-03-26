import { Code2, Github, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import FeedbackForm from "./FeedbackForm";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Lunor.AI</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            AI-powered learning platform for the next generation of engineers.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Platform</h4>
          <div className="flex flex-col gap-2">
            <Link to="/domains" className="text-sm text-muted-foreground hover:text-foreground">Domains</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Domains</h4>
          <div className="flex flex-col gap-2">
            <Link to="/domain/web-development" className="text-sm text-muted-foreground hover:text-foreground">Web Development</Link>
            <Link to="/domain/cybersecurity" className="text-sm text-muted-foreground hover:text-foreground">Cybersecurity</Link>
            <Link to="/domain/data-science" className="text-sm text-muted-foreground hover:text-foreground">Data Science</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Connect</h4>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-foreground"><Github className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-foreground"><Twitter className="h-5 w-5" /></a>
            </div>
            <FeedbackForm />
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        © 2026 Lunor.AI. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
