import { Shield } from "lucide-react";

export function BrandLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-full bg-accent/90 text-accent-foreground grid place-items-center shadow" aria-hidden>
        <Shield className="h-4 w-4" />
      </div>
      <span className="font-display text-xl">Vault</span>
    </div>
  );
}
