import { useCallback, useEffect, useState } from "react";
import { Building, CalendarDays, ClipboardList, LayoutDashboard, LayoutGrid, LogOut, Plus, RefreshCw, Ticket, Wrench, type LucideIcon } from "lucide-react";
import { auth, db } from "./nucleo";
import { periodicidades, type CampoManutencao, type CampoPredio, type Config, type Manutencao, type Periodicidade, type Predio, type Situacao, type SituacaoOrcamento } from "./lib/tipos";
import { formatarData, hojeISO, somarDias } from "./lib/datas";
import { planoPadrao } from "./lib/plano";
import { itensExemplo, predioExemplo } from "./lib/exemplos";
import { Painel } from "./telas/Painel";
import { Manutencoes } from "./telas/Manutencoes";
import { Predios } from "./telas/Predios";
import { Recursos } from "./telas/Recursos";
import { Calendario } from "./telas/Calendario";
import { Chamados } from "./telas/Chamados";
import { AcessoEquipe } from "./telas/AcessoEquipe";
import { FormPredio } from "./components/FormPredio";
import { FormManutencao } from "./components/FormManutencao";
import { ConcluirDialog } from "./components/ConcluirDialog";
import { btnSecundario } from "./components/estilos";

const predioCol = db.colecao<Predio>("predios");
const manutCol = db.colecao<Manutencao>("manutencoes");
const configCol = db.colecao<Config>("config");

type Aba = "painel" | "manutencoes" | "calendario" | "chamados" | "predios" | "recursos";
type Modal = { tipo: "predio"; alvo?: Predio } | { tipo: "manutencao"; alvo?: Manutencao };

const abas: { id: Aba; nome: string; icone: LucideIcon }[] = [
  { id: "painel", nome: "Painel", icone: LayoutDashboard },
  { id: "manutencoes", nome: "Manutenções", icone: ClipboardList },
  { id: "calendario", nome: "Calendário", icone: CalendarDays },
  { id: "chamados", nome: "Chamados", icone: Ticket },
  { id: "predios", nome: "Prédios", icone: Building },
  { id: "recursos", nome: "Recursos", icone: LayoutGrid },
];

