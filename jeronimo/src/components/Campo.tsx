import type { ReactNode } from "react";

export function Campo({ rotulo, erro, children }: { rotulo: string; erro?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-neutral-300">{rotulo}</span>
      {children}
      {erro && <span className="text-xs text-red-400">{erro}</span>}
    </label>
  );
}
