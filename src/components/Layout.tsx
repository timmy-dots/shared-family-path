import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";

const navItems = [
  { to: "/onboarding", label: "Journey" },
  { to: "/charter", label: "Charter" },
  { to: "/library", label: "Education" },
  { to: "/meetings", label: "Meetings" },
  { to: "/voting", label: "Decisions" },
  { to: "/vault", label: "Vault" },
  { to: "/checkins", label: "Check-ins" },
];

export default function Layout() {
  const activeCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "text-primary" : "text-foreground/70 hover:text-foreground";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
        <nav className="container mx-auto h-16 flex items-center justify-between">
          <Link to="/" aria-label="Vault Home" className="flex items-center gap-2">
            <BrandLogo />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((n) => (
              <NavLink key={n.to} to={n.to} className={activeCls}>
                <span className="story-link pb-1">{n.label}</span>
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/library">Learn</Link>
            </Button>
            <Button asChild variant="hero">
              <Link to="/onboarding">Start Journey</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="container mx-auto py-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Vault. Families, stronger together.</p>
        </div>
      </footer>
    </div>
  );
}
