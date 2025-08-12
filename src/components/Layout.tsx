import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/onboarding", label: "Guided Journey" },
  { to: "/calculators", label: "Calculators" },
  { to: "/library", label: "Education" },
  { to: "/meetings", label: "Meetings" },
  { to: "/voting", label: "Voting" },
  { to: "/conflict", label: "Conflict Resolution" },
  { to: "/vault", label: "Vault" },
  { to: "/checkins", label: "Check-ins" },
];

export default function Layout() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [hasAccount, setHasAccount] = useState<boolean>(false);

  useEffect(() => {
    setHasAccount(localStorage.getItem("hasAccount") === "1");
  }, []);

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
              <NavLink key={n.to} to={n.to} end={n.to === "/"} className={activeCls}>
                <span className="story-link pb-1">{n.label}</span>
              </NavLink>
            ))}
            {session && (
              <>
                <NavLink to="/family-channel" className={activeCls}>
                  <span className="story-link pb-1">Family Channel</span>
                </NavLink>
                <NavLink to="/values-comparison" className={activeCls}>
                  <span className="story-link pb-1">Values</span>
                </NavLink>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!session ? (
              <>
                <Button asChild variant="outline">
                  <Link to="/library">Learn</Link>
                </Button>
                <Button asChild variant="hero">
                  <Link to={`/auth?mode=${hasAccount ? 'login' : 'signup'}`}>{hasAccount ? 'Log in' : 'Create account'}</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link to="/account">Account</Link>
                </Button>
                <Button
                  variant="hero"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    toast("Signed out", { description: "You have been logged out." });
                    navigate("/", { replace: true });
                  }}
                >
                  Log out
                </Button>
              </>
            )}
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
