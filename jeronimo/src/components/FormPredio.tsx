import { useState, type FormEvent } from "react";
import { recursos as rotulosRecursos, type CampoPredio, type Predio, type Recurso } from "../lib/tipos";
import { Modal } from "./Modal";
import { Campo } from "./Campo";
import { btnPrimario, btnSecundario, input } from "./estilos";

type Props = {
  inicial?: Predio;
  onSalvar: (c: CampoPredio) => Promise<void>;
  onFechar: () => void;
};

const listaRecursos = Object.keys(rotulosRecursos) as Recurso[];

export function FormPredio({ inicial, onSalvar, onFechar }: Props) {
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [endereco, setEndereco] = useState(inicial?.endereco ?? "");
  const [sindico, setSindico] = useState(inicial?.sindico ?? "");
  const [contato, setContato] = useState(inicial?.contato ?? "");
  const [antecedencia, setAntecedencia] = useState(String(inicial?.antecedencia_dias ?? 30));
  const [selecionados, setSelecionados] = useState<Recurso[]>(inicial?.recursos ?? []);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");

  function alternar(r: Recurso) {
    setSelecionados((s) => (s.includes(r) ? s.filter((x) => x !== r) : [...s, r]));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    const dias = Number(antecedencia);
    if (!nome.trim()) er.nome = "Informe o nome do prédio.";
    if (!Number.isInteger(dias) || dias < 1 || dias > 90) er.antecedencia = "Use um número de 1 a 90 dias.";
    if (contato.trim() && contato.replace(/\D/g, "").length < 10) er.contato = "Use DDD + número, por exemplo 11 91234-5678.";
    setErros(er);
    if (Object.keys(er).length > 0) return;
    setSalvando(true);
    setErroGeral("");
    try {
      await onSalvar({
        nome: nome.trim(),
        endereco: endereco.trim() || undefined,
        sindico: sindico.trim() || undefined,
        contato: contato.trim() || undefined,
        antecedencia_dias: dias,
        recursos: listaRecursos.filter((r) => selecionados.includes(r)),
        exemplo: inicial?.exemplo,
      });
    } catch {
      setErroGeral("Não foi possível salvar. Tente de novo.");
      setSalvando(false);
    }
  }

  return (
    <Modal titulo={inicial ? "Editar prédio" : "Novo prédio"} onFechar={onFechar}>
      <form onSubmit={enviar} noValidate className="space-y-4">
        <Campo rotulo="Nome do prédio" erro={erros.nome}>
          <input className={input} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Edifício Sol Nascente" />
        </Campo>
        <Campo rotulo="Endereço (opcional)">
          <input className={input} value={endereco} onChange={(e) => setEndereco(e.target.value)} />
        </Campo>
        <Campo rotulo="Síndico (opcional)">
          <input className={input} value={sindico} onChange={(e) => setSindico(e.target.value)} />
        </Campo>
        <Campo rotulo="WhatsApp do síndico ou da zeladoria (opcional)" erro={erros.contato}>
          <input type="tel" inputMode="tel" className={input} value={contato} onChange={(e) => setContato(e.target.value)} placeholder="11 91234-5678" />
        </Campo>
        <Campo rotulo="Avisar quantos dias antes do vencimento" erro={erros.antecedencia}>
          <input type="number" inputMode="numeric" min={1} max={90} className={input} value={antecedencia} onChange={(e) => setAntecedencia(e.target.value)} />
        </Campo>

        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium text-neutral-300">O que este prédio tem</legend>
          <p className="mb-2 text-xs text-neutral-500">Só as manutenções desses sistemas entram no plano padrão.</p>
          <div className="grid gap-1 lg:grid-cols-2">
            {listaRecursos.map((r) => (
              <label key={r} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-neutral-800">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-lime-300"
                  checked={selecionados.includes(r)}
                  onChange={() => alternar(r)}
                />
                <span className="text-sm text-neutral-200">{rotulosRecursos[r]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {erroGeral && <p className="text-sm text-red-400">{erroGeral}</p>}
        <div className="flex flex-col-reverse gap-2 pt-2 lg:flex-row lg:justify-end">
          <button type="button" onClick={onFechar} className={btnSecundario}>Cancelar</button>
          <button type="submit" disabled={salvando} className={btnPrimario}>{salvando ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </Modal>
  );
}
