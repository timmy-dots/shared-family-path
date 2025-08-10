import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { setPageSEO } from "@/lib/seo";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";

interface Family {
  id: string;
  name: string | null;
  owner_id: string;
}

interface MemberRow {
  user_id: string;
  role: string;
  created_at: string;
}

interface StorageFileItem {
  id?: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export default function FamilyChannel() {
  const { user, loading } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [files, setFiles] = useState<StorageFileItem[]>([]);
  const [loadingFamily, setLoadingFamily] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "head">("member");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [vaultPerms, setVaultPerms] = useState<Record<string, boolean>>({});

  const isOwner = useMemo(() => !!family && user?.id === family.owner_id, [family, user]);

  useEffect(() => setPageSEO("Family Channel – Private Vault", "Manage your family channel and shared vault."), []);

  // Fetch family via profile.family_id then families
  useEffect(() => {
    const run = async () => {
      if (!user) return;
      try {
        const { data: profile, error: pErr } = await supabase
          .from("profiles")
          .select("id,family_id")
          .eq("id", user.id)
          .maybeSingle();
        if (pErr) throw pErr;
        if (!profile?.family_id) {
          setLoadingFamily(false);
          return;
        }
        const { data: fam, error: fErr } = await supabase
          .from("families")
          .select("id,name,owner_id")
          .eq("id", profile.family_id)
          .maybeSingle();
        if (fErr) throw fErr;
        if (fam) setFamily(fam as Family);
      } catch (e: any) {
        toast("Failed to load family", { description: e.message });
      } finally {
        setLoadingFamily(false);
      }
    };
    if (!loading) run();
  }, [user, loading]);

  // Fetch members
  useEffect(() => {
    const run = async () => {
      if (!family) return;
      setLoadingMembers(true);
      try {
        const { data, error } = await supabase
          .from("family_members")
          .select("user_id, role, created_at")
          .eq("family_id", family.id)
          .order("created_at", { ascending: true });
        if (error) throw error;
        setMembers(data as MemberRow[]);
      } catch (e: any) {
        // Non-owners may only see themselves due to RLS
        setMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };
    run();
  }, [family]);

  // Owner: fetch vault permissions
  useEffect(() => {
    const run = async () => {
      if (!family || !isOwner) return;
      try {
        const { data, error } = await (supabase as any)
          .from("vault_permissions" as any)
          .select("user_id, can_write")
          .eq("family_id", family.id);
        if (error) throw error;
        const map: Record<string, boolean> = {};
        (data || []).forEach((row: any) => { map[row.user_id] = !!row.can_write; });
        setVaultPerms(map);
      } catch (e: any) {
        // ignore
      }
    };
    run();
  }, [family, isOwner]);

  // Fetch files in documents bucket under family folder
  const listFiles = useCallback(async (famId: string) => {
    setLoadingFiles(true);
    try {
      const { data, error } = await supabase.storage.from("documents").list(famId, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      setFiles((data || []) as StorageFileItem[]);
    } catch (e: any) {
      toast("Failed to load documents", { description: e.message });
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    if (family?.id) listFiles(family.id);
  }, [family, listFiles]);

  const handleInvite = useCallback(async () => {
    if (!family || !inviteEmail) return;
    try {
      // Create invite row to get token
      const { data, error } = await (supabase as any)
        .from("family_invites" as any)
        .insert({ family_id: family.id, email: inviteEmail.toLowerCase(), role: inviteRole, invited_by: user!.id } as any)
        .select("token")
        .maybeSingle();
      if (error) throw error;
      const token = (data as any)?.token as string;

      // Send magic link invite with redirect to accept-invite page containing token
      const redirectTo = `${window.location.origin}/accept-invite?token=${token}`;
      const { error: authErr } = await supabase.auth.signInWithOtp({ email: inviteEmail, options: { emailRedirectTo: redirectTo } });
      if (authErr) throw authErr;

      toast("Member invited successfully", { description: "An invite email has been sent." });
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
    } catch (e: any) {
      toast("Failed to send invite", { description: e.message });
    }
  }, [family, inviteEmail, inviteRole, user]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onFilesSelected = useCallback(async (fileList: FileList | null) => {
    if (!fileList || !family) return;
    setUploading(true);
    setUploadProgress(10);

    try {
      const filesArr = Array.from(fileList);
      let completed = 0;
      for (const file of filesArr) {
        // Simulate progress
        setUploadProgress((prev) => Math.min(prev + 20, 90));
        const path = `${family.id}/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
        if (error) throw error;
        completed++;
        setUploadProgress(50 + Math.floor((completed / filesArr.length) * 40));
      }
      setUploadProgress(100);
      toast("Document uploaded successfully");
      await listFiles(family.id);
    } catch (e: any) {
      toast("Upload failed", { description: e.message });
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 500);
    }
  }, [family, listFiles]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onFilesSelected(e.dataTransfer.files);
  }, [onFilesSelected]);

  const onDownload = useCallback(async (name: string) => {
    if (!family) return;
    try {
      const fullPath = `${family.id}/${name}`;
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(fullPath, 60);
      if (error) throw error;
      const url = data?.signedUrl;
      if (url) window.open(url, "_blank");
    } catch (e: any) {
      toast("Could not get download link", { description: e.message });
    }
  }, [family]);

  const setVaultAccess = useCallback(async (targetUserId: string, canWrite: boolean) => {
    if (!family) return;
    try {
      const { error } = await (supabase as any)
        .from("vault_permissions" as any)
        .upsert({ family_id: family.id, user_id: targetUserId, can_write: canWrite } as any, { onConflict: "family_id,user_id" });
      if (error) throw error;
      setVaultPerms((prev) => ({ ...prev, [targetUserId]: canWrite }));
      toast("Permissions updated", { description: canWrite ? "Member can upload" : "Member is read-only" });
    } catch (e: any) {
      toast("Failed to update permissions", { description: e.message });
    }
  }, [family]);

  if (loading || loadingFamily) {
    return (
      <section className="container mx-auto py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-semibold">Family Channel</h1>
        <p className="text-muted-foreground mt-2">Loading…</p>
      </section>
    );
  }

  if (!user || !family) {
    return (
      <section className="container mx-auto py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-semibold">Family Channel</h1>
        <p className="text-muted-foreground mt-2">No family found. Please complete onboarding.</p>
      </section>
    );
  }

  return (
    <section className="container mx-auto py-12 md:py-16">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">{family.name || "Family Channel"}</h1>
          <p className="text-muted-foreground mt-2">Invite members and manage your shared Family Vault.</p>
        </div>
        {isOwner && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">Invite Member</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a family member</DialogTitle>
                <DialogDescription>Send an invite email with a secure link.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="name@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <select id="role" className="h-10 rounded-md border bg-background px-3" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)}>
                    <option value="member">Family Member</option>
                    <option value="head">Head of Family</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                <Button onClick={handleInvite}>Send Invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Family Members</CardTitle>
            <CardDescription>People in this private channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="md:hidden">
              <Accordion type="single" collapsible>
                <AccordionItem value="members">
                  <AccordionTrigger>Members</AccordionTrigger>
                  <AccordionContent>
                    <MembersList members={members} loading={loadingMembers} currentUserId={user.id} isOwner={isOwner} vaultPerms={vaultPerms} onChangeVault={setVaultAccess} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div className="hidden md:block">
              <MembersList members={members} loading={loadingMembers} currentUserId={user.id} isOwner={isOwner} vaultPerms={vaultPerms} onChangeVault={setVaultAccess} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Family Vault</CardTitle>
            <CardDescription>Shared documents for your family</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="md:hidden">
              <Accordion type="single" collapsible>
                <AccordionItem value="vault">
                  <AccordionTrigger>Documents</AccordionTrigger>
                  <AccordionContent>
                    <VaultSection files={files} loadingFiles={loadingFiles} uploading={uploading} uploadProgress={uploadProgress} onSelectFiles={() => fileInputRef.current?.click()} onDrop={onDrop} onDownload={onDownload} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div className="hidden md:block">
              <VaultSection files={files} loadingFiles={loadingFiles} uploading={uploading} uploadProgress={uploadProgress} onSelectFiles={() => fileInputRef.current?.click()} onDrop={onDrop} onDownload={onDownload} />
            </div>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => onFilesSelected(e.target.files)} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function MembersList({ members, loading, currentUserId, isOwner, vaultPerms, onChangeVault }: { members: MemberRow[]; loading: boolean; currentUserId: string; isOwner: boolean; vaultPerms: Record<string, boolean>; onChangeVault: (targetUserId: string, canWrite: boolean) => void | Promise<void>; }) {
  if (loading) return <p className="text-muted-foreground">Loading members…</p>;
  if (!members?.length) return <p className="text-muted-foreground">Members are hidden due to privacy settings or none found.</p>;

  return (
    <ul className="grid gap-3">
      {members.map((m) => {
        const canWrite = !!vaultPerms[m.user_id];
        return (
          <li key={m.user_id} className="flex items-center justify-between gap-3 rounded-md border p-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{m.role.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {m.user_id === currentUserId ? "You" : (m.role === "head" ? "Head of Family" : "Family Member")}
                </div>
                <div className="text-xs text-muted-foreground">Joined {new Date(m.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            {isOwner && m.user_id !== currentUserId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">Manage</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Vault access</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onChangeVault(m.user_id, false)}>
                    {canWrite ? "Make read-only" : "Read-only (current)"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeVault(m.user_id, true)}>
                    {canWrite ? "Can upload (current)" : "Allow uploads"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function VaultSection({ files, loadingFiles, uploading, uploadProgress, onSelectFiles, onDrop, onDownload }: {
  files: StorageFileItem[];
  loadingFiles: boolean;
  uploading: boolean;
  uploadProgress: number;
  onSelectFiles: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDownload: (name: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div
        className="flex flex-col items-center justify-center rounded-md border border-dashed p-6 text-center hover:bg-accent/10"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <p className="font-medium">Drag and drop files here</p>
        <p className="text-sm text-muted-foreground">or</p>
        <Button variant="outline" className="mt-2" onClick={onSelectFiles}>Choose files</Button>
        {uploading && (
          <div className="mt-4 w-full">
            <div className="h-2 w-full overflow-hidden rounded-full bg-accent/20">
              <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Uploading… {uploadProgress}%</div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Documents</div>
        {loadingFiles ? (
          <p className="text-muted-foreground">Loading documents…</p>
        ) : files.length === 0 ? (
          <p className="text-muted-foreground">No documents yet.</p>
        ) : (
          <ul className="grid gap-2">
            {files.map((f) => (
              <li key={f.name} className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-muted-foreground">Uploaded {f.created_at ? new Date(f.created_at).toLocaleString() : "—"}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => onDownload(f.name)}>Download</Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
