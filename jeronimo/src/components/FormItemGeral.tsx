import { useState, type FormEvent } from "react";
import { periodicidades, type Periodicidade, type Predio } from "../lib/tipos";
import { Modal } from "./Modal";
import { Campo } from "./Campo";
import { btnPrimario, btnSecundario, input } from "./estilos";

export type DadosItemGeral = { item: string; periodicidade: Periodicidade; predioIds: string[] };

type Props = {
  inicial?: { item: string; periodicidade: Periodicidade; qtd: number };
  predios: Predio[];
  nomesExistentes: string[];
  onSalvar: (d: DadosItemGeral) => Promise<void>;
  onFechar: () => void;
};

export function FormItemGeral({ inicial, predios, nomesExistentes, onSalvar, onFechar }: Props) {
  const [item, setItem] = useState(inicial?.item ?? "");
  const [periodicidade, setPeriodicidade] = useState<Periodicidade>(inicial?.periodicidade ?? "anual");
  const [selecionados, setSelecionados] = useState<string[]>(predios.map((p) => p.id));
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");

  function alternar(id: string) {
    setSelecionados((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const nome = item.trim();
    const er: Record<string, string> = {};
    if (!nome) er.item = "Informe o nome, por exemplo Troca de filtros do ar-condicionado.";
    else if (nomesExistentes.some((n) => n.toLowerCase() === nome.toLowerCase() && n !== inicial?.item))
      er.item = "Já existe um item com esse nome. Edite o existente.";
    if (!inicial && selecionados.length === 0) er.predios = "Escolha pelo menos um prédio.";
    setErros(er);
    if (Object.keys(er).length > 0) return;
    setSalvando(true);
    setErroGeral("");
    try {
      await onSalvar({ item: nome, periodicidade, predioIds: selecionados });
    } catch {
      setErroGeral("Não foi possível salvar. Tente de novo.");
      setSalvando(false);
    }
  }

  return (
    <Modal titulo={inicial ? "Editar item em todos os prédios" : "Incluir item em vários prédios"} onFechar={onFechar}>
      <form onSubmit={enviar} noValidate className="space-y-4">
        <Campo rotulo="Item" erro={erros.item}>
          <input className={input} value={item} onChange={(e) => setItem(e.target.value)} placeholder="Ex.: Troca de filtros do ar-condicionado" />
        </Campo>
        <Campo rotulo="Periodicidade">
          <select className={input} value={periodicidade} onChange={(e) => setPeriodicidade(e.target.value as Periodicidade)}>
            {(Object.keys(periodicidades) as Periodicidade[]).map((p) => (
              <option key={p} value={p}>{periodicidades[p].rotulo}</option>
            ))}
          </select>
        </Campo>

        {inicial ? (
          <p className="rounded-lg bg-neutral-800/60 p-3 text-sm text-neutral-300">
            A mudança vale para os {inicial.qtd} prédios que já têm este item. As próximas datas não mudam.
          </p>
        ) : (
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium text-neutral-300">Em quais prédios incluir</legend>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSelecionados(predios.map((p) => p.id))} className="h-11 rounded-lg px-3 text-sm text-lime-300 hover:bg-neutral-800">
                Marcar todos
              </button>
              <button type="button" onClick={() => setSelecionados([])} className="h-11 rounded-lg px-3 text-sm text-neutral-300 hover:bg-neutral-800">
                Desmarcar todos
              </button>
            </div>
            <div className="max-h-56 space-y-1 overflow-y-auto">
              {predios.map((p) => (
                <label key={p.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-neutral-800">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-lime-300"
                    checked={selecionados.includes(p.id)}
                    onChange={() => alternar(p.id)}
                  />
                  <span className="text-sm text-neutral-200">{p.nome}</span>
                </label>
              ))}
            </div>
            {erros.predios && <p className="text-xs text-red-400">{erros.predios}</p>}
          </fieldset>
        )}

        {erroGeral && <p className="text-sm text-red-400">{erroGeral}</p>}
        <div className="flex flex-col-reverse gap-2 pt-2 lg:flex-row lg:justify-end">
          <button type="button" onClick={onFechar} className={btnSecundario}>Cancelar</button>
          <button type="submit" disabled={salvando} className={btnPrimario}>{salvando ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </Modal>
  );
}
