import { useEffect } from "react";
import { setPageSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConflictResolution() {
  useEffect(() => {
    setPageSEO(
      "Conflict Resolution — Vault",
      "Warm, guided frameworks to navigate tough conversations and rebuild trust."
    );
  }, []);

  return (
    <div>
      <header className="border-b">
        <div className="container mx-auto py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-semibold">Conflict Resolution</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Tools and playbooks to de-escalate, find common ground, and move forward together.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button>Start a Playbook</Button>
            <Button variant="outline">Learn the Basics</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-10">
        <section className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>De-escalation</CardTitle>
              <CardDescription>Reset the room with a simple checklist.</CardDescription>
            </CardHeader>
            <CardContent>
              Placeholder content for de-escalation techniques.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mediation Steps</CardTitle>
              <CardDescription>Step-by-step guide to structured dialogue.</CardDescription>
            </CardHeader>
            <CardContent>
              Placeholder content for mediation steps.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Repair & Follow-up</CardTitle>
              <CardDescription>Commitments, timelines, and check-ins.</CardDescription>
            </CardHeader>
            <CardContent>
              Placeholder content for repair and follow-up.
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
