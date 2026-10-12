import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { db } from "../nucleo";
import { formatarData } from "../lib/datas";
import { lerPlanilha, type LinhaImport } from "../lib/importar";
import { periodicidades, type Manutencao, type Predio } from "../lib/tipos";
import { Modal } from "./Modal";
import { btnPrimario, btnSecundario } from "./estilos";

const predioCol = db.colecao<Predio>("predios");
const manutCol = db.colecao<Manutencao>("manutencoes");

type Props = {
  predios: Predio[];
  manutencoes: Manutencao[];
  onFechar: () => void;
  onConcluido: () => Promise<void>;
};

export function ImportarPlanilha({ predios, manutencoes, onFechar, onConcluido }: Props) {
  const [texto, setTexto] = useState("");
  const [linhas, setLinhas] = useState<LinhaImport[] | null>(null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [progresso, setProgresso] = useState("");
  const [resultado, setResultado] = useState("");
  const [falhas, setFalhas] = useState<string[]>([]);

  function verPrevia() {
    const r = lerPlanilha(texto);
    setResultado("");
    setFalhas([]);
    if (r.erro) {
      setErro(r.erro);
      setLinhas(null);
      return;
    }
    setErro("");
    setLinhas(r.linhas);
  }

  const itensValidos = linhas?.reduce((s, l) => s + l.itens.filter((i) => !i.erro).length, 0) ?? 0;
  const errosDeData = linhas?.reduce((s, l) => s + l.itens.filter((i) => i.erro).length, 0) ?? 0;
  const faltando = linhas?.reduce((s, l) => s + l.itens.filter((i) => i.faltando).length, 0) ?? 0;

  async function importar() {
    if (!linhas || salvando) return;
    setSalvando(true);
    setErro("");
    setResultado("");
    setFalhas([]);
    let criados = 0;
    let atualizados = 0;
    const erros: string[] = [];
    const ps = [...predios];
    const ms = [...manutencoes];

    for (let i = 0; i < linhas.length; i++) {
      const l = linhas[i];
      setProgresso(`Importando ${i + 1} de ${linhas.length}: ${l.predio}`);
      let predioId: string | undefined;
      try {
        let predio = ps.find((p) => p.nome.toLowerCase() === l.predio.toLowerCase());
        if (!predio) {
          predio = await predioCol.criar({ nome: l.predio, antecedencia_dias: 30 });
          ps.push(predio);
        }
        predioId = predio.id;
      } catch {
        erros.push(`Prédio ${l.predio} não foi salvo`);
        continue;
      }

      for (const it of l.itens) {
        if (it.erro) continue;
        try {
          const ex = ms.find((m) => m.predio_id === predioId && m.item === it.item);
          if (ex) {
            if (it.faltando) continue;
            const n = await manutCol.atualizar(ex.id, { proxima: it.proxima });
            ms[ms.indexOf(ex)] = n;
            atualizados += 1;
          } else {
            const n = await manutCol.criar({
              predio_id: predioId,
              item: it.item,
              periodicidade: it.periodicidade,
              proxima: it.proxima,
              historico: [],
            });
            ms.push(n);
            criados += 1;
          }
        } catch {
          erros.push(`${l.predio}: ${it.item}`);
        }
      }
    }

    setProgresso("");
    setSalvando(false);
    setFalhas(erros);
    setResultado(
      `Importação concluída: ${criados} manutenções criadas e ${atualizados} atualizadas.${
        faltando > 0 ? ` ${faltando} faltando aparecem como atrasadas no Painel.` : ""
      }`,
    );
    await onConcluido();
  }

  return (
    <Modal titulo="Importar planilha" onFechar={onFechar}>
      <div className="space-y-4">
        <div className="space-y-2 text-sm text-neutral-300">
          <p>Copie a planilha inteira do Excel ou do Google Sheets e cole abaixo, de uma vez. Use este formato:</p>
          <ul className="list-disc space-y-1 pl-5 text-neutral-400">
            <li>Primeira linha: na primeira coluna, qualquer título; nas demais, o nome de cada manutenção.</li>
            <li>Demais linhas: o nome do prédio na primeira coluna e, em cada manutenção, a data da próxima execução (dd/mm/aaaa).</li>
            <li>Célula vazia: a manutenção está faltando e vai aparecer como atrasada.</li>
          </ul>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-neutral-300">Cole a planilha aqui</span>
          <textarea
            rows={6}
            value={texto}
            disabled={salvando}
            onChange={(e) => {
              setTexto(e.target.value);
              setLinhas(null);
              setResultado("");
              setFalhas([]);
            }}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-xs text-neutral-100 outline-none focus:border-lime-400"
          />
        </label>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        {!linhas && (
          <button type="button" onClick={verPrevia} disabled={!texto.trim()} className={btnSecundario}>
            Ver prévia
          </button>
        )}

        {linhas && !resultado && (
          <div className="space-y-3">
            <p className="text-sm text-neutral-300">
              {linhas.length} {linhas.length === 1 ? "prédio" : "prédios"} · {itensValidos} manutenções ·{" "}
              {faltando} faltando{errosDeData > 0 ? ` · ${errosDeData} com data inválida` : ""}
            </p>
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {linhas.map((l) => {
                const existe = predios.some((p) => p.nome.toLowerCase() === l.predio.toLowerCase());
                return (
                  <div key={l.predio} className="rounded-lg border border-neutral-800 p-3">
                    <p className="font-medium">
                      {l.predio}{" "}
                      <span className="text-xs font-normal text-neutral-400">{existe ? "já cadastrado, datas atualizadas" : "novo prédio"}</span>
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {l.itens.map((it) => (
                        <li key={it.item} className="flex items-start justify-between gap-3">
                          <span className="text-neutral-300">
                            {it.item} <span className="text-xs text-neutral-500">· {periodicidades[it.periodicidade].rotulo}</span>
                          </span>
                          {it.erro ? (
                            <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-red-400">
                              <AlertTriangle className="h-3.5 w-3.5" /> {it.erro}
                            </span>
                          ) : it.faltando ? (
                            <span className="whitespace-nowrap text-xs text-red-300">Faltando</span>
                          ) : (
                            <span className="whitespace-nowrap text-xs text-neutral-300">{formatarData(it.proxima)}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            {errosDeData > 0 && (
              <p className="text-xs text-amber-300">Os itens com data inválida serão pulados. Corrija na planilha e veja a prévia de novo.</p>
            )}
          </div>
        )}

        {salvando && progresso && <p className="text-sm text-lime-300">{progresso}</p>}

        {resultado && (
          <p className="flex items-start gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {resultado}
          </p>
        )}

        {falhas.length > 0 && (
          <div className="space-y-1 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
            <p className="font-medium">{falhas.length} {falhas.length === 1 ? "item não foi salvo" : "itens não foram salvos"}. Tente importar de novo só esta parte:</p>
            <ul className="list-disc pl-5 text-xs">
              {falhas.slice(0, 10).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            {falhas.length > 10 && <p className="text-xs">e mais {falhas.length - 10}</p>}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 lg:flex-row lg:justify-end">
          <button type="button" onClick={onFechar} disabled={salvando} className={btnSecundario}>Fechar</button>
          {linhas && !resultado && (
            <button type="button" onClick={importar} disabled={salvando || itensValidos === 0} className={btnPrimario}>
              {salvando ? "Importando..." : `Importar tudo de uma vez (${itensValidos} manutenções)`}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
