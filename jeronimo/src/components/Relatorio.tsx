import { Printer, X } from "lucide-react";
import { formatarData, hojeISO, situacaoDe, textoPrazo } from "../lib/datas";
import { periodicidades, situacoes, type Manutencao, type Predio } from "../lib/tipos";
import { btnPrimario, btnSecundario } from "./estilos";

type Props = {
  predio: Predio;
  manutencoes: Manutencao[];
  onFechar: () => void;
};

const css = `@media print {
  body * { visibility: hidden !important; }
  #relatorio-impressao, #relatorio-impressao * { visibility: visible !important; }
  #relatorio-impressao { position: absolute; left: 0; top: 0; width: 100%; padding: 0; margin: 0; }
}`;

export function Relatorio({ predio, manutencoes, onFechar }: Props) {
  const ms = manutencoes
    .filter((m) => m.predio_id === predio.id)
    .sort((a, b) => a.proxima.localeCompare(b.proxima));

  const historico = ms
    .flatMap((m) => m.historico.map((r) => ({ item: m.item, data: r.data, nota: r.nota })))
    .sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/95 p-4">
      <style>{css}</style>
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex flex-col-reverse gap-2 print:hidden lg:flex-row lg:items-center lg:justify-between">
          <button type="button" onClick={onFechar} className={btnSecundario}>
            <X className="h-4 w-4" /> Fechar
          </button>
          <button type="button" onClick={() => window.print()} className={btnPrimario}>
            <Printer className="h-4 w-4" /> Imprimir ou salvar em PDF
          </button>
        </div>

        <div id="relatorio-impressao" className="rounded-xl bg-white p-6 text-neutral-900 lg:p-10">
          <header className="border-b border-neutral-300 pb-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Relatório de manutenções</p>
            <h2 className="mt-1 text-2xl font-semibold">{predio.nome}</h2>
            {predio.endereco && <p className="text-sm text-neutral-600">{predio.endereco}</p>}
            <p className="mt-2 text-sm text-neutral-600">
              Síndico: {predio.sindico || "não informado"} · Emitido em {formatarData(hojeISO())}
            </p>
          </header>

          <section className="mt-6">
            <h3 className="font-semibold">Plano de manutenções</h3>
            {ms.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-600">Nenhuma manutenção cadastrada para este prédio.</p>
            ) : (
              <table className="mt-3 w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-300 text-xs uppercase text-neutral-500">
                    <th className="py-2 pr-3">Item</th>
                    <th className="py-2 pr-3">Periodicidade</th>
                    <th className="py-2 pr-3">Próxima execução</th>
                    <th className="py-2 pr-3">Situação</th>
                    <th className="py-2">Última execução</th>
                  </tr>
                </thead>
                <tbody>
                  {ms.map((m) => (
                    <tr key={m.id} className="border-b border-neutral-200 align-top">
                      <td className="py-2 pr-3 font-medium">{m.item}</td>
                      <td className="py-2 pr-3">{periodicidades[m.periodicidade].rotulo}</td>
                      <td className="whitespace-nowrap py-2 pr-3">
                        {formatarData(m.proxima)}
                        <span className="block text-xs text-neutral-500">{textoPrazo(m.proxima)}</span>
                      </td>
                      <td className="py-2 pr-3">{situacoes[situacaoDe(m.proxima, predio.antecedencia_dias)].rotulo}</td>
                      <td className="whitespace-nowrap py-2">{m.historico[0] ? formatarData(m.historico[0].data) : "Nunca"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="mt-8">
            <h3 className="font-semibold">Histórico de execuções</h3>
            {historico.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-600">Nenhuma execução registrada ainda.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {historico.map((h, i) => (
                  <li key={`${h.item}-${h.data}-${i}`} className="border-l-2 border-neutral-300 pl-3">
                    <span className="font-medium">{formatarData(h.data)}</span> · {h.item}
                    {h.nota && <span className="block text-neutral-600">{h.nota}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <footer className="mt-10 border-t border-neutral-300 pt-4 text-xs text-neutral-500">
            Relatório gerado a partir dos registros do sistema. Confira as datas com o responsável técnico.
          </footer>
        </div>
      </div>
    </div>
  );
}
