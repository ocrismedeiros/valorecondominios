import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Situacao } from "./tipos";

export function hojeISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function somarDias(data: string, n: number): string {
  return format(addDays(parseISO(data), n), "yyyy-MM-dd");
}

export function diasAte(data: string): number {
  return differenceInCalendarDays(parseISO(data), new Date());
}

export function situacaoDe(proxima: string, antecedencia: number): Situacao {
  const d = diasAte(proxima);
  if (d < 0) return "atrasada";
  if (d <= antecedencia) return "a_vencer";
  return "em_dia";
}

export function formatarData(data: string): string {
  return format(parseISO(data), "dd/MM/yyyy", { locale: ptBR });
}

export function textoPrazo(proxima: string): string {
  const d = diasAte(proxima);
  if (d < 0) {
    const n = Math.abs(d);
    return `Atrasada há ${n} ${n === 1 ? "dia" : "dias"}`;
  }
  if (d === 0) return "Vence hoje";
  if (d === 1) return "Vence amanhã";
  return `Faltam ${d} dias`;
}
