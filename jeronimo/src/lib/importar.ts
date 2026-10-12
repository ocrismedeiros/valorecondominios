import { somarDias, hojeISO } from "./datas";
import { modelo, type Periodicidade } from "./tipos";

export type ItemImport = {
  item: string;
  periodicidade: Periodicidade;
  proxima: string; // vazio quando a célula tem erro
  faltando: boolean; // célula vazia: o item não foi feito ou não existe
  erro?: string;
};

export type LinhaImport = { predio: string; itens: ItemImport[] };

export type ResultadoLeitura = { erro?: string; linhas: LinhaImport[] };

function separadorDe(linha: string): string {
  if (linha.includes("\t")) return "\t";
  if (linha.includes(";")) return ";";
  return ",";
}

// Aceita dd/mm/aaaa, dd/mm/aa ou aaaa-mm-dd. Devolve aaaa-mm-dd ou undefined.
export function dataBR(texto: string): string | undefined {
  const t = texto.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!m) return undefined;
  const dia = Number(m[1]);
  const mes = Number(m[2]);
  let ano = Number(m[3]);
  if (ano < 100) ano += 2000;
  const d = new Date(ano, mes - 1, dia);
  if (d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia) return undefined;
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

// Usa a periodicidade do plano padrão quando o nome do item for igual; senão, anual.
function periodicidadeDe(item: string): Periodicidade {
  const n = item.trim().toLowerCase();
  return modelo.find((m) => m.item.toLowerCase() === n)?.periodicidade ?? "anual";
}

// Formato esperado: primeira linha com os nomes das manutenções (a partir da 2ª coluna),
// e nas linhas seguintes o nome do prédio na 1ª coluna e a data da próxima execução nas demais.
export function lerPlanilha(texto: string): ResultadoLeitura {
  const linhas = texto.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (linhas.length < 2) {
    return { erro: "Cole a planilha com a linha de títulos e pelo menos um prédio.", linhas: [] };
  }
  const sep = separadorDe(linhas[0]);
  const colunas = linhas[0]
    .split(sep)
    .slice(1)
    .map((nome, i) => ({ nome: nome.trim(), idx: i + 1 }))
    .filter((c) => c.nome !== "");
  if (colunas.length === 0) {
    return { erro: "Não encontrei nenhuma manutenção nos títulos das colunas.", linhas: [] };
  }

  const ontem = somarDias(hojeISO(), -1);
  const resultado: LinhaImport[] = [];

  for (const l of linhas.slice(1)) {
    const celulas = l.split(sep);
    const predio = (celulas[0] ?? "").trim();
    if (!predio) continue;
    const itens = colunas.map((c): ItemImport => {
      const bruto = (celulas[c.idx] ?? "").trim();
      const periodicidade = periodicidadeDe(c.nome);
      if (!bruto) return { item: c.nome, periodicidade, proxima: ontem, faltando: true };
      const data = dataBR(bruto);
      if (!data) {
        return { item: c.nome, periodicidade, proxima: "", faltando: false, erro: `Data inválida: "${bruto}"` };
      }
      return { item: c.nome, periodicidade, proxima: data, faltando: false };
    });
    resultado.push({ predio, itens });
  }

  if (resultado.length === 0) {
    return { erro: "Não encontrei nenhum prédio nas linhas abaixo dos títulos.", linhas: [] };
  }
  return { linhas: resultado };
}
