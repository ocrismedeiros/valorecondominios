import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { eventosDoAno, type StatusEvento } from "../lib/calendario";
import { formatarData, hojeISO } from "../lib/datas";
import { periodicidades, type Manutencao, type Predio } from "../lib/tipos";
import { btnSecundario } from "../components/estilos";

const statusEvt: Record<StatusEvento, { rotulo: string; classe: string; ponto: string }> = {
  concluida: { rotulo: "Concluída", classe: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30", ponto: "bg-emerald-400" },
  pendente: { rotulo: "Pendente", classe: "bg-amber-500/15 text-amber-300 ring-amber-500/30", ponto: "bg-amber-400" },
  vencida: { rotulo: "Vencida", classe: "bg-red-500/15 text-red-300 ring-red-500/30", ponto: "bg-red-400" },
};

const letrasSemana = ["D", "S", "T", "Q", "Q", "S", "S"];

type Props = {
  predios: Predio[];
  manutencoes: Manutencao[];
};

export function Calendario({ predios, manutencoes }: Props) {
  const agora = new Date();
  const [ano, setAno] = useState(agora.getFullYear());
  const [mes, setMes] = useState(agora.getMonth());
  const [dia, setDia] = useState<string | null>(null);

  const nomeDo = (id: string) => predios.find((p) => p.id === id)?.nome ?? "Prédio removido";
  const eventos = useMemo(() => eventosDoAno(manutencoes, ano, nomeDo), [manutencoes, ano, predios]);

  if (manutencoes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-neutral-700 p-10 text-center">
        <CalendarDays className="h-10 w-10 text-lime-300" />
        <div>
          <p className="font-semibold">Calendário vazio</p>
          <p className="mt-1 text-sm text-neutral-400">Gere o plano padrão de um prédio na aba Prédios para ver as manutenções do ano aqui.</p>
        </div>
      </div>
    );
  }

  const inicioMes = new Date(ano, mes, 1);
  const dias = eachDayOfInterval({ start: inicioMes, end: endOfMonth(inicioMes) });
  const espacos = getDay(inicioMes);
  const nomeMes = format(inicioMes, "MMMM yyyy", { locale: ptBR });
  const hoje = hojeISO();
  const prefixoMes = `${ano}-${String(mes + 1).padStart(2, "0")}`;

  const doMes = eventos.filter((e) => e.data.startsWith(prefixoMes));
  const lista = dia ? eventos.filter((e) => e.data === dia) : doMes;
  const contagem = (s: StatusEvento) => eventos.filter((e) => e.status === s).length;

  function mudarMes(n: number) {
    const d = addMonths(inicioMes, n);
    setAno(d.getFullYear());
    setMes(d.getMonth());
    setDia(null);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-400">Concluídas em {ano}</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">{contagem("concluida")}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-400">Pendentes</p>
          <p className="mt-2 text-2xl font-semibold text-amber-300">{contagem("pendente")}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-400">Vencidas</p>
          <p className="mt-2 text-2xl font-semibold text-red-300">{contagem("vencida")}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <button type="button" onClick={() => mudarMes(-1)} aria-label="Mês anterior" className={btnSecundario}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-center font-semibold capitalize">{nomeMes}</p>
            <button type="button" onClick={() => mudarMes(1)} aria-label="Próximo mês" className={btnSecundario}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-xs text-neutral-500">
            {letrasSemana.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: espacos }).map((_, i) => (
              <span key={`vazio-${i}`} />
            ))}
            {dias.map((d) => {
              const iso = format(d, "yyyy-MM-dd");
              const doDia = eventos.filter((e) => e.data === iso);
              const selecionado = dia === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setDia(selecionado ? null : iso)}
                  className={`flex h-14 flex-col justify-between rounded-lg p-1.5 text-left text-sm ring-1 lg:h-20 ${selecionado ? "bg-lime-300/15 ring-lime-300" : "ring-neutral-800 hover:bg-neutral-800/60"}`}
                >
                  <span className={iso === hoje ? "font-semibold text-lime-300" : "text-neutral-200"}>{format(d, "d")}</span>
                  {doDia.length > 0 && (
                    <span className="flex flex-wrap gap-1">
                      {doDia.slice(0, 4).map((e, i) => (
                        <span key={i} className={`h-2 w-2 rounded-full ${statusEvt[e.status].ponto}`} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-neutral-400">
            {(Object.keys(statusEvt) as StatusEvento[]).map((s) => (
              <span key={s} className="inline-flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${statusEvt[s].ponto}`} /> {statusEvt[s].rotulo}
              </span>
            ))}
          </div>
        </section>

        <aside className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold">{dia ? `Dia ${formatarData(dia)}` : "Eventos do mês"}</h2>
            {dia && (
              <button type="button" onClick={() => setDia(null)} className="h-11 rounded-lg px-3 text-sm text-lime-300 hover:bg-neutral-800">
                Ver o mês inteiro
              </button>
            )}
          </div>
          {lista.length === 0 ? (
            <p className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-400">Nenhuma manutenção para este período.</p>
          ) : (
            <ul className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
              {lista.map((e) => (
                <li key={`${e.manutencaoId}-${e.data}`} className="space-y-1.5 rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-neutral-300">{formatarData(e.data)}</p>
                    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusEvt[e.status].classe}`}>
                      {statusEvt[e.status].rotulo}
                    </span>
                  </div>
                  <p className="font-medium">{e.item}</p>
                  <p className="text-sm text-neutral-400">{e.predio} · {periodicidades[e.periodicidade].rotulo}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
