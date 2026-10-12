// Substituto do módulo "nucleo" do Builder do Núcleo de I.A.
// Mantém a mesma interface: db.colecao<T>("nome").listar / criar / atualizar / remover.
//
// Se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estiverem definidas, usa o Supabase
// (tabela "registros", ver supabase/schema.sql). Senão, salva no localStorage do navegador.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Base = { id: string; criado_em: string; atualizado_em: string };
type Campos<T> = Omit<T, keyof Base>;

export type Colecao<T extends Base> = {
  listar: () => Promise<T[]>;
  criar: (dados: Campos<T>) => Promise<T>;
  atualizar: (id: string, dados: Partial<Campos<T>>) => Promise<T>;
  remover: (id: string) => Promise<void>;
};

// JSON.stringify descarta chaves undefined: atualizar com { campo: undefined } apaga o campo.
function limpar<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function novoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---------- localStorage ----------

function colecaoLocal<T extends Base>(nome: string): Colecao<T> {
  const chave = `nucleo:${nome}`;

  const ler = (): T[] => {
    try {
      return JSON.parse(localStorage.getItem(chave) ?? "[]") as T[];
    } catch {
      return [];
    }
  };
  const gravar = (lista: T[]) => localStorage.setItem(chave, JSON.stringify(lista));

  return {
    async listar() {
      return ler().sort((a, b) => b.criado_em.localeCompare(a.criado_em));
    },
    async criar(dados) {
      const agora = new Date().toISOString();
      const reg = limpar({ ...dados, id: novoId(), criado_em: agora, atualizado_em: agora } as T);
      gravar([...ler(), reg]);
      return reg;
    },
    async atualizar(id, dados) {
      const lista = ler();
      const i = lista.findIndex((x) => x.id === id);
      if (i < 0) throw new Error(`Registro ${id} não encontrado em ${nome}.`);
      const reg = limpar({ ...lista[i], ...dados, id, atualizado_em: new Date().toISOString() } as T);
      lista[i] = reg;
      gravar(lista);
      return reg;
    },
    async remover(id) {
      gravar(ler().filter((x) => x.id !== id));
    },
  };
}

// ---------- Supabase ----------

type Linha = { id: string; colecao: string; dados: Record<string, unknown>; criado_em: string; atualizado_em: string };

function deLinha<T>(l: Linha): T {
  return { ...l.dados, id: l.id, criado_em: l.criado_em, atualizado_em: l.atualizado_em } as T;
}

function colecaoSupabase<T extends Base>(sb: SupabaseClient, nome: string): Colecao<T> {
  const tabela = () => sb.from("registros");

  return {
    async listar() {
      const { data, error } = await tabela().select("*").eq("colecao", nome).order("criado_em", { ascending: false });
      if (error) throw error;
      return (data as Linha[]).map((l) => deLinha<T>(l));
    },
    async criar(dados) {
      const { data, error } = await tabela().insert({ colecao: nome, dados: limpar(dados) }).select().single();
      if (error) throw error;
      return deLinha<T>(data as Linha);
    },
    async atualizar(id, dados) {
      const atual = await tabela().select("dados").eq("id", id).eq("colecao", nome).single();
      if (atual.error) throw atual.error;
      const mesclado = limpar({ ...(atual.data as { dados: object }).dados, ...dados });
      const { data, error } = await tabela()
        .update({ dados: mesclado, atualizado_em: new Date().toISOString() })
        .eq("id", id)
        .eq("colecao", nome)
        .select()
        .single();
      if (error) throw error;
      return deLinha<T>(data as Linha);
    },
    async remover(id) {
      const { error } = await tabela().delete().eq("id", id).eq("colecao", nome);
      if (error) throw error;
    },
  };
}

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase = url && chave ? createClient(url, chave) : null;

export const db = {
  colecao<T extends Base>(nome: string): Colecao<T> {
    return supabase ? colecaoSupabase<T>(supabase, nome) : colecaoLocal<T>(nome);
  },
};
