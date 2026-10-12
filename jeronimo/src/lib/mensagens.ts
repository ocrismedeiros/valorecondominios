import { formatarData, textoPrazo } from "./datas";
import { periodicidades, type Manutencao, type Predio } from "./tipos";

export function linkWhatsApp(telefone: string, texto: string): string {
  let d = telefone.replace(/\D/g, "");
  if (!(d.length >= 12 && d.startsWith("55"))) d = "55" + d;
  return `https://wa.me/${d}?text=${encodeURIComponent(texto)}`;
}

export function mensagemAlerta(m: Manutencao, p: Predio): string {
  return [
    "Olá! Aviso de manutenção programada.",
    `Prédio: ${p.nome}`,
    `Item: ${m.item} (${periodicidades[m.periodicidade].rotulo})`,
    `Data prevista: ${formatarData(m.proxima)} - ${textoPrazo(m.proxima)}`,
    "",
    "Para essa manutenção, podemos buscar o orçamento por aqui, para não sobrecarregar a administração. Se preferir, o senhor também pode buscar o orçamento por conta própria.",
    "Responda esta mensagem dizendo qual opção prefere: buscamos o orçamento ou o senhor busca.",
    "",
    "Por favor, confirme a execução e envie a evidência.",
  ].join("\n");
}
