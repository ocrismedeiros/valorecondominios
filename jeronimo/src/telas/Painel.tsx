import { useState } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { Check, Clock, Receipt, Send, Trash2 } from "lucide-react";
import { formatarData, situacaoDe, textoPrazo } from "../lib/datas";
import type { Manutencao, Predio, Situacao, SituacaoOrcamento } from "../lib/tipos";
import { Badge } from "../components/Badge";
import { AvisoBotao } from "../components/AvisoBotao";
import { AvisosTrintaDias } from "../components/AvisosTrintaDias";
import { btnPrimario, btnSecundario } from "../components/estilos";

type Props = {
  predios: Predio[];
  manutencoes: Manutencao[];
  onConcluir: (m: Manutencao) => void;
  onNovoPredio: () => void;
  onOrcamento: (m: Manutencao, situacao: SituacaoOrcamento) => void;
  onIrParaSituacao: (s: Situacao) => void;
  temExemplos: boolean;
  onApagarExemplos: () => void;
};

const rotuloOrcamento: Record<SituacaoOrcamento, string> = {
  aguardando: "Aguardando resposta do síndico",
  sindico: "Síndico vai buscar o orçamento",
  equipe: "Nós vamos buscar o orçamento",
};

function Indicador({ titulo, valor, classe, onClick }: { titulo: string; valor: string; classe: string; onClick?: () => void }) {
  const base = "rounded-xl border border-neutral-800 bg-neutral-900 p-4";
  const conteudo = (
    <>
      <p className="text-xs uppercase tracking-wide text-neutral-400">{titulo}</p>
      <p className={`mt-2 text-3xl font-semibold ${classe}`}>{valor}</p>
      {onClick && <p className="mt-2 text-xs text-lime-300">Ver manutenções</p>}
    </>
  );
  if (!onClick) return <div className={base}>{conteudo}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${titulo}: ver manutenções`}
      className={`${base} min-h-11 text-left hover:border-neutral-600 hover:bg-neutral-800/60`}
    >
      {conteudo}
    </button>
  );
}

function diasEsperando(desde: string): string {
  const n = differenceInCalendarDays(new Date(), parseISO(desde));
  if (n <= 0) return "Aguardando desde hoje";
  return `Aguardando há ${n} ${n === 1 ? "dia" : "dias"}`;
}

export function Painel({ predios, manutencoes, onConcluir, onNovoPredio, onOrcamento, onIrParaSituacao, temExemplos, onApagarExemplos }: Props) {
  const [confirmando, setConfirmando] = useState(false);

  if (predios.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-neutral-700 p-10 text-center">
        <Clock className="h-10 w-10 text-lime-300" />
        <div>
          <p className="font-semibold">Comece cadastrando um prédio</p>
          <p className="mt-1 text-sm text-neutral-400">Depois, gere o plano padrão de manutenções com um clique.</p>
        </div>
        <button onClick={onNovoPredio} className={btnPrimario}>Cadastrar o primeiro prédio</button>
      </div>
    );
  }

  const predioDe = (id: string) => predios.find((p) => p.id === id);
  const antecedenciaDe = (m: Manutencao) => predioDe(m.predio_id)?.antecedencia_dias ?? 7;
  const situacaoDeM = (m: Manutencao) => situacaoDe(m.proxima, antecedenciaDe(m));

  const pedem = manutencoes
    .filter((m) => situacaoDeM(m) !== "em_dia")
    .sort((a, b) => a.proxima.localeCompare(b.proxima));
  const atrasadas = pedem.filter((m) => situacaoDeM(m) === "atrasada").length;
  const total = manutencoes.length;
  const emDia = total - pedem.length;
  const conformidade = total ? Math.round((emDia / total) * 100) : 100;

  const aguardando = manutencoes
    .filter((m) => m.orcamento?.situacao === "aguardando")
    .sort((a, b) => (a.orcamento?.desde ?? "").localeCompare(b.orcamento?.desde ?? ""));

  const resumo = [
    "Manutenções que pedem atenção:",
    ...pedem.map((m) => `- ${formatarData(m.proxima)} | ${predioDe(m.predio_id)?.nome ?? "Prédio"} | ${m.item} | ${textoPrazo(m.proxima)}`),
  ].join("\n");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador titulo="Atrasadas" valor={String(atrasadas)} classe="text-red-300" onClick={() => onIrParaSituacao("atrasada")} />
        <Indicador titulo="A vencer" valor={String(pedem.length - atrasadas)} classe="text-amber-300" onClick={() => onIrParaSituacao("a_vencer")} />
        <Indicador titulo="Em dia" valor={String(emDia)} classe="text-emerald-300" onClick={() => onIrParaSituacao("em_dia")} />
        <Indicador titulo="Plano em dia" valor={`${conformidade}%`} classe="text-lime-300" />
      </div>

      {total > 0 && <AvisosTrintaDias predios={predios} manutencoes={manutencoes} />}

      {total > 0 && (
        <section className="space-y-3">
          <div>
            <h2 className="font-semibold">Orçamentos aguardando resposta</h2>
            <p className="text-sm text-neutral-400">Avisos enviados ao síndico que ainda não disseram quem busca o orçamento.</p>
          </div>
          {aguardando.length === 0 ? (
            <p className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-300">
              Nenhum orçamento esperando resposta. Ao avisar um síndico, marque o orçamento na lista de atenção abaixo.
            </p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {aguardando.map((m) => (
                <article key={m.id} className="space-y-3 rounded-xl border border-amber-500/30 bg-neutral-900 p-4">
                  <div>
                    <p className="font-medium">{m.item}</p>
                    <p className="text-sm text-neutral-400">{predioDe(m.predio_id)?.nome ?? "Prédio removido"}</p>
                  </div>
                  <p className="text-sm text-neutral-300">
                    Aviso em {formatarData(m.orcamento?.desde ?? m.proxima)} · {diasEsperando(m.orcamento?.desde ?? m.proxima)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => onOrcamento(m, "sindico")} className={btnSecundario}>Síndico vai buscar</button>
                    <button onClick={() => onOrcamento(m, "equipe")} className={btnPrimario}>Nós vamos buscar</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold">Pedem atenção agora</h2>
            <p className="text-sm text-neutral-400">Atrasadas e as que vencem dentro da antecedência de cada prédio.</p>
          </div>
          {pedem.length > 0 && (
            <a href={`https://wa.me/?text=${encodeURIComponent(resumo)}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500/15 px-4 text-sm font-medium text-emerald-300 ring-1 ring-emerald-500/30">
              <Send className="h-4 w-4" /> Enviar resumo para a equipe
            </a>
          )}
        </div>

        {total === 0 ? (
          <p className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-300">
            Nenhuma manutenção no plano ainda. Vá em Prédios e gere o plano padrão.
          </p>
        ) : pedem.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-300">
            <Clock className="h-5 w-5 text-emerald-300" /> Nenhuma manutenção perto do prazo. Tudo em dia.
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {pedem.map((m) => (
              <article key={m.id} className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{m.item}</p>
                    <p className="text-sm text-neutral-400">{predioDe(m.predio_id)?.nome ?? "Prédio removido"}</p>
                  </div>
                  <Badge situacao={situacaoDeM(m)} />
                </div>
                <p className="text-sm text-neutral-300">{formatarData(m.proxima)} · {textoPrazo(m.proxima)}</p>
                {m.orcamento && (
                  <p className="text-sm text-neutral-400">Orçamento: {rotuloOrcamento[m.orcamento.situacao]}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <AvisoBotao m={m} predio={predioDe(m.predio_id)} />
                  {!m.orcamento && (
                    <button onClick={() => onOrcamento(m, "aguardando")} className={btnSecundario}>
                      <Receipt className="h-4 w-4" /> Marcar orçamento aguardando
                    </button>
                  )}
                  <button onClick={() => onConcluir(m)} className={btnSecundario}>
                    <Check className="h-4 w-4" /> Concluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {temExemplos && (
        <section className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-neutral-400">Os itens de exemplo servem para conhecer o sistema.</p>
          {confirmando ? (
            <div className="flex gap-2">
              <button onClick={() => { setConfirmando(false); onApagarExemplos(); }} className="h-11 rounded-lg bg-red-500/20 px-4 text-sm font-medium text-red-300">Confirmar</button>
              <button onClick={() => setConfirmando(false)} className="h-11 rounded-lg px-4 text-sm text-neutral-300">Cancelar</button>
            </div>
          ) : (
            <button onClick={() => setConfirmando(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm text-neutral-300 hover:bg-neutral-800">
              <Trash2 className="h-4 w-4" /> Apagar exemplos
            </button>
          )}
        </section>
      )}
    </div>
  );
}
