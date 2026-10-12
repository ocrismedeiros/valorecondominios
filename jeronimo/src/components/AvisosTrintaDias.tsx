import { CalendarClock } from "lucide-react";
import { diasAte, formatarData, textoPrazo } from "../lib/datas";
import type { Manutencao, Predio } from "../lib/tipos";
import { AvisoBotao } from "./AvisoBotao";

type Props = {
  predios: Predio[];
  manutencoes: Manutencao[];
};

export function AvisosTrintaDias({ predios, manutencoes }: Props) {
  const predioDe = (id: string) => predios.find((p) => p.id === id);

  const proximos = manutencoes
    .filter((m) => {
      const d = diasAte(m.proxima);
      return d >= 0 && d <= 30;
    })
    .sort((a, b) => a.proxima.localeCompare(b.proxima));

  return (
    <section className="space-y-3">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <CalendarClock className="h-5 w-5 text-lime-300" /> Vencem em até 30 dias
        </h2>
        <p className="text-sm text-neutral-400">
          Toque em Avisar no WhatsApp: a mensagem abre pronta e você só aperta enviar. O sistema não envia sozinho.
        </p>
      </div>

      {proximos.length === 0 ? (
        <p className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-300">
          Nenhuma manutenção vence nos próximos 30 dias.
        </p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {proximos.map((m) => {
            const predio = predioDe(m.predio_id);
            return (
              <article key={m.id} className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                <div>
                  <p className="font-medium">{m.item}</p>
                  <p className="text-sm text-neutral-400">{predio?.nome ?? "Prédio removido"}</p>
                </div>
                <p className="text-sm text-neutral-300">
                  {formatarData(m.proxima)} · {textoPrazo(m.proxima)}
                </p>
                <AvisoBotao m={m} predio={predio} />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
