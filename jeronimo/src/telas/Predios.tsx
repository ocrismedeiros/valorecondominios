import { useState } from "react";
import { Building, FileText, ListChecks, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { situacaoDe } from "../lib/datas";
import type { Manutencao, Predio } from "../lib/tipos";
import { Relatorio } from "../components/Relatorio";
import { ImportarPlanilha } from "../components/ImportarPlanilha";
import { btnPerigo, btnPrimario, btnSecundario } from "../components/estilos";
import { PlanoGeral } from "./PlanoGeral";

type Props = {
  predios: Predio[];
  manutencoes: Manutencao[];
  onNovo: () => void;
  onEditar: (p: Predio) => void;
  onGerar: (p: Predio) => void;
  onRemover: (p: Predio) => void;
  onMudou: () => Promise<void>;
};

export function Predios({ predios, manutencoes, onNovo, onEditar, onGerar, onRemover, onMudou }: Props) {
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [relatorioDe, setRelatorioDe] = useState<Predio | null>(null);
  const [importando, setImportando] = useState(false);

  const modalImportar = importando && (
    <ImportarPlanilha
      predios={predios}
      manutencoes={manutencoes}
      onFechar={() => setImportando(false)}
      onConcluido={onMudou}
    />
  );

  if (predios.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-neutral-700 p-10 text-center">
          <Building className="h-10 w-10 text-lime-300" />
          <div>
            <p className="font-semibold">Nenhum prédio cadastrado</p>
            <p className="mt-1 text-sm text-neutral-400">Cadastre o prédio e gere o plano de manutenções pelas periodicidades recomendadas, ou importe a sua planilha.</p>
          </div>
          <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row">
            <button onClick={onNovo} className={btnPrimario}>
              <Plus className="h-4 w-4" /> Cadastrar prédio
            </button>
            <button onClick={() => setImportando(true)} className={btnSecundario}>
              <Upload className="h-4 w-4" /> Importar planilha
            </button>
          </div>
        </div>
        {modalImportar}
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-lime-300/30 bg-lime-300/5 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-semibold">Importar sua planilha de manutenções</p>
          <p className="text-sm text-neutral-400">Cole as células do Excel ou do Google Sheets. Os prédios e as datas entram de uma vez.</p>
        </div>
        <button onClick={() => setImportando(true)} className={btnPrimario}>
          <Upload className="h-4 w-4" /> Importar planilha
        </button>
      </div>

      <PlanoGeral predios={predios} manutencoes={manutencoes} onMudou={onMudou} />

      <h2 className="mb-3 font-semibold">Prédios cadastrados</h2>
      <div className="grid gap-3 lg:grid-cols-2">
        {predios.map((p) => {
          const ms = manutencoes.filter((m) => m.predio_id === p.id);
          const atrasadas = ms.filter((m) => situacaoDe(m.proxima, p.antecedencia_dias) === "atrasada").length;
          return (
            <article key={p.id} className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
              <div>
                <p className="font-semibold">{p.nome}</p>
                {p.endereco && <p className="text-sm text-neutral-400">{p.endereco}</p>}
              </div>
              <p className="text-sm text-neutral-300">
                Síndico: {p.sindico || "não informado"} · Avisa com {p.antecedencia_dias} dias de antecedência
              </p>
              <p className="text-sm text-neutral-400">
                {ms.length} {ms.length === 1 ? "manutenção" : "manutenções"} no plano · {atrasadas} atrasada{atrasadas === 1 ? "" : "s"}
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => onGerar(p)} className={btnSecundario}>
                  <ListChecks className="h-4 w-4" /> Gerar plano padrão
                </button>
                <button onClick={() => setRelatorioDe(p)} className={btnSecundario}>
                  <FileText className="h-4 w-4" /> Relatório
                </button>
                <button onClick={() => onEditar(p)} className={btnSecundario}>
                  <Pencil className="h-4 w-4" /> Editar
                </button>
                {confirmando === p.id ? (
                  <>
                    <button onClick={() => { setConfirmando(null); onRemover(p); }} className="h-11 rounded-lg bg-red-500/20 px-3 text-sm font-medium text-red-300">
                      Apagar prédio e plano
                    </button>
                    <button onClick={() => setConfirmando(null)} className="h-11 rounded-lg px-3 text-sm text-neutral-300">Cancelar</button>
                  </>
                ) : (
                  <button onClick={() => setConfirmando(p.id)} className={btnPerigo}>
                    <Trash2 className="h-4 w-4" /> Apagar
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {relatorioDe && (
        <Relatorio predio={relatorioDe} manutencoes={manutencoes} onFechar={() => setRelatorioDe(null)} />
      )}
      {modalImportar}
    </>
  );
}
