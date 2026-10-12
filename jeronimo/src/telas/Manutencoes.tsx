import { Check, ClipboardList, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatarData, situacaoDe, textoPrazo } from "../lib/datas";
import { periodicidades, type Manutencao, type Periodicidade, type Predio, type Situacao } from "../lib/tipos";
import { Badge } from "../components/Badge";
import { AvisoBotao } from "../components/AvisoBotao";
import { btnPerigo, btnPrimario, btnSecundario, input } from "../components/estilos";

type Filtro = Situacao | "todas";

const filtros: { id: Filtro; nome: string }[] = [
  { id: "todas", nome: "Todas" },
  { id: "atrasada", nome: "Atrasadas" },
  { id: "a_vencer", nome: "A vencer" },
  { id: "em_dia", nome: "Em dia" },
];

type Props = {
  predios: Predio[];
  manutencoes: Manutencao[];
  filtro: Filtro;
  onFiltro: (f: Filtro) => void;
  onNova: () => void;
  onEditar: (m: Manutencao) => void;
  onConcluir: (m: Manutencao) => void;
  onRemover: (m: Manutencao) => void;
  onPeriodicidade: (m: Manutencao, p: Periodicidade) => void;
};

function SeletorPeriodicidade({ valor, onMudar }: { valor: Periodicidade; onMudar: (p: Periodicidade) => void }) {
  return (
    <select
      aria-label="Periodicidade"
      value={valor}
      onChange={(e) => onMudar(e.target.value as Periodicidade)}
      className={`${input} min-w-32`}
    >
      {(Object.keys(periodicidades) as Periodicidade[]).map((p) => (
        <option key={p} value={p}>{periodicidades[p].rotulo}</option>
      ))}
    </select>
  );
}

export function Manutencoes({ predios, manutencoes, filtro, onFiltro, onNova, onEditar, onConcluir, onRemover, onPeriodicidade }: Props) {
  const [busca, setBusca] = useState("");
  const [confirmando, setConfirmando] = useState<string | null>(null);

  if (manutencoes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-neutral-700 p-10 text-center">
        <ClipboardList className="h-10 w-10 text-lime-300" />
        <div>
          <p className="font-semibold">Nenhuma manutenção no plano</p>
          <p className="mt-1 text-sm text-neutral-400">Gere o plano padrão na aba Prédios, ou adicione uma manutenção à mão.</p>
        </div>
        <button onClick={onNova} className={btnPrimario}>
          <Plus className="h-4 w-4" /> Nova manutenção
        </button>
      </div>
    );
  }

  const predioDe = (id: string) => predios.find((p) => p.id === id);
  const antecedenciaDe = (m: Manutencao) => predioDe(m.predio_id)?.antecedencia_dias ?? 7;
  const termo = busca.trim().toLowerCase();

  const lista = manutencoes
    .filter((m) => {
      const nome = predioDe(m.predio_id)?.nome ?? "";
      if (termo && !`${m.item} ${nome}`.toLowerCase().includes(termo)) return false;
      return filtro === "todas" || situacaoDe(m.proxima, antecedenciaDe(m)) === filtro;
    })
    .sort((a, b) => a.proxima.localeCompare(b.proxima));

  const acoes = (m: Manutencao) => (
    <div className="flex flex-wrap gap-2">
      <AvisoBotao m={m} predio={predioDe(m.predio_id)} />
      <button onClick={() => onConcluir(m)} className={btnSecundario}>
        <Check className="h-4 w-4" /> Concluir
      </button>
      <button onClick={() => onEditar(m)} className={btnSecundario}>
        <Pencil className="h-4 w-4" /> Editar
      </button>
      {confirmando === m.id ? (
        <>
          <button onClick={() => { setConfirmando(null); onRemover(m); }} className="h-11 rounded-lg bg-red-500/20 px-3 text-sm font-medium text-red-300">Confirmar exclusão</button>
          <button onClick={() => setConfirmando(null)} className="h-11 rounded-lg px-3 text-sm text-neutral-300">Cancelar</button>
        </>
      ) : (
        <button onClick={() => setConfirmando(m.id)} className={btnPerigo}>
          <Trash2 className="h-4 w-4" /> Apagar
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por item ou prédio"
          className={`${input} pl-9`}
        />
      </label>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filtros.map((f) => (
          <button
            key={f.id}
            onClick={() => onFiltro(f.id)}
            className={`h-11 shrink-0 rounded-full px-4 text-sm ring-1 ${filtro === f.id ? "bg-lime-300 font-semibold text-neutral-950 ring-lime-300" : "text-neutral-300 ring-neutral-700 hover:bg-neutral-800"}`}
          >
            {f.nome}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <p className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-center text-sm text-neutral-400">Nenhuma manutenção com esses filtros.</p>
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {lista.map((m) => (
              <article key={m.id} className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{m.item}</p>
                    <p className="text-sm text-neutral-400">{predioDe(m.predio_id)?.nome ?? "Prédio removido"}</p>
                  </div>
                  <Badge situacao={situacaoDe(m.proxima, antecedenciaDe(m))} />
                </div>
                <p className="text-sm text-neutral-300">{formatarData(m.proxima)} · {textoPrazo(m.proxima)}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-neutral-400">Periodicidade</span>
                  <SeletorPeriodicidade valor={m.periodicidade} onMudar={(p) => onPeriodicidade(m, p)} />
                </div>
                <p className="text-sm text-neutral-400">
                  Última: {m.historico[0] ? formatarData(m.historico[0].data) : "nunca"}
                </p>
                {acoes(m)}
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-neutral-800 lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-900 text-xs uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="px-4 py-3">Situação</th>
                  <th className="px-4 py-3">Próxima execução</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Prédio</th>
                  <th className="px-4 py-3">Periodicidade</th>
                  <th className="px-4 py-3">Última execução</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {lista.map((m) => (
                  <tr key={m.id} className="align-top hover:bg-neutral-900/60">
                    <td className="px-4 py-3"><Badge situacao={situacaoDe(m.proxima, antecedenciaDe(m))} /></td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <p>{formatarData(m.proxima)}</p>
                      <p className="text-xs text-neutral-400">{textoPrazo(m.proxima)}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">{m.item}</td>
                    <td className="px-4 py-3">{predioDe(m.predio_id)?.nome ?? "Prédio removido"}</td>
                    <td className="px-4 py-3">
                      <SeletorPeriodicidade valor={m.periodicidade} onMudar={(p) => onPeriodicidade(m, p)} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{m.historico[0] ? formatarData(m.historico[0].data) : "Nunca"}</td>
                    <td className="px-4 py-3">{acoes(m)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
