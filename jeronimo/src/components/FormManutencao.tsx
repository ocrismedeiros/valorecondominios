import { useState, type FormEvent } from "react";
import { periodicidades, type CampoManutencao, type Manutencao, type Periodicidade, type Predio } from "../lib/tipos";
import { Modal } from "./Modal";
import { Campo } from "./Campo";
import { btnPrimario, btnSecundario, input } from "./estilos";

type Props = {
  inicial?: Manutencao;
  predios: Predio[];
  onSalvar: (c: CampoManutencao) => Promise<void>;
  onFechar: () => void;
};

export function FormManutencao({ inicial, predios, onSalvar, onFechar }: Props) {
  const [predioId, setPredioId] = useState(inicial?.predio_id ?? predios[0]?.id ?? "");
  const [item, setItem] = useState(inicial?.item ?? "");
  const [periodicidade, setPeriodicidade] = useState<Periodicidade>(inicial?.periodicidade ?? "anual");
  const [proxima, setProxima] = useState(inicial?.proxima ?? "");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!predioId) er.predio = "Escolha o prédio.";
    if (!item.trim()) er.item = "Informe o item, por exemplo Recarga de extintores.";
    if (!proxima) er.proxima = "Informe a próxima data.";
    setErros(er);
    if (Object.keys(er).length > 0) return;
    setSalvando(true);
    setErroGeral("");
    try {
      await onSalvar({
        predio_id: predioId,
        item: item.trim(),
        periodicidade,
        proxima,
        historico: inicial?.historico ?? [],
        exemplo: inicial?.exemplo,
      });
    } catch {
      setErroGeral("Não foi possível salvar. Tente de novo.");
      setSalvando(false);
    }
  }

  return (
    <Modal titulo={inicial ? "Editar manutenção" : "Nova manutenção"} onFechar={onFechar}>
      <form onSubmit={enviar} noValidate className="space-y-4">
        {predios.length === 0 ? (
          <p className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-300">Cadastre um prédio antes de criar manutenções.</p>
        ) : (
          <Campo rotulo="Prédio" erro={erros.predio}>
            <select className={input} value={predioId} onChange={(e) => setPredioId(e.target.value)}>
              {predios.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </Campo>
        )}
        <Campo rotulo="O que precisa ser feito" erro={erros.item}>
          <input className={input} value={item} onChange={(e) => setItem(e.target.value)} placeholder="Ex.: Recarga de extintores" />
        </Campo>
        <div className="grid gap-4 lg:grid-cols-2">
          <Campo rotulo="Periodicidade">
            <select className={input} value={periodicidade} onChange={(e) => setPeriodicidade(e.target.value as Periodicidade)}>
              {(Object.keys(periodicidades) as Periodicidade[]).map((p) => (
                <option key={p} value={p}>{periodicidades[p].rotulo}</option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Próxima execução" erro={erros.proxima}>
            <input type="date" className={input} value={proxima} onChange={(e) => setProxima(e.target.value)} />
          </Campo>
        </div>
        {erroGeral && <p className="text-sm text-red-400">{erroGeral}</p>}
        <div className="flex flex-col-reverse gap-2 pt-2 lg:flex-row lg:justify-end">
          <button type="button" onClick={onFechar} className={btnSecundario}>Cancelar</button>
          <button type="submit" disabled={salvando || predios.length === 0} className={btnPrimario}>{salvando ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </Modal>
  );
}
