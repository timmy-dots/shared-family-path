import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setPageSEO } from "@/lib/seo";
import {
  Compass,
  FileText,
  GraduationCap,
  CalendarClock,
  CheckSquare,
  MessageCircle,
  FolderLock,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: Compass, title: "Guided Journey", desc: "Friendly, bite-sized onboarding to surface values, roles, and decisions.", to: "/onboarding" },
  { icon: FileText, title: "Charter Builder", desc: "Smart templates that adapt to your family structure with plain language.", to: "/charter" },
  { icon: GraduationCap, title: "Education", desc: "Short videos and interactive explainers for every family member.", to: "/library" },
  { icon: CalendarClock, title: "Meetings", desc: "Automated agendas, pre-reads, and summaries with calendar sync.", to: "/meetings" },
  { icon: CheckSquare, title: "Decisions", desc: "Secure polls, voting, and e‑signatures for formal adoption.", to: "/voting" },
  { icon: MessageCircle, title: "Resolve", desc: "Playbooks and role‑plays to de‑escalate and align.", to: "/library" },
  { icon: FolderLock, title: "Legacy Vault", desc: "Secure storage for charters, wills, notes, and stories.", to: "/vault" },
  { icon: Clock, title: "Check‑ins", desc: "Governance health reminders and milestone alerts.", to: "/checkins" }
];

export default function Index() {
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPageSEO(
      "Vault – Collaborative Family Governance",
      "A warm, modern platform guiding families through shared governance, education, and a secure legacy vault."
    );
  }, []);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = gradientRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--y", `${y}px`);
  };

  return (
    <div>
      <section
        ref={gradientRef}
        onMouseMove={onMouseMove}
        className="relative overflow-hidden border-b"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(600px circle at var(--x, 50%) var(--y, 30%), hsl(var(--accent) / 0.12), transparent 40%)",
          }}
        />
        <div className="container mx-auto py-20 md:py-28">
          <p className="text-sm tracking-widest text-muted-foreground mb-4">Warm. Secure. Inclusive.</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold leading-tight">
            Collaborative Family Governance
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Vault helps families clarify values, decide together, and preserve legacy—
            with guidance that feels as easy as learning with a coach.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" variant="hero">
              <Link to="/onboarding">Start Governance Journey</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/library">Explore the Library</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-14 md:py-20">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2">What you can do with Vault</h2>
        <p className="text-muted-foreground mb-8 md:mb-12 max-w-2xl">
          Purpose-built modules designed for clarity, fairness, and momentum.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map(({ icon: Icon, title, desc, to }) => (
            <Card key={title} className="hover-scale">
              <CardHeader>
                <div className="h-10 w-10 rounded-md bg-secondary grid place-items-center text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-2 text-xl">{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="link">
                  <Link to={to} aria-label={`${title} – learn more`}>
                    Learn more
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
