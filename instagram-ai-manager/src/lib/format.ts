import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDateShort(iso: string | null): string {
  if (!iso) return "—";
  return format(new Date(iso), "dd MMM, HH:mm", { locale: ptBR });
}

export function formatDateLong(iso: string | null): string {
  if (!iso) return "—";
  return format(new Date(iso), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
}

export function formatDay(iso: string): string {
  return format(new Date(iso), "dd/MM", { locale: ptBR });
}
