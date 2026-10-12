import { useCallback, useEffect, useState } from "react";
import { Check, Plus, RefreshCw, RotateCcw, Search, Ticket, Trash2 } from "lucide-react";
import { db } from "../nucleo";
import { formatarData } from "../lib/datas";
import { statusChamados, type CampoChamado, type Chamado, type Predio, type StatusChamado } from "../lib/tipos";
import { FormChamado } from "../components/FormChamado";
import { btnPerigo, btnPrimario, btnSecundario, input } from "../components/estilos";

const chamadoCol = db.colecao<Chamado>("chamados");

type Filtro = "todos" | StatusChamado;

const filtros: { id: Filtro; nome: string }[] = [
  { id: "todos", nome: "Todos" },
  { id: "aberto", nome: "Abertos" },
  { id: "em_andamento", nome: "Em andamento" },
  { id: "resolvido", nome: "Resolvidos" },
];

const avancos: Record<StatusChamado, { rotulo: string; para: StatusChamado }> = {
  aberto: { rotulo: "Iniciar atendimento", para: "em_andamento" },
  em_andamento: { rotulo: "Marcar como resolvido", para: "resolvido" },
  resolvido: { rotulo: "Reabrir", para: "aberto" },
};

function BadgeChamado({ status }: { status: StatusChamado }) {
  const s = statusChamados[status];
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${s.classe}`}>{s.rotulo}</span>
  );
}

type Props = { predios: Predio[] };

export function Chamados({ predios }: Props) {
  const [lista, setLista] = useState<Chamado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [novo, setNovo] = useState(false);
  const [confirmando, setConfirmando] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro("");
    try {
      setLista(await chamadoCol.listar());
    } catch {
      setErro("Não foi possível carregar os chamados.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const predioNome = (id: string) => predios.find((p) => p.id === id)?.nome ?? "Prédio removido";

  async function criar(c: CampoChamado) {
    const n = await chamadoCol.criar(c);
    setLista((p) => [n, ...p]);
    setNovo(false);
  }

  async function mudarStatus(c: Chamado, status: StatusChamado) {
    setErro("");
    try {
      const n = await chamadoCol.atualizar(c.id, {
        status,
        resolvido_em: status === "resolvido" ? new Date().toISOString().slice(0, 10) : undefined,
      });
      setLista((p) => p.map((x) => (x.id === n.id ? n : x)));
    } catch {
      setErro("Não foi possível atualizar o chamado. Tente de novo.");
    }
  }

  async function remover(c: Chamado) {
    setErro("");
    try {
      await chamadoCol.remover(c.id);
      setLista((p) => p.filter((x) => x.id !== c.id));
    } catch {
      setErro("Não foi possível apagar o chamado. Tente de novo.");
    }
  }

  if (carregando) return <p className="text-sm text-neutral-400">Carregando chamados...</p>;

  if (erro && lista.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
        <p className="text-sm text-red-300">{erro}</p>
        <button onClick={() => { setCarregando(true); carregar(); }} className={btnSecundario}>
          <RefreshCw className="h-4 w-4" /> Tentar de novo
        </button>
      </div>
    );
  }

  const termo = busca.trim().toLowerCase();
  const visiveis = lista.filter(
    (c) =>
      (filtro === "todos" || c.status === filtro) &&
      (!termo || `${c.titulo} ${predioNome(c.predio_id)}`.toLowerCase().includes(termo)),
  );

  const acoes = (c: Chamado) => (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => mudarStatus(c, avancos[c.status].para)} className={btnSecundario}>
        {c.status === "resolvido" ? <RotateCcw className="h-4 w-4" /> : <Check className="h-4 w-4" />} {avancos[c.status].rotulo}
      </button>
      {confirmando === c.id ? (
        <>
          <button onClick={() => { setConfirmando(null); remover(c); }} className="h-11 rounded-lg bg-red-500/20 px-3 text-sm font-medium text-red-300">Confirmar exclusão</button>
          <button onClick={() => setConfirmando(null)} className="h-11 rounded-lg px-3 text-sm text-neutral-300">Cancelar</button>
        </>
      ) : (
        <button onClick={() => setConfirmando(c.id)} className={btnPerigo}>
          <Trash2 className="h-4 w-4" /> Apagar
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative block flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por problema ou prédio" className={`${input} pl-9`} />
        </label>
        <button onClick={() => setNovo(true)} className={btnPrimario}>
          <Plus className="h-4 w-4" /> Novo chamado
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filtros.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`h-11 shrink-0 rounded-full px-4 text-sm ring-1 ${filtro === f.id ? "bg-lime-300 font-semibold text-neutral-950 ring-lime-300" : "text-neutral-300 ring-neutral-700 hover:bg-neutral-800"}`}
          >
            {f.nome}
          </button>
        ))}
      </div>

      {erro && lista.length > 0 && <p className="text-sm text-red-400">{erro}</p>}

      {lista.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-neutral-700 p-10 text-center">
          <Ticket className="h-10 w-10 text-lime-300" />
          <div>
            <p className="font-semibold">Nenhum chamado aberto</p>
            <p className="mt-1 text-sm text-neutral-400">Registre aqui cada problema reportado, acompanhe o atendimento e marque como resolvido.</p>
          </div>
          <button onClick={() => setNovo(true)} className={btnPrimario}>
            <Plus className="h-4 w-4" /> Abrir o primeiro chamado
          </button>
        </div>
      ) : visiveis.length === 0 ? (
        <p className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-center text-sm text-neutral-400">Nenhum chamado com esses filtros.</p>
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {visiveis.map((c) => (
              <article key={c.id} className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{c.titulo}</p>
                    <p className="text-sm text-neutral-400">{predioNome(c.predio_id)}</p>
                  </div>
                  <BadgeChamado status={c.status} />
                </div>
                {c.descricao && <p className="text-sm text-neutral-300">{c.descricao}</p>}
                <p className="text-sm text-neutral-400">
                  Aberto em {formatarData(c.aberto_em)}
                  {c.status === "resolvido" && c.resolvido_em ? ` · Resolvido em ${formatarData(c.resolvido_em)}` : ""}
                </p>
                {acoes(c)}
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-neutral-800 lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-900 text-xs uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aberto em</th>
                  <th className="px-4 py-3">Problema</th>
                  <th className="px-4 py-3">Prédio</th>
                  <th className="px-4 py-3">Resolvido em</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {visiveis.map((c) => (
                  <tr key={c.id} className="align-top hover:bg-neutral-900/60">
                    <td className="px-4 py-3"><BadgeChamado status={c.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3">{formatarData(c.aberto_em)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.titulo}</p>
                      {c.descricao && <p className="text-xs text-neutral-400">{c.descricao}</p>}
                    </td>
                    <td className="px-4 py-3">{predioNome(c.predio_id)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{c.status === "resolvido" && c.resolvido_em ? formatarData(c.resolvido_em) : "-"}</td>
                    <td className="px-4 py-3">{acoes(c)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {novo && <FormChamado predios={predios} onSalvar={criar} onFechar={() => setNovo(false)} />}
    </div>
  );
}
