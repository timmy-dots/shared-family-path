import { useEffect } from "react";
import { setPageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Onboarding() {
  useEffect(() => setPageSEO("Vault – Guided Governance Journey", "Bite-sized onboarding to discover values, roles, and decision styles."), []);

  const steps = [
    { title: "Discover Values", desc: "Questionnaires to surface shared principles and priorities." },
    { title: "Clarify Roles", desc: "Define responsibilities and permissions for each member." },
    { title: "Decide Together", desc: "Choose how your family makes decisions and handles tie-breaks." },
    { title: "Plan for Conflict", desc: "Agreements and playbooks to de-escalate and resolve fairly." }
  ];

  return (
    <section className="container mx-auto py-12 md:py-16">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold">Guided Governance Journey</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">Move step-by-step. We’ll save progress automatically and invite others when you’re ready.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((s) => (
          <Card key={s.title} className="hover-scale">
            <CardHeader>
              <CardTitle className="text-xl">{s.title}</CardTitle>
              <CardDescription>{s.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero">Begin</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
