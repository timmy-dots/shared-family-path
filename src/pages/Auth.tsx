import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { setPageSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SignUpSchema = z.object({
  full_name: z.string().min(2, "Please enter your name"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Please enter your password"),
});

export default function Auth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "login">(params.get("mode") === "login" ? "login" : "signup");

  useEffect(() => setPageSEO("Create Account or Login – Secure Vault", "Sign up or log in to access your private member area."), []);

  useEffect(() => {
    const m = params.get("mode");
    if (m === "login" || m === "signup") setMode(m);
  }, [params]);

  const signUpForm = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { full_name: "", email: "", password: "" },
  });

  const loginForm = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSignUp = async (values: z.infer<typeof SignUpSchema>) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: values.full_name },
      },
    });
    if (error) {
      toast("Sign up failed", { description: error.message });
      return;
    }
    localStorage.setItem("hasAccount", "1");
    toast("Account created", { description: "Check your email to confirm your account." });
    setMode("login");
    navigate("/auth?mode=login", { replace: true });
  };

  const onLogin = async (values: z.infer<typeof LoginSchema>) => {
    const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
    if (error) {
      toast("Login failed", { description: error.message });
      return;
    }
    toast("Welcome back!", { description: "You are now signed in." });
    navigate("/account", { replace: true });
  };

  const Title = useMemo(() => (mode === "signup" ? "Create your account" : "Log in"), [mode]);
  const Description = useMemo(
    () => (mode === "signup" ? "Start your private family workspace." : "Access your private member area."),
    [mode]
  );

  return (
    <section className="container mx-auto py-12 md:py-16">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold">{Title}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">{Description}</p>
      </header>

      <div className="max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{Title}</CardTitle>
            <CardDescription>{Description}</CardDescription>
          </CardHeader>
          <CardContent>
            {mode === "signup" ? (
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                  <FormField
                    control={signUpForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-3">
                    <Button type="submit" variant="hero" className="w-full">Create account</Button>
                    <Button type="button" variant="outline" onClick={() => setMode("login")}>Have an account?</Button>
                  </div>
                </form>
              </Form>
            ) : (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-3">
                    <Button type="submit" variant="hero" className="w-full">Log in</Button>
                    <Button type="button" variant="outline" onClick={() => setMode("signup")}>Create one</Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
