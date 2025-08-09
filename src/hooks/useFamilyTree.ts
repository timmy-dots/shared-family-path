import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type FamilyNode = {
  id: string;
  label: string; // name
  relation: string | null; // relationship to parent ("spouse", "child", etc.)
  parent_id: string | null;
  family_id: string | null;
  user_id: string; // owner (current user's id)
  metadata: {
    birth_date?: string | null;
    deceased?: boolean;
    spouse_of?: string | null; // node id of spouse
    events?: Array<{ type: "marriage" | "divorce" | "death"; date: string }>;
    is_root?: boolean;
    relation_to_user?: string; // cached for UI
  };
};

export function useFamilyTree() {
  const { user } = useAuth();
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [nodes, setNodes] = useState<FamilyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile to get family_id and name
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("family_id, full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setFamilyId(data?.family_id ?? null);

      // Check ownership if we have a family
      if (data?.family_id) {
        const { data: own, error: ownErr } = await supabase.rpc("is_family_owner", {
          _user_id: user.id,
          _family_id: data.family_id,
        });
        if (!active) return;
        if (!ownErr) setIsOwner(Boolean(own));
      } else {
        setIsOwner(true); // No family yet, allow user to build their own tree
      }

      await loadNodes(data?.full_name ?? "");
    })();

    async function loadNodes(fullName: string) {
      const { data: rows, error: rowsErr } = await supabase
        .from("family_tree")
        .select("id,label,relation,parent_id,family_id,user_id,metadata")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });

      if (rowsErr) {
        setError(rowsErr.message);
        setLoading(false);
        return;
      }

      let list = (rows as FamilyNode[]) ?? [];

      // Ensure a root node exists
      const hasRoot = list.some((n) => n.metadata?.is_root);
      if (!hasRoot) {
        const { data: inserted, error: insErr } = await supabase
          .from("family_tree")
          .insert({
            label: fullName || "Me",
            relation: "self",
            parent_id: null,
            family_id: familyId,
            user_id: user!.id,
            metadata: { is_root: true, birth_date: null, deceased: false },
          })
          .select("id,label,relation,parent_id,family_id,user_id,metadata")
          .maybeSingle();
        if (!insErr && inserted) list = [inserted as FamilyNode, ...list];
      }

      setNodes(computeRelations(list));
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [user]);

  // Realtime updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("family_tree-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "family_tree" },
        (payload) => {
          setNodes((prev) => {
            let next = [...prev];
            if (payload.eventType === "INSERT") {
              const row = payload.new as any;
              if (row.user_id === user.id) next = computeRelations([...next, row]);
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as any;
              next = computeRelations(next.map((n) => (n.id === row.id ? row : n)));
            }
            if (payload.eventType === "DELETE") {
              const row = payload.old as any;
              next = computeRelations(next.filter((n) => n.id !== row.id));
            }
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addMember = useCallback(
    async (payload: {
      name: string;
      relationToParent: "child" | "spouse" | "other";
      parentId: string | null;
      spouseOfId?: string | null;
      birthDate?: string | null;
      deceased?: boolean;
    }) => {
      if (!user) return { error: "Not authenticated" } as const;
      const metadata: FamilyNode["metadata"] = {
        birth_date: payload.birthDate ?? null,
        deceased: Boolean(payload.deceased),
        spouse_of: payload.relationToParent === "spouse" ? payload.spouseOfId ?? payload.parentId ?? null : null,
        events: [],
      };
      const { data, error } = await supabase
        .from("family_tree")
        .insert({
          label: payload.name,
          relation: payload.relationToParent,
          parent_id: payload.relationToParent === "child" ? payload.parentId : null,
          family_id: familyId,
          user_id: user.id,
          metadata,
        })
        .select("id,label,relation,parent_id,family_id,user_id,metadata")
        .maybeSingle();
      if (error) return { error: error.message } as const;
      if (data) setNodes((prev) => computeRelations([...(prev ?? []), data as FamilyNode]));
      return { data } as const;
    },
    [user, familyId]
  );

  const updateMember = useCallback(
    async (id: string, patch: Partial<Pick<FamilyNode, "label" | "relation" | "parent_id">> & { metadata?: Partial<FamilyNode["metadata"]> }) => {
      if (!user) return { error: "Not authenticated" } as const;
      // Merge metadata client-side
      const current = nodes.find((n) => n.id === id);
      const mergedMeta = { ...(current?.metadata ?? {}), ...(patch.metadata ?? {}) };
      const { data, error } = await supabase
        .from("family_tree")
        .update({ ...patch, metadata: mergedMeta })
        .eq("id", id)
        .select("id,label,relation,parent_id,family_id,user_id,metadata")
        .maybeSingle();
      if (error) return { error: error.message } as const;
      if (data) setNodes((prev) => computeRelations(prev.map((n) => (n.id === id ? (data as FamilyNode) : n))));
      return { data } as const;
    },
    [user, nodes]
  );

  const removeMember = useCallback(
    async (id: string) => {
      if (!user) return { error: "Not authenticated" } as const;
      const { error } = await supabase.from("family_tree").delete().eq("id", id);
      if (error) return { error: error.message } as const;
      setNodes((prev) => computeRelations(prev.filter((n) => n.id !== id)));
      return { data: true } as const;
    },
    [user]
  );

  const recordEvent = useCallback(
    async (id: string, event: { type: "marriage" | "divorce" | "death"; date: string }) => {
      const current = nodes.find((n) => n.id === id);
      if (!current) return { error: "Not found" } as const;
      const events = [...(current.metadata.events ?? []), event];
      const metaPatch: Partial<FamilyNode["metadata"]> = { events };
      if (event.type === "death") metaPatch.deceased = true;
      return updateMember(id, { metadata: metaPatch });
    },
    [nodes, updateMember]
  );

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const root = useMemo(() => nodes.find((n) => n.metadata?.is_root) ?? null, [nodes]);

  const childrenOf = useCallback((id: string | null) => nodes.filter((n) => n.parent_id === id), [nodes]);

  return {
    loading,
    error,
    isOwner,
    familyId,
    nodes,
    root,
    byId,
    childrenOf,
    addMember,
    updateMember,
    removeMember,
    recordEvent,
  };
}

function computeRelations(nodes: FamilyNode[]): FamilyNode[] {
  // compute relation_to_user for display using root as reference
  const root = nodes.find((n) => n.metadata?.is_root);
  if (!root) return nodes;
  const byId = new Map(nodes.map((n) => [n.id, n]));

  const result = nodes.map((n) => ({ ...n }));
  const outById = new Map(result.map((n) => [n.id, n]));

  // BFS from root for generations
  const queue: Array<{ id: string; depth: number }> = [{ id: root.id, depth: 0 }];
  const visited = new Set<string>();
  while (queue.length) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const curr = outById.get(id);
    if (curr) curr.metadata = { ...(curr.metadata ?? {}), relation_to_user: depth === 0 ? "Self" : depth === 1 ? "Child" : depth === 2 ? "Grandchild" : `${"Great-".repeat(depth - 2)}Grandchild` };
    // children
    for (const child of result.filter((n) => n.parent_id === id)) {
      queue.push({ id: child.id, depth: depth + 1 });
    }
  }

  // Mark spouses
  result.forEach((n) => {
    const spouseId = n.metadata?.spouse_of;
    if (spouseId && byId.has(spouseId)) {
      const node = outById.get(n.id)!;
      const spouseLabel = byId.get(spouseId)!.label;
      const rel = n.id === root.id || spouseId === root.id ? "Spouse" : node.metadata?.relation_to_user ? `${node.metadata.relation_to_user}'s Spouse` : "Spouse";
      node.metadata = { ...(node.metadata ?? {}), relation_to_user: rel };
    }
  });

  return Array.from(outById.values());
}
