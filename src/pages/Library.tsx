import { useEffect } from "react";
import { setPageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Library() {
  useEffect(() => setPageSEO("Vault – Education Library", "Short videos and interactive explainers on governance, conflict, and succession."), []);

  const topics = ["Succession", "Family business", "Resolving conflict", "Caregiving", "Inheritance", "Meetings 101"];

  return (
    <section className="container mx-auto py-12 md:py-16">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold">Education Library</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">On-demand content designed for busy families. Filter by topic, watch short videos, and try interactive explainers.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => (
          <Card key={t} className="hover-scale">
            <CardHeader>
              <CardTitle className="text-xl">{t}</CardTitle>
              <CardDescription>5–7 min videos plus an interactive explainer.</CardDescription>
            </CardHeader>
            <CardContent>
              <button className="story-link">Start learning</button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
