import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { setPageSEO } from "@/lib/seo";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const token = params.get("token");

  useEffect(() => setPageSEO("Accept Family Invite", "Join your family's private channel."), []);

  useEffect(() => {
    const run = async () => {
      if (!user || !token) return;
      const { data, error } = await (supabase as any).rpc("accept_family_invite" as any, { _token: token });
      if (error || data !== true) {
        toast("Invite could not be accepted", { description: error?.message || "Invalid or expired." });
      } else {
        toast("Welcome to the family!", { description: "Your access has been granted." });
      }
      navigate("/family-channel", { replace: true });
    };
    if (!loading && user && token) run();
  }, [user, loading, token, navigate]);

  if (!token) {
    return (
      <section className="container mx-auto py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-semibold">Invalid invite</h1>
        <p className="text-muted-foreground mt-2">Missing token.</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="container mx-auto py-12 md:py-16">
        <Card>
          <CardHeader>
            <CardTitle>Accept Invite</CardTitle>
            <CardDescription>Log in to accept your family invite.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="hero">
              <a href={`/auth?mode=login&redirect=/accept-invite?token=${token}`}>Log in</a>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="container mx-auto py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-semibold">Accepting invite…</h1>
      <p className="text-muted-foreground mt-2">Please wait.</p>
    </section>
  );
}
