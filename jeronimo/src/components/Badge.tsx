import { situacoes, type Situacao } from "../lib/tipos";

export function Badge({ situacao }: { situacao: Situacao }) {
  const s = situacoes[situacao];
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${s.classe}`}>
      {s.rotulo}
    </span>
  );
}
