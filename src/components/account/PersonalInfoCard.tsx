import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Pencil } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { TablesInsert } from "@/integrations/supabase/types";

const InfoSchema = z.object({
  date_of_birth: z.date({ required_error: "Birthday is required" }),
  income: z.coerce.number().min(0, "Must be positive"),
  cash: z.coerce.number().min(0, "Must be positive"),
  real_estate: z.coerce.number().min(0, "Must be positive"),
  investments: z.coerce.number().min(0, "Must be positive"),
  debts: z.coerce.number().min(0, "Must be positive"),
  mortgages: z.coerce.number().min(0, "Must be positive"),
});

type InfoFormValues = z.infer<typeof InfoSchema>;

interface SnapshotData {
  income: number;
  assets: { cash: number; real_estate: number; investments: number };
  liabilities: { debts: number; mortgages: number };
}

export default function PersonalInfoCard() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [snapshot, setSnapshot] = useState<SnapshotData | null>(null);

  const form = useForm<InfoFormValues>({
    resolver: zodResolver(InfoSchema),
    defaultValues: {
      date_of_birth: undefined as unknown as Date,
      income: 0,
      cash: 0,
      real_estate: 0,
      investments: 0,
      debts: 0,
      mortgages: 0,
    },
  });

  const formattedDOB = useMemo(() => (dob ? format(dob, "PPP") : "—"), [dob]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      try {
        const [{ data: profile, error: pErr }, { data: snap, error: sErr }] = await Promise.all([
          supabase.from("profiles").select("date_of_birth").eq("id", user.id).maybeSingle(),
          supabase
            .from("financial_snapshots")
            .select("income, assets, liabilities, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (pErr) throw pErr;
        if (sErr) throw sErr;

        if (profile?.date_of_birth) {
          const d = new Date(profile.date_of_birth as unknown as string);
          if (!isNaN(d.getTime())) setDob(d);
        }

        const snapParsed: SnapshotData = {
          income: snap?.income ?? 0,
          assets: {
            cash: Number((snap?.assets as any)?.cash ?? 0),
            real_estate: Number((snap?.assets as any)?.real_estate ?? 0),
            investments: Number((snap?.assets as any)?.investments ?? 0),
          },
          liabilities: {
            debts: Number((snap?.liabilities as any)?.debts ?? 0),
            mortgages: Number((snap?.liabilities as any)?.mortgages ?? 0),
          },
        };
        setSnapshot(snapParsed);
      } catch (e: any) {
        console.error(e);
        toast("Could not load personal info", { description: e.message ?? "Please try again" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  useEffect(() => {
    // Sync form when dialog opens
    if (!open || !snapshot) return;
    form.reset({
      date_of_birth: dob ?? (undefined as unknown as Date),
      income: snapshot.income,
      cash: snapshot.assets.cash,
      real_estate: snapshot.assets.real_estate,
      investments: snapshot.assets.investments,
      debts: snapshot.liabilities.debts,
      mortgages: snapshot.liabilities.mortgages,
    });
  }, [open, snapshot, dob, form]);

  async function onSubmit(values: InfoFormValues) {
    if (!user) return;
    setSaving(true);
    try {
      const isoDate = values.date_of_birth.toISOString().split("T")[0];
      const profileUpsert: TablesInsert<'profiles'> = { id: user.id, date_of_birth: isoDate as unknown as any } as any;
      const { error: upsertErr } = await supabase
        .from("profiles")
        .upsert(profileUpsert, { onConflict: "id" });
      if (upsertErr) throw upsertErr;

      const insertRow: TablesInsert<'financial_snapshots'> = {
        user_id: user.id,
        income: values.income,
        assets: {
          cash: values.cash,
          real_estate: values.real_estate,
          investments: values.investments,
        } as any,
        liabilities: {
          debts: values.debts,
          mortgages: values.mortgages,
        } as any,
      } as any;

      const { error: insertErr } = await supabase
        .from("financial_snapshots")
        .insert(insertRow);
      if (insertErr) throw insertErr;

      setDob(values.date_of_birth);
      setSnapshot({
        income: values.income,
        assets: { cash: values.cash, real_estate: values.real_estate, investments: values.investments },
        liabilities: { debts: values.debts, mortgages: values.mortgages },
      });
      toast("Saved", { description: "Your personal information was updated." });
      setOpen(false);
    } catch (e: any) {
      console.error(e);
      toast("Save failed", { description: e.message ?? "Please try again" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Manage your birthday and finances</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" aria-label="Edit personal information">
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Edit Personal Information</DialogTitle>
              <DialogDescription>Update your birthday and financial details. Changes are saved securely.</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <section>
                  <h3 className="mb-2 text-sm font-medium">Personal</h3>
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Birthday</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[260px] justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>Your date of birth helps personalize your experience.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                <section>
                  <h3 className="mb-2 text-sm font-medium">Income</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="income"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual income</FormLabel>
                          <FormControl>
                            <Input type="number" inputMode="decimal" step="0.01" min={0} {...field} />
                          </FormControl>
                          <FormDescription>Enter your gross annual income.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <section>
                  <h3 className="mb-2 text-sm font-medium">Assets</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="cash"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cash</FormLabel>
                          <FormControl>
                            <Input type="number" inputMode="decimal" step="0.01" min={0} {...field} />
                          </FormControl>
                          <FormDescription>Total cash and equivalents.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="real_estate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Real estate</FormLabel>
                          <FormControl>
                            <Input type="number" inputMode="decimal" step="0.01" min={0} {...field} />
                          </FormControl>
                          <FormDescription>Total value of properties.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="investments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investments</FormLabel>
                          <FormControl>
                            <Input type="number" inputMode="decimal" step="0.01" min={0} {...field} />
                          </FormControl>
                          <FormDescription>Total value of stocks, bonds, etc.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <section>
                  <h3 className="mb-2 text-sm font-medium">Liabilities</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="debts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total debts</FormLabel>
                          <FormControl>
                            <Input type="number" inputMode="decimal" step="0.01" min={0} {...field} />
                          </FormControl>
                          <FormDescription>Credit cards, personal loans, etc.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mortgages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mortgages</FormLabel>
                          <FormControl>
                            <Input type="number" inputMode="decimal" step="0.01" min={0} {...field} />
                          </FormControl>
                          <FormDescription>Total outstanding mortgage balances.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <div className="flex items-center justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <Label className="text-xs text-muted-foreground">Birthday</Label>
              <div className="mt-1 font-medium">{formattedDOB}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Annual income</Label>
              <div className="mt-1 font-medium">{snapshot?.income?.toLocaleString() ?? 0}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Assets – Cash</Label>
              <div className="mt-1 font-medium">{snapshot?.assets.cash?.toLocaleString() ?? 0}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Assets – Real estate</Label>
              <div className="mt-1 font-medium">{snapshot?.assets.real_estate?.toLocaleString() ?? 0}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Assets – Investments</Label>
              <div className="mt-1 font-medium">{snapshot?.assets.investments?.toLocaleString() ?? 0}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Liabilities – Debts</Label>
              <div className="mt-1 font-medium">{snapshot?.liabilities.debts?.toLocaleString() ?? 0}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Liabilities – Mortgages</Label>
              <div className="mt-1 font-medium">{snapshot?.liabilities.mortgages?.toLocaleString() ?? 0}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
