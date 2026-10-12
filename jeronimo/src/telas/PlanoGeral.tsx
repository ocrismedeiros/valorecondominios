import { useMemo, useState } from "react";
import { Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { db } from "../nucleo";
import { hojeISO, somarDias } from "../lib/datas";
import { periodicidades, type Manutencao, type Periodicidade, type Predio } from "../lib/tipos";
import { FormItemGeral, type DadosItemGeral } from "../components/FormItemGeral";
import { btnPerigo, btnPrimario, btnSecundario } from "../components/estilos";

const manutCol = db.colecao<Manutencao>("manutencoes");

type Grupo = { item: string; periodicidade: Periodicidade; qtd: number };
type Modo = { tipo: "novo" } | { tipo: "editar"; grupo: Grupo };

type Props = {
  predios: Predio[];
  manutencoes: Manutencao[];
  onMudou: () => Promise<void>;
};

export function PlanoGeral({ predios, manutencoes, onMudou }: Props) {
  const [modo, setModo] = useState<Modo | null>(null);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const grupos = useMemo(() => {
    const mapa = new Map<string, Grupo>();
    for (const m of manutencoes) {
      const g = mapa.get(m.item);
      if (g) g.qtd += 1;
      else mapa.set(m.item, { item: m.item, periodicidade: m.periodicidade, qtd: 1 });
    }
    return [...mapa.values()].sort((a, b) => a.item.localeCompare(b.item, "pt-BR"));
  }, [manutencoes]);

  async function salvar(d: DadosItemGeral, original?: string) {
    setErro("");
    setAviso("");
    try {
      if (original) {
        const alvo = manutencoes.filter((m) => m.item === original);
        for (const m of alvo) {
          await manutCol.atualizar(m.id, { item: d.item, periodicidade: d.periodicidade });
        }
        setAviso(`${d.item} atualizado em ${alvo.length} ${alvo.length === 1 ? "prédio" : "prédios"}.`);
      } else {
        const escolhidos = new Set(d.predioIds);
        let criados = 0;
        for (const p of predios) {
          if (!escolhidos.has(p.id)) continue;
          if (manutencoes.some((m) => m.predio_id === p.id && m.item === d.item)) continue;
          await manutCol.criar({
            predio_id: p.id,
            item: d.item,
            periodicidade: d.periodicidade,
            proxima: somarDias(hojeISO(), periodicidades[d.periodicidade].dias),
            historico: [],
          });
          criados += 1;
        }
        setAviso(
          criados > 0
            ? `${d.item} incluído em ${criados} ${criados === 1 ? "prédio" : "prédios"}. Confira as datas.`
            : `Os prédios escolhidos já tinham ${d.item}.`,
        );
      }
      setModo(null);
    } finally {
      await onMudou();
    }
  }

  async function remover(g: Grupo) {
    setErro("");
    setAviso("");
    try {
      const alvo = manutencoes.filter((m) => m.item === g.item);
      for (const m of alvo) await manutCol.remover(m.id);
      setAviso(`${g.item} apagado de ${alvo.length} ${alvo.length === 1 ? "prédio" : "prédios"}.`);
    } catch {
      setErro("Não foi possível apagar. Tente de novo.");
    } finally {
      await onMudou();
    }
  }

  const acoes = (g: Grupo) => (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => setModo({ tipo: "editar", grupo: g })} className={btnSecundario}>
        <Pencil className="h-4 w-4" /> Editar em todos
      </button>
      {confirmando === g.item ? (
        <>
          <button
            type="button"
            onClick={() => { setConfirmando(null); remover(g); }}
            className="h-11 rounded-lg bg-red-500/20 px-3 text-sm font-medium text-red-300"
          >
            Apagar de {g.qtd} {g.qtd === 1 ? "prédio" : "prédios"}
          </button>
          <button type="button" onClick={() => setConfirmando(null)} className="h-11 rounded-lg px-3 text-sm text-neutral-300">Cancelar</button>
        </>
      ) : (
        <button type="button" onClick={() => setConfirmando(g.item)} className={btnPerigo}>
          <Trash2 className="h-4 w-4" /> Apagar de todos
        </button>
      )}
    </div>
  );

  return (
    <section className="mb-8 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <Layers className="h-5 w-5 text-lime-300" /> Plano para todos os prédios
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Um item incluído aqui entra nos prédios que você escolher. Editar ou apagar vale para todos que têm o item.
          </p>
        </div>
        <button type="button" onClick={() => setModo({ tipo: "novo" })} className={btnPrimario}>
          <Plus className="h-4 w-4" /> Incluir item em vários prédios
        </button>
      </div>

      {aviso && <p className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{aviso}</p>}
      {erro && <p className="text-sm text-red-400">{erro}</p>}

      {grupos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-700 p-6 text-center text-sm text-neutral-400">
          Nenhum item no plano. Inclua o primeiro para os prédios escolhidos.
        </p>
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {grupos.map((g) => (
              <article key={g.item} className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                <div>
                  <p className="font-medium">{g.item}</p>
                  <p className="text-sm text-neutral-400">
                    {periodicidades[g.periodicidade].rotulo} · em {g.qtd} {g.qtd === 1 ? "prédio" : "prédios"}
                  </p>
                </div>
                {acoes(g)}
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-neutral-800 lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-900 text-xs uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Periodicidade</th>
                  <th className="px-4 py-3">Prédios</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {grupos.map((g) => (
                  <tr key={g.item} className="align-top hover:bg-neutral-900/60">
                    <td className="px-4 py-3 font-medium">{g.item}</td>
                    <td className="px-4 py-3">{periodicidades[g.periodicidade].rotulo}</td>
                    <td className="px-4 py-3">{g.qtd}</td>
                    <td className="px-4 py-3">{acoes(g)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modo?.tipo === "novo" && (
        <FormItemGeral
          predios={predios}
          nomesExistentes={grupos.map((g) => g.item)}
          onSalvar={(d) => salvar(d)}
          onFechar={() => setModo(null)}
        />
      )}
      {modo?.tipo === "editar" && (
        <FormItemGeral
          inicial={modo.grupo}
          predios={predios}
          nomesExistentes={grupos.map((g) => g.item)}
          onSalvar={(d) => salvar(d, modo.grupo.item)}
          onFechar={() => setModo(null)}
        />
      )}
    </section>
  );
}
