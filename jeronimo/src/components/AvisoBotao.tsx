import { MessageCircle } from "lucide-react";
import type { Manutencao, Predio } from "../lib/tipos";
import { linkWhatsApp, mensagemAlerta } from "../lib/mensagens";

export function AvisoBotao({ m, predio }: { m: Manutencao; predio?: Predio }) {
  if (!predio?.contato) {
    return <span className="inline-flex min-h-11 items-center text-xs text-neutral-500">Cadastre o WhatsApp do prédio para avisar</span>;
  }
  return (
    <a
      href={linkWhatsApp(predio.contato, mensagemAlerta(m, predio))}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-500/15 px-3 text-sm font-medium text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25"
    >
      <MessageCircle className="h-4 w-4" /> Avisar no WhatsApp
    </a>
  );
}
