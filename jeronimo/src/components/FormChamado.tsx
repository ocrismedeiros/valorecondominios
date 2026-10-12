import { useState, type FormEvent } from "react";
import { hojeISO } from "../lib/datas";
import type { CampoChamado, Predio } from "../lib/tipos";
import { Modal } from "./Modal";
import { Campo } from "./Campo";
import { btnPrimario, btnSecundario, input } from "./estilos";

type Props = {
  predios: Predio[];
  onSalvar: (c: CampoChamado) => Promise<void>;
  onFechar: () => void;
};

export function FormChamado({ predios, onSalvar, onFechar }: Props) {
  const [predioId, setPredioId] = useState(predios[0]?.id ?? "");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!predioId) er.predio = "Escolha o prédio.";
    if (!titulo.trim()) er.titulo = "Descreva o problema em poucas palavras.";
    setErros(er);
    if (Object.keys(er).length > 0) return;
    setSalvando(true);
    setErroGeral("");
    try {
      await onSalvar({
        predio_id: predioId,
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        status: "aberto",
        aberto_em: hojeISO(),
      });
    } catch {
      setErroGeral("Não foi possível salvar. Tente de novo.");
      setSalvando(false);
    }
  }

  return (
    <Modal titulo="Novo chamado" onFechar={onFechar}>
      <form onSubmit={enviar} noValidate className="space-y-4">
        {predios.length === 0 ? (
          <p className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-300">Cadastre um prédio antes de abrir chamados.</p>
        ) : (
          <Campo rotulo="Prédio" erro={erros.predio}>
            <select className={input} value={predioId} onChange={(e) => setPredioId(e.target.value)}>
              {predios.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </Campo>
        )}
        <Campo rotulo="Problema" erro={erros.titulo}>
          <input className={input} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Porta da garagem travando" />
        </Campo>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-neutral-300">Detalhes (opcional)</span>
          <textarea
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-lime-400"
          />
        </label>
        {erroGeral && <p className="text-sm text-red-400">{erroGeral}</p>}
        <div className="flex flex-col-reverse gap-2 pt-2 lg:flex-row lg:justify-end">
          <button type="button" onClick={onFechar} className={btnSecundario}>Cancelar</button>
          <button type="submit" disabled={salvando || predios.length === 0} className={btnPrimario}>
            {salvando ? "Salvando..." : "Abrir chamado"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
