import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { setPageSEO } from "@/lib/seo";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import FamilyTreeCard from "@/components/family/FamilyTreeCard";
import PersonalInfoCard from "@/components/account/PersonalInfoCard";

function FamilyTreeSection() {
  return <FamilyTreeCard />;
}
export default function Account() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => setPageSEO("My Account – Private Member Area", "View your profile and private content."), []);

  useEffect(() => {
    if (!loading && !user) navigate("/auth?mode=login", { replace: true });
  }, [loading, user, navigate]);

  const email = useMemo(() => user?.email ?? "", [user]);

  if (!user) return null;

  return (
    <section className="container mx-auto py-12 md:py-16">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold">My Account</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">Manage your profile and access your private family workspace.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Basic account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <div className="text-muted-foreground">Email</div>
              <div className="font-medium">{email}</div>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                toast("Signed out", { description: "You have been logged out." });
                navigate("/", { replace: true });
              }}
            >
              Log out
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Private Vault</CardTitle>
            <CardDescription>Your documents and stories</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="hero">
              <a href="/vault">Go to Vault</a>
            </Button>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <div className="md:col-span-2">
          <PersonalInfoCard />
        </div>

        {/* Family Tree Section */}
        <div className="md:col-span-2">
          {/* Lazy import to avoid SSR issues */}
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <FamilyTreeSection />
        </div>
      </div>
    </section>
  );
}
