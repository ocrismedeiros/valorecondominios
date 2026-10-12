import { useState } from "react";
import { formatarData, hojeISO, somarDias } from "../lib/datas";
import { periodicidades, type Manutencao } from "../lib/tipos";
import { Modal } from "./Modal";
import { Campo } from "./Campo";
import { btnPrimario, btnSecundario, input } from "./estilos";

type Props = {
  m: Manutencao;
  predioNome: string;
  onConfirmar: (nota: string, data: string) => Promise<void>;
  onFechar: () => void;
};

export function ConcluirDialog({ m, predioNome, onConfirmar, onFechar }: Props) {
  const [nota, setNota] = useState("");
  const [data, setData] = useState(hojeISO());
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const hoje = hojeISO();
  const dias = periodicidades[m.periodicidade].dias;
  const proxima = data ? somarDias(data, dias) : "";

  async function confirmar() {
    if (!data) {
      setErro("Informe a data em que a manutenção foi feita.");
      return;
    }
    if (data > hoje) {
      setErro("A data não pode ser depois de hoje.");
      return;
    }
    setErro("");
    setSalvando(true);
    try {
      await onConfirmar(nota, data);
    } catch {
      setErro("Não foi possível concluir. Tente de novo.");
      setSalvando(false);
    }
  }

  return (
    <Modal titulo="Concluir manutenção" onFechar={onFechar}>
      <div className="space-y-4">
        <div>
          <p className="font-medium">{m.item}</p>
          <p className="text-sm text-neutral-400">{predioNome}</p>
        </div>
        <Campo rotulo="Data em que foi feita" erro={erro}>
          <input
            type="date"
            max={hoje}
            className={input}
            value={data}
            onChange={(e) => {
              setData(e.target.value);
              setErro("");
            }}
          />
        </Campo>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-neutral-300">O que foi feito (opcional)</span>
          <textarea
            rows={3}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Ex.: 12 extintores recarregados, etiquetas trocadas"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-lime-400"
          />
        </label>
        <p className="rounded-lg bg-neutral-800/60 p-3 text-sm text-neutral-300">
          {proxima
            ? `Próxima execução: ${formatarData(proxima)}, contada a partir da data feita, pela periodicidade ${periodicidades[m.periodicidade].rotulo.toLowerCase()}.`
            : "Informe a data feita para calcular a próxima execução."}
        </p>
        <div className="flex flex-col-reverse gap-2 pt-2 lg:flex-row lg:justify-end">
          <button type="button" onClick={onFechar} className={btnSecundario}>Cancelar</button>
          <button type="button" onClick={confirmar} disabled={salvando} className={btnPrimario}>
            {salvando ? "Salvando..." : "Confirmar execução"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
