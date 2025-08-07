import { useEffect } from "react";
import { setPageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VaultPage() {
  useEffect(() => setPageSEO("Vault – Secure Document & Legacy Vault", "Store charters, wills, minutes, and family stories securely."), []);

  return (
    <section className="container mx-auto py-12 md:py-16">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold">Document & Legacy Vault</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">Upload core documents and preserve shared memories—stories, photos, and videos.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Secure Storage</CardTitle>
            <CardDescription>Encrypted at rest. Access controlled by roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Upload file</Button>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Legacy Sharing</CardTitle>
            <CardDescription>Add stories and oral histories to keep wisdom alive.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="hero">Add a story</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
