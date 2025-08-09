import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useFamilyTree, type FamilyNode } from "@/hooks/useFamilyTree";

function NodeBadge({ node, onEdit, onAddChild, onAddSpouse }: { node: FamilyNode; onEdit: (n: FamilyNode) => void; onAddChild: (n: FamilyNode) => void; onAddSpouse: (n: FamilyNode) => void }) {
  const status = node.metadata?.deceased ? "Deceased" : "Alive";
  const relationToUser = node.metadata?.relation_to_user ?? node.relation ?? "";
  return (
    <div className="rounded-md border bg-card text-card-foreground p-3 shadow-sm min-w-[200px]">
      <div className="flex items-center justify-between">
        <div className="font-medium truncate" title={node.label}>{node.label}</div>
        <span className="text-xs text-muted-foreground">{status}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{relationToUser}</div>
      {node.metadata?.birth_date && (
        <div className="text-xs mt-1">Born: {node.metadata.birth_date}</div>
      )}
      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" onClick={() => onAddChild(node)}>Add child</Button>
        <Button size="sm" variant="outline" onClick={() => onAddSpouse(node)}>Add spouse</Button>
        <Button size="sm" onClick={() => onEdit(node)}>Edit</Button>
      </div>
    </div>
  );
}

function TreeView({ root, nodes, childrenOf, onEdit, onAddChild, onAddSpouse }: any) {
  if (!root) return null;
  const renderLevel = (parentId: string | null) => {
    const levelNodes = nodes.filter((n: FamilyNode) => n.parent_id === parentId);
    if (parentId === null && levelNodes.length === 0) return (
      <div className="flex flex-wrap gap-4 justify-center">
        <NodeBadge node={root} onEdit={onEdit} onAddChild={onAddChild} onAddSpouse={onAddSpouse} />
      </div>
    );
    return (
      <div className="flex flex-wrap gap-4 justify-center">
        {(parentId === null ? [root] : levelNodes).map((n: FamilyNode) => (
          <div key={n.id} className="flex flex-col items-center">
            <NodeBadge node={n} onEdit={onEdit} onAddChild={onAddChild} onAddSpouse={onAddSpouse} />
            {/* Children */}
            {childrenOf(n.id).length > 0 && (
              <div className="mt-4 border-l pl-4">
                <div className="flex flex-wrap gap-4">
                  {childrenOf(n.id).map((c: FamilyNode) => (
                    <div key={c.id}>
                      <NodeBadge node={c} onEdit={onEdit} onAddChild={onAddChild} onAddSpouse={onAddSpouse} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  return (
    <div className="space-y-8">
      {renderLevel(null)}
    </div>
  );
}

function ListView({ nodes }: { nodes: FamilyNode[] }) {
  const sorted = useMemo(() => nodes.slice().sort((a, b) => (a.metadata?.relation_to_user || "").localeCompare(b.metadata?.relation_to_user || "")), [nodes]);
  return (
    <div className="space-y-3">
      {sorted.map((n) => (
        <div key={n.id} className="rounded-md border bg-card text-card-foreground p-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">{n.label}</div>
            <div className="text-xs text-muted-foreground">{n.metadata?.relation_to_user ?? n.relation}</div>
          </div>
          <div className="text-sm text-muted-foreground">
            {n.metadata?.birth_date ? `Born: ${n.metadata.birth_date}` : "Birth date: —"} · {n.metadata?.deceased ? "Deceased" : "Alive"}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FamilyTreeCard() {
  const { loading, error, isOwner, nodes, root, childrenOf, addMember, updateMember, removeMember, recordEvent } = useFamilyTree();
  const [view, setView] = useState<"tree" | "list">(typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 768px)").matches ? "list" : "tree");

  // Dialog state
  const [editing, setEditing] = useState<FamilyNode | null>(null);
  const [form, setForm] = useState<{ name: string; birth: string; deceased: boolean; relationToParent: "child" | "spouse" | "other"; parentId: string | null; spouseOfId: string | null }>({
    name: "",
    birth: "",
    deceased: false,
    relationToParent: "child",
    parentId: null,
    spouseOfId: null,
  });
  const [open, setOpen] = useState(false);

  const beginAddChild = (n: FamilyNode) => {
    setForm({ name: "", birth: "", deceased: false, relationToParent: "child", parentId: n.id, spouseOfId: null });
    setEditing(null);
    setOpen(true);
  };
  const beginAddSpouse = (n: FamilyNode) => {
    setForm({ name: "", birth: "", deceased: false, relationToParent: "spouse", parentId: n.id, spouseOfId: n.id });
    setEditing(null);
    setOpen(true);
  };
  const beginEdit = (n: FamilyNode) => {
    setEditing(n);
    setForm({
      name: n.label,
      birth: n.metadata?.birth_date || "",
      deceased: Boolean(n.metadata?.deceased),
      relationToParent: (n.parent_id ? "child" : n.metadata?.spouse_of ? "spouse" : "other") as any,
      parentId: n.parent_id,
      spouseOfId: n.metadata?.spouse_of || null,
    });
    setOpen(true);
  };

  const submit = async () => {
    if (editing) {
      await updateMember(editing.id, {
        label: form.name,
        parent_id: form.relationToParent === "child" ? form.parentId : null,
        relation: form.relationToParent,
        metadata: { birth_date: form.birth || null, deceased: form.deceased, spouse_of: form.relationToParent === "spouse" ? form.spouseOfId : null },
      });
    } else {
      await addMember({ name: form.name, relationToParent: form.relationToParent, parentId: form.parentId, spouseOfId: form.spouseOfId, birthDate: form.birth || null, deceased: form.deceased });
    }
    setOpen(false);
  };

  const onRecordDeath = async (n: FamilyNode) => {
    const today = new Date().toISOString().slice(0, 10);
    await recordEvent(n.id, { type: "death", date: today });
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Family Tree</CardTitle>
            <CardDescription>Visualize and manage your family structure.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant={view === "tree" ? "default" : "outline"} onClick={() => setView("tree")}>Tree</Button>
            <Button variant={view === "list" ? "default" : "outline"} onClick={() => setView("list")}>List</Button>
          </div>
        </div>
        {!isOwner && (
          <div className="text-xs text-muted-foreground">You can view the tree. Only the family head can make changes.</div>
        )}
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-muted-foreground">Loading tree…</div>}
        {error && <div className="text-sm text-destructive">{error}</div>}
        {!loading && !error && nodes.length > 0 && (
          <div>
            {view === "tree" ? (
              <TreeView root={root} nodes={nodes} childrenOf={childrenOf} onEdit={beginEdit} onAddChild={beginAddChild} onAddSpouse={beginAddSpouse} />
            ) : (
              <ListView nodes={nodes} />
            )}
          </div>
        )}

        <Separator className="my-6" />
        {root && (
          <div className="flex flex-wrap gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Add family member</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit member" : "Add member"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="birth">Birth date</Label>
                    <Input id="birth" type="date" value={form.birth} onChange={(e) => setForm((f) => ({ ...f, birth: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Relationship</Label>
                    <Select value={form.relationToParent} onValueChange={(v: any) => setForm((f) => ({ ...f, relationToParent: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select relation" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="child">Child (of parent)</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.relationToParent === "child" && (
                    <div className="grid gap-2">
                      <Label>Parent</Label>
                      <Select value={form.parentId ?? ""} onValueChange={(v) => setForm((f) => ({ ...f, parentId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Choose parent" /></SelectTrigger>
                        <SelectContent>
                          {nodes.map((n) => (
                            <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {form.relationToParent === "spouse" && (
                    <div className="grid gap-2">
                      <Label>Spouse of</Label>
                      <Select value={form.spouseOfId ?? ""} onValueChange={(v) => setForm((f) => ({ ...f, spouseOfId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Choose spouse" /></SelectTrigger>
                        <SelectContent>
                          {nodes.map((n) => (
                            <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input id="deceased" type="checkbox" checked={form.deceased} onChange={(e) => setForm((f) => ({ ...f, deceased: e.target.checked }))} />
                    <Label htmlFor="deceased">Deceased</Label>
                  </div>
                </div>
                <DialogFooter>
                  {editing && (
                    <Button variant="destructive" onClick={async () => { await removeMember(editing.id); setOpen(false); }}>Delete</Button>
                  )}
                  {editing && (
                    <Button variant="outline" onClick={() => onRecordDeath(editing)}>Record death</Button>
                  )}
                  <Button onClick={submit}>{editing ? "Save changes" : "Add"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