function Sistema({ onSair }: { onSair: () => void }) {
  const [predios, setPredios] = useState<Predio[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [aba, setAba] = useState<Aba>("painel");
  const [filtroSit, setFiltroSit] = useState<Situacao | "todas">("todas");
  const [modal, setModal] = useState<Modal | null>(null);
  const [concluindo, setConcluindo] = useState<Manutencao | null>(null);

  const carregar = useCallback(async () => {
    setErro("");
    try {
      let ps = await predioCol.listar();
      let ms = await manutCol.listar();
      const cfg = await configCol.listar();
      if (cfg.length === 0) {
        if (ps.length === 0 && ms.length === 0) {
          const p = await predioCol.criar(predioExemplo);
          for (const c of itensExemplo(p.id)) await manutCol.criar(c);
          ps = await predioCol.listar();
          ms = await manutCol.listar();
        }
        await configCol.criar({ exemplos_criados: true });
      }
      setPredios(ps);
      setManutencoes(ms);
    } catch {
      setErro("Não foi possível carregar os dados.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const predioNome = (id: string) => predios.find((p) => p.id === id)?.nome ?? "Prédio removido";

  function irParaSituacao(s: Situacao) {
    setFiltroSit(s);
    setAba("manutencoes");
    window.scrollTo({ top: 0 });
  }

  async function salvarPredio(c: CampoPredio, id?: string) {
    if (id) {
      const n = await predioCol.atualizar(id, c);
      setPredios((p) => p.map((x) => (x.id === n.id ? n : x)));
    } else {
      const n = await predioCol.criar(c);
      setPredios((p) => [n, ...p]);
    }
    setModal(null);
  }

  async function salvarManutencao(c: CampoManutencao, id?: string) {
    if (id) {
      const n = await manutCol.atualizar(id, c);
      setManutencoes((p) => p.map((x) => (x.id === n.id ? n : x)));
    } else {
      const n = await manutCol.criar(c);
      setManutencoes((p) => [n, ...p]);
    }
    setModal(null);
  }

  async function removerPredio(p: Predio) {
    setErro("");
    try {
      for (const m of manutencoes.filter((x) => x.predio_id === p.id)) await manutCol.remover(m.id);
      await predioCol.remover(p.id);
      setManutencoes((prev) => prev.filter((x) => x.predio_id !== p.id));
      setPredios((prev) => prev.filter((x) => x.id !== p.id));
    } catch {
      setErro("Não foi possível apagar o prédio. Tente de novo.");
    }
  }

  async function removerManutencao(m: Manutencao) {
    setErro("");
    try {
      await manutCol.remover(m.id);
      setManutencoes((prev) => prev.filter((x) => x.id !== m.id));
    } catch {
      setErro("Não foi possível apagar a manutenção. Tente de novo.");
    }
  }

  async function mudarPeriodicidade(m: Manutencao, p: Periodicidade) {
    setErro("");
    setAviso("");
    if (p === m.periodicidade) return;
    try {
      const n = await manutCol.atualizar(m.id, { periodicidade: p });
      setManutencoes((prev) => prev.map((x) => (x.id === n.id ? n : x)));
      setAviso(
        `${m.item} agora é ${periodicidades[p].rotulo.toLowerCase()}. A próxima data não mudou; ajuste se precisar.`,
      );
    } catch {
      setErro("Não foi possível alterar a periodicidade. Tente de novo.");
    }
  }

  async function definirOrcamento(m: Manutencao, situacao: SituacaoOrcamento) {
    setErro("");
    setAviso("");
    try {
      const desde = situacao === "aguardando" ? hojeISO() : (m.orcamento?.desde ?? hojeISO());
      const n = await manutCol.atualizar(m.id, { orcamento: { situacao, desde } });
      setManutencoes((prev) => prev.map((x) => (x.id === n.id ? n : x)));
      setAviso(
        situacao === "aguardando"
          ? `Orçamento de ${m.item} marcado como aguardando resposta.`
          : "Resposta registrada. O orçamento saiu da lista de espera.",
      );
    } catch {
      setErro("Não foi possível atualizar o orçamento. Tente de novo.");
    }
  }

  async function concluir(m: Manutencao, nota: string, data: string) {
    setErro("");
    try {
      const reg = { data, nota: nota.trim() || undefined };
      const dias = periodicidades[m.periodicidade].dias;
      const proxima = somarDias(data, dias);
      const n = await manutCol.atualizar(m.id, {
        proxima,
        historico: [reg, ...m.historico],
      });
      setManutencoes((prev) => prev.map((x) => (x.id === n.id ? n : x)));
      setConcluindo(null);
      setAviso(`${m.item} concluída em ${formatarData(data)}. Próxima execução marcada para ${formatarData(proxima)}.`);
    } catch {
      setErro("Não foi possível concluir. Tente de novo.");
    }
  }

  async function gerarPlano(p: Predio) {
    setErro("");
    setAviso("");
    try {
      const existentes = manutencoes.filter((m) => m.predio_id === p.id).map((m) => m.item);
      const novos = planoPadrao(p).filter((c) => !existentes.includes(c.item));
      if (novos.length === 0) {
        setAviso(`${p.nome} já tem o plano padrão completo para os sistemas marcados.`);
        return;
      }
      const criados: Manutencao[] = [];
      for (const c of novos) criados.push(await manutCol.criar(c));
      setManutencoes((prev) => [...criados, ...prev]);
      setAviso(`${criados.length} manutenções adicionadas ao plano de ${p.nome}. Confira as datas.`);
    } catch {
      setErro("Não foi possível gerar o plano. Tente de novo.");
    }
  }

  async function apagarExemplos() {
    setErro("");
    try {
      for (const m of manutencoes.filter((x) => x.exemplo)) await manutCol.remover(m.id);
      for (const p of predios.filter((x) => x.exemplo)) await predioCol.remover(p.id);
      setManutencoes((prev) => prev.filter((x) => !x.exemplo));
      setPredios((prev) => prev.filter((x) => !x.exemplo));
    } catch {
      setErro("Não foi possível apagar os exemplos. Tente de novo.");
    }
  }

  const temExemplos = predios.some((p) => p.exemplo) || manutencoes.some((m) => m.exemplo);

  const conteudo = carregando ? (
    <p className="text-sm text-neutral-400">Carregando seus prédios...</p>
  ) : erro && predios.length === 0 && manutencoes.length === 0 ? (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
      <p className="text-sm text-red-300">{erro}</p>
      <button onClick={() => { setCarregando(true); carregar(); }} className={btnSecundario}>
        <RefreshCw className="h-4 w-4" /> Tentar de novo
      </button>
    </div>
  ) : aba === "recursos" ? (
    <Recursos predios={predios} manutencoes={manutencoes} />
  ) : aba === "calendario" ? (
    <Calendario predios={predios} manutencoes={manutencoes} />
  ) : aba === "chamados" ? (
    <Chamados predios={predios} />
  ) : aba === "painel" ? (
    <Painel
      predios={predios}
      manutencoes={manutencoes}
      onConcluir={(m) => setConcluindo(m)}
      onNovoPredio={() => setModal({ tipo: "predio" })}
      onOrcamento={definirOrcamento}
      onIrParaSituacao={irParaSituacao}
      temExemplos={temExemplos}
      onApagarExemplos={apagarExemplos}
    />
  ) : aba === "manutencoes" ? (
    <Manutencoes
      predios={predios}
      manutencoes={manutencoes}
      filtro={filtroSit}
      onFiltro={setFiltroSit}
      onNova={() => setModal({ tipo: "manutencao" })}
      onEditar={(m) => setModal({ tipo: "manutencao", alvo: m })}
      onConcluir={(m) => setConcluindo(m)}
      onRemover={removerManutencao}
      onPeriodicidade={mudarPeriodicidade}
    />
  ) : (
    <Predios
      predios={predios}
      manutencoes={manutencoes}
      onNovo={() => setModal({ tipo: "predio" })}
      onEditar={(p) => setModal({ tipo: "predio", alvo: p })}
      onGerar={gerarPlano}
      onRemover={removerPredio}
      onMudou={carregar}
    />
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-neutral-800 bg-neutral-900 p-4 lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-300 text-neutral-950">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Manutenções</p>
            <p className="text-xs text-neutral-400">Plano predial</p>
          </div>
        </div>
        <nav className="space-y-1">
          {abas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm ${aba === a.id ? "bg-lime-300/15 text-lime-300" : "text-neutral-300 hover:bg-neutral-800"}`}
            >
              <a.icone className="h-5 w-5" /> {a.nome}
            </button>
          ))}
        </nav>
        <button
          onClick={onSair}
          className="mt-auto flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-neutral-400 hover:bg-neutral-800"
        >
          <LogOut className="h-5 w-5" /> Sair
        </button>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-neutral-800 bg-neutral-950/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <Wrench className="h-5 w-5 text-lime-300" />
            <span className="font-semibold">Manutenções</span>
          </div>
          <h1 className="hidden text-lg font-semibold lg:block">
            {abas.find((a) => a.id === aba)?.nome}
          </h1>
          <div className="flex items-center gap-2">
            {(aba === "painel" || aba === "manutencoes" || aba === "predios") && (
              <button
                onClick={() => setModal(aba === "predios" ? { tipo: "predio" } : { tipo: "manutencao" })}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-lime-300 px-4 text-sm font-semibold text-neutral-950 hover:bg-lime-200"
              >
                <Plus className="h-4 w-4" /> {aba === "predios" ? "Novo prédio" : "Nova manutenção"}
              </button>
            )}
            <button
              onClick={onSair}
              aria-label="Sair"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 lg:hidden"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="px-4 pb-28 pt-5 lg:px-8 lg:pb-10">
          {aviso && <p className="mb-4 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{aviso}</p>}
          {erro && predios.length + manutencoes.length > 0 && <p className="mb-4 text-sm text-red-400">{erro}</p>}
          {conteudo}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-neutral-800 bg-neutral-900 lg:hidden">
        {abas.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] leading-tight ${aba === a.id ? "text-lime-300" : "text-neutral-400"}`}
          >
            <a.icone className="h-5 w-5" />
            {a.nome}
          </button>
        ))}
      </nav>

      {modal?.tipo === "predio" && (
        <FormPredio
          inicial={modal.alvo}
          onSalvar={(c) => salvarPredio(c, modal.alvo?.id)}
          onFechar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "manutencao" && (
        <FormManutencao
          inicial={modal.alvo}
          predios={predios}
          onSalvar={(c) => salvarManutencao(c, modal.alvo?.id)}
          onFechar={() => setModal(null)}
        />
      )}
      {concluindo && (
        <ConcluirDialog
          m={concluindo}
          predioNome={predioNome(concluindo.predio_id)}
          onConfirmar={(nota, data) => concluir(concluindo, nota, data)}
          onFechar={() => setConcluindo(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  // undefined: ainda conferindo se já há alguém logado neste navegador.
  const [usuario, setUsuario] = useState<string | null | undefined>(auth.local ? null : undefined);

  useEffect(() => {
    if (!auth.local) auth.usuarioAtual().then(setUsuario, () => setUsuario(null));
  }, []);

  async function sair() {
    await auth.sair();
    setUsuario(null);
  }

  if (usuario === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-sm text-neutral-400">Abrindo...</div>
    );
  }
  if (usuario === null) return <AcessoEquipe onEntrar={(email) => setUsuario(email)} />;
  return <Sistema onSair={sair} />;
}
