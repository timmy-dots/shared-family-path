import { useEffect } from "react";
import { setPageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Charter() {
  useEffect(() => setPageSEO("Vault – Family Charter Builder", "Smart, adaptable templates that generate plain-language charters."), []);

  return (
    <section className="container mx-auto py-12 md:py-16">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold">Family Charter Builder</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">Start from a smart template that adapts to your family structure. Collaborate in real-time with comments and private notes.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Governance Template</CardTitle>
            <CardDescription>Values, roles, decision processes, and conflict playbooks.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="hero">Create from template</Button>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Import Existing Document</CardTitle>
            <CardDescription>Bring your current constitution or charter to iterate together.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Upload</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
