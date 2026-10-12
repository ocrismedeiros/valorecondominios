import type { ReactNode } from "react";
import { Bell, ClipboardCheck, FileText, Gauge, MessageCircle, QrCode, Wrench } from "lucide-react";
import { situacaoDe } from "../lib/datas";
import type { Manutencao, Predio } from "../lib/tipos";

type Props = {
  predios: Predio[];
  manutencoes: Manutencao[];
};

function Cartao({ titulo, texto, icone, children, className = "" }: { titulo: string; texto: string; icone: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <article className={`flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lime-300/15 text-lime-300">{icone}</div>
        <div className="min-w-0">
          <h2 className="font-semibold">{titulo}</h2>
          <p className="mt-1 text-sm text-neutral-400">{texto}</p>
        </div>
      </div>
      {children}
    </article>
  );
}

function EmBreve() {
  return (
    <span className="inline-flex w-fit items-center rounded-full bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300 ring-1 ring-neutral-700">
      Em breve
    </span>
  );
}

export function Recursos({ predios, manutencoes }: Props) {
  const total = manutencoes.length;
  const antecedenciaDe = (predioId: string) => predios.find((p) => p.id === predioId)?.antecedencia_dias ?? 7;
  const emDia = manutencoes.filter((m) => situacaoDe(m.proxima, antecedenciaDe(m.predio_id)) === "em_dia").length;
  const percentual = total ? Math.round((emDia / total) * 100) : 0;

  const grafico = predios.map((p) => {
    const ms = manutencoes.filter((m) => m.predio_id === p.id);
    const ok = ms.filter((m) => situacaoDe(m.proxima, p.antecedencia_dias) === "em_dia").length;
    return { id: p.id, nome: p.nome, pct: ms.length ? Math.round((ok / ms.length) * 100) : 0 };
  });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Cartao
        titulo="Manutenções preventivas"
        texto="O plano se monta com periodicidades sugeridas para cada item. Confira as datas com o responsável técnico."
        icone={<Wrench className="h-5 w-5" />}
        className="lg:col-span-2"
      >
        {grafico.length === 0 ? (
          <p className="rounded-lg bg-neutral-800/60 p-4 text-sm text-neutral-400">Cadastre um prédio para ver o gráfico do plano.</p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-neutral-400">Porcentagem do plano em dia, por prédio</p>
            <div className="flex h-48 items-end gap-3 border-b border-neutral-800 pb-1">
              {grafico.map((g) => (
                <div key={g.id} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400"
                    style={{ height: `${Math.max(g.pct, 4)}%` }}
                    title={`${g.nome}: ${g.pct}%`}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              {grafico.map((g) => (
                <p key={g.id} className="min-w-0 flex-1 truncate text-xs text-neutral-400">{g.nome} · {g.pct}%</p>
              ))}
            </div>
          </div>
        )}
      </Cartao>

      <Cartao
        titulo="Saúde do plano"
        texto="Quanto do plano de todos os prédios está em dia agora."
        icone={<Gauge className="h-5 w-5" />}
      >
        <div className="flex items-center gap-5">
          <div
            className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
            style={{ background: `conic-gradient(#4ade80 ${percentual * 3.6}deg, #3f3f46 0deg)` }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900">
              <span className="text-xl font-semibold text-lime-300">{percentual}%</span>
            </div>
          </div>
          <p className="text-sm text-neutral-300">{total === 0 ? "Sem manutenções no plano ainda." : `${emDia} de ${total} manutenções em dia.`}</p>
        </div>
      </Cartao>

      <Cartao
        titulo="Avisos pelo WhatsApp"
        texto="Cada alerta tem o botão Avisar no WhatsApp com a mensagem pronta. Você confere e aperta enviar."
        icone={<MessageCircle className="h-5 w-5" />}
      >
        <p className="rounded-lg bg-neutral-800/60 p-3 text-xs text-neutral-400">
          O envio é manual. Nada é disparado sozinho.
        </p>
      </Cartao>

      <Cartao
        titulo="Chamados pelo QR code"
        texto="Morador reporta o problema lendo um código no prédio e você acompanha até fechar."
        icone={<QrCode className="h-5 w-5" />}
      >
        <EmBreve />
      </Cartao>

      <Cartao
        titulo="Checklists com foto"
        texto="Rondas e vistorias com evidência em foto, pelo celular."
        icone={<ClipboardCheck className="h-5 w-5" />}
      >
        <EmBreve />
      </Cartao>

      <Cartao
        titulo="Relatório para assembleia"
        texto="Um documento com o plano e o histórico de cada prédio, pronto para imprimir ou salvar em PDF."
        icone={<FileText className="h-5 w-5" />}
      >
        <p className="text-sm text-neutral-300">Disponível na aba Prédios, no botão Relatório de cada prédio.</p>
      </Cartao>

      <Cartao
        titulo="Lembretes de vencimento"
        texto="Cada prédio define quantos dias antes do vencimento a equipe deve ser avisada."
        icone={<Bell className="h-5 w-5" />}
      >
        <p className="text-sm text-neutral-300">
          {predios.length === 0 ? "Nenhum prédio cadastrado." : `${predios.length} ${predios.length === 1 ? "prédio configurado" : "prédios configurados"}.`}
        </p>
      </Cartao>
    </div>
  );
}
