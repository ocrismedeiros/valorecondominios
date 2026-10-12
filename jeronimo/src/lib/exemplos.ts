import { hojeISO, somarDias } from "./datas";
import { modelo, type CampoManutencao, type CampoPredio } from "./tipos";

export const predioExemplo: CampoPredio = {
  nome: "Edifício Sol Nascente",
  endereco: "Rua das Acácias, 120",
  sindico: "Sr. Antônio",
  contato: "11912345678",
  antecedencia_dias: 30,
  recursos: ["elevador", "gerador", "hidrantes", "portao", "ar_condicionado"],
  exemplo: true,
};

const deslocamentos = [200, -4, 40, 5, 20];

export function itensExemplo(predioId: string): CampoManutencao[] {
  const recursos = predioExemplo.recursos ?? [];
  return modelo
    .filter((m) => !m.recurso || recursos.includes(m.recurso))
    .map((m, i) => ({
      predio_id: predioId,
      item: m.item,
      periodicidade: m.periodicidade,
      proxima: somarDias(hojeISO(), deslocamentos[i] ?? 30),
      historico: [],
      exemplo: true,
    }));
}
