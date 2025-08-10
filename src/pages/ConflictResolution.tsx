import { useEffect } from "react";
import { setPageSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

export default function ConflictResolution() {
  useEffect(() => {
    setPageSEO(
      "Conflict Resolution — Vault",
      "Warm, guided frameworks to navigate tough conversations and rebuild trust."
    );
  }, []);

  // Function to handle PDF downloads
  const downloadPDF = (pdfPath: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => downloadPDF('/pdfs/de-escalation.pdf', 'de-escalation-guide.pdf')}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                De-escalation
                <Download className="h-4 w-4" />
              </CardTitle>
              <CardDescription>Reset the room with a simple checklist.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Click to download your complete de-escalation toolkit with step-by-step techniques and practical examples.
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => downloadPDF('/pdfs/mediation-steps.pdf', 'mediation-steps-guide.pdf')}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Mediation Steps
                <Download className="h-4 w-4" />
              </CardTitle>
              <CardDescription>Step-by-step guide to structured dialogue.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Click to download your comprehensive mediation guide with conversation frameworks and facilitation techniques.
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => downloadPDF('/pdfs/repair-follow-up.pdf', 'repair-follow-up-guide.pdf')}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Repair & Follow-up
                <Download className="h-4 w-4" />
              </CardTitle>
              <CardDescription>Commitments, timelines, and check-ins.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Click to download templates for repair agreements, follow-up schedules, and accountability systems.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}