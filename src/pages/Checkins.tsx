import { useEffect } from "react";
import { setPageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Checkins() {
  useEffect(() => setPageSEO("Vault – Periodic Reviews & Check-ins", "Governance health checks and milestone alerts for steady progress."), []);

  return (
    <section className="container mx-auto py-12 md:py-16">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold">Periodic Reviews & Check‑ins</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">Set annual reminders or custom frequencies. Get suggestions when life events occur.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="hover-scale">
            <CardHeader>
              <CardTitle className="text-xl">Health Check {i + 1}</CardTitle>
              <CardDescription>Track status across values, roles, and meetings.</CardDescription>
            </CardHeader>
            <CardContent>
              <button className="story-link">Open</button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
