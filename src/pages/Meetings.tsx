import { useEffect } from "react";
import { setPageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Meetings() {
  useEffect(() => setPageSEO("Vault – Virtual Family Meetings", "Automated agendas, scheduling, and summaries with calendar integrations."), []);

  return (
    <section className="container mx-auto py-12 md:py-16">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold">Virtual Family Meeting Facilitation</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">Plan agendas, share pre-reads, and get a summary after. Invite an external facilitator if needed.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Schedule a Meeting</CardTitle>
            <CardDescription>Connect Google or Outlook calendar for smart scheduling.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="hero">Connect Calendar</Button>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Discussion Starters</CardTitle>
            <CardDescription>Card-style prompts to warm up meaningful conversations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Open deck</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
