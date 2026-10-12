import { addDays, format, parseISO } from "date-fns";
import { hojeISO } from "./datas";
import { periodicidades, type Manutencao, type Periodicidade } from "./tipos";

export type StatusEvento = "concluida" | "pendente" | "vencida";

export type Evento = {
  data: string;
  item: string;
  predio: string;
  periodicidade: Periodicidade;
  status: StatusEvento;
  manutencaoId: string;
};

// Execuções do ano: as já registradas no histórico e as próximas, projetadas
// a partir da próxima data somando a periodicidade em dias.
export function eventosDoAno(ms: Manutencao[], ano: number, nomeDo: (predioId: string) => string): Evento[] {
  const inicio = new Date(ano, 0, 1);
  const fim = new Date(ano, 11, 31);
  const hoje = hojeISO();
  const eventos: Evento[] = [];

  for (const m of ms) {
    const dias = periodicidades[m.periodicidade].dias;
    const feitas = new Set(m.historico.map((r) => r.data));
    const base = { item: m.item, predio: nomeDo(m.predio_id), periodicidade: m.periodicidade, manutencaoId: m.id };

    for (const r of m.historico) {
      if (r.data.startsWith(String(ano))) eventos.push({ ...base, data: r.data, status: "concluida" });
    }

    let d = parseISO(m.proxima);
    while (d < inicio) d = addDays(d, dias);
    for (; d <= fim; d = addDays(d, dias)) {
      const iso = format(d, "yyyy-MM-dd");
      if (feitas.has(iso)) continue;
      eventos.push({ ...base, data: iso, status: iso < hoje ? "vencida" : "pendente" });
    }
  }

  return eventos.sort((a, b) => a.data.localeCompare(b.data));
}
