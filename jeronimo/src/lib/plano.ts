import { hojeISO, somarDias } from "./datas";
import { modelo, periodicidades, type CampoManutencao, type Predio } from "./tipos";

// Monta o plano só com as manutenções que o prédio realmente tem.
export function planoPadrao(predio: Predio): CampoManutencao[] {
  const recursos = predio.recursos ?? [];
  return modelo
    .filter((m) => !m.recurso || recursos.includes(m.recurso))
    .map((m) => ({
      predio_id: predio.id,
      item: m.item,
      periodicidade: m.periodicidade,
      proxima: somarDias(hojeISO(), periodicidades[m.periodicidade].dias),
      historico: [],
    }));
}
