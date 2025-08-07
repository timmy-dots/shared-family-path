import { useEffect } from "react";
import { setPageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Voting() {
  useEffect(() => setPageSEO("Vault – Decisions & Voting", "Secure polls with anonymous or open voting and e‑signatures."), []);

  return (
    <section className="container mx-auto py-12 md:py-16">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold">Decisions & Voting</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">Create secure polls, collect votes, and record outcomes with timestamps and signatures.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>New Poll</CardTitle>
            <CardDescription>Anonymous or open—your choice.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="hero">Create poll</Button>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Past Decisions</CardTitle>
            <CardDescription>Browse outcomes and download signed records.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">View archive</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
