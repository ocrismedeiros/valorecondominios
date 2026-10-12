export type Periodicidade = "semanal" | "quinzenal" | "mensal" | "trimestral" | "semestral" | "anual" | "quinquenal";

export const periodicidades: Record<Periodicidade, { rotulo: string; dias: number }> = {
  semanal: { rotulo: "Semanal", dias: 7 },
  quinzenal: { rotulo: "Quinzenal", dias: 15 },
  mensal: { rotulo: "Mensal", dias: 30 },
  trimestral: { rotulo: "Trimestral", dias: 90 },
  semestral: { rotulo: "Semestral", dias: 180 },
  anual: { rotulo: "Anual", dias: 365 },
  quinquenal: { rotulo: "A cada 5 anos", dias: 1825 },
};

// Sistemas que podem existir em um prédio. Itens do modelo ligados a um recurso
// só entram no plano dos prédios que têm esse recurso marcado.
export type Recurso =
  | "elevador"
  | "piscina"
  | "playground"
  | "gerador"
  | "bombas"
  | "portao"
  | "hidrantes"
  | "spda"
  | "ar_condicionado"
  | "ventilacao"
  | "gas"
  | "seguranca_eletronica";

export const recursos: Record<Recurso, string> = {
  elevador: "Elevador",
  piscina: "Piscina",
  playground: "Playground",
  gerador: "Grupo gerador",
  bombas: "Bombas de recalque ou pressurização",
  portao: "Portões automáticos",
  hidrantes: "Hidrantes e mangotinhos",
  spda: "SPDA (para-raios)",
  ar_condicionado: "Ar-condicionado",
  ventilacao: "Ventilação ou exaustão mecânica",
  gas: "Instalação de gás",
  seguranca_eletronica: "Alarme e câmeras",
};

// Plano de referência por sistema do prédio. Os prazos seguem a prática usual
// da NBR 5674 (manutenção de edificações). Confirme com o texto vigente da norma
// e com o responsável técnico antes de entregar ao cliente.
export type ItemModelo = { grupo: string; item: string; periodicidade: Periodicidade; recurso?: Recurso };

export const modelo: ItemModelo[] = [
  { grupo: "Estrutura e fachada", item: "Inspeção visual da fachada e revestimentos", periodicidade: "anual" },
  { grupo: "Estrutura e fachada", item: "Verificação de trincas e infiltrações", periodicidade: "anual" },
  { grupo: "Estrutura e fachada", item: "Reavaliação da impermeabilização de lajes", periodicidade: "quinquenal" },
  { grupo: "Estrutura e fachada", item: "Pintura das áreas externas", periodicidade: "quinquenal" },
  { grupo: "Estrutura e fachada", item: "Verificação de muros, grades e cercas", periodicidade: "semestral" },
  { grupo: "Estrutura e fachada", item: "Inspeção de telhado e coberturas", periodicidade: "semestral" },
  { grupo: "Hidráulica", item: "Limpeza dos reservatórios de água", periodicidade: "semestral" },
  { grupo: "Hidráulica", item: "Limpeza de caixas de gordura e de inspeção", periodicidade: "semestral" },
  { grupo: "Hidráulica", item: "Limpeza de calhas, ralos e grelhas", periodicidade: "semestral" },
  { grupo: "Hidráulica", item: "Teste das bombas de recalque e pressurizadoras", periodicidade: "mensal", recurso: "bombas" },
  { grupo: "Hidráulica", item: "Verificação de vazamentos e registros", periodicidade: "mensal" },
  { grupo: "Elétrica", item: "Inspeção dos quadros elétricos e reaperto de conexões", periodicidade: "anual" },
  { grupo: "Elétrica", item: "Termografia dos quadros elétricos", periodicidade: "anual" },
  { grupo: "Elétrica", item: "Teste do aterramento", periodicidade: "anual" },
  { grupo: "Elétrica", item: "Inspeção do SPDA (para-raios)", periodicidade: "anual", recurso: "spda" },
  { grupo: "Elétrica", item: "Teste da iluminação de emergência", periodicidade: "mensal" },
  { grupo: "Elétrica", item: "Teste do grupo gerador", periodicidade: "mensal", recurso: "gerador" },
  { grupo: "Elevadores e acessos", item: "Manutenção preventiva do elevador", periodicidade: "mensal", recurso: "elevador" },
  { grupo: "Elevadores e acessos", item: "Manutenção dos portões automáticos", periodicidade: "mensal", recurso: "portao" },
  { grupo: "Combate a incêndio", item: "Recarga e manutenção dos extintores", periodicidade: "anual" },
  { grupo: "Combate a incêndio", item: "Inspeção visual de hidrantes e mangotinhos", periodicidade: "mensal", recurso: "hidrantes" },
  { grupo: "Combate a incêndio", item: "Teste de mangueiras e hidrantes", periodicidade: "anual", recurso: "hidrantes" },
  { grupo: "Combate a incêndio", item: "Teste das bombas de incêndio", periodicidade: "mensal", recurso: "hidrantes" },
  { grupo: "Combate a incêndio", item: "Sinalização de emergência e saídas", periodicidade: "anual" },
  { grupo: "Ar-condicionado e ventilação", item: "Limpeza e troca de filtros do ar-condicionado", periodicidade: "mensal", recurso: "ar_condicionado" },
  { grupo: "Ar-condicionado e ventilação", item: "Limpeza das unidades evaporadoras e condensadoras", periodicidade: "trimestral", recurso: "ar_condicionado" },
  { grupo: "Ar-condicionado e ventilação", item: "Revisão do sistema de ventilação e exaustão", periodicidade: "semestral", recurso: "ventilacao" },
  { grupo: "Gás", item: "Inspeção da instalação de gás e teste de estanqueidade", periodicidade: "anual", recurso: "gas" },
  { grupo: "Segurança", item: "Teste do alarme e das câmeras", periodicidade: "mensal", recurso: "seguranca_eletronica" },
  { grupo: "Segurança", item: "Verificação de portas corta-fogo e fechaduras", periodicidade: "semestral" },
  { grupo: "Áreas comuns", item: "Limpeza e tratamento da piscina", periodicidade: "semanal", recurso: "piscina" },
  { grupo: "Áreas comuns", item: "Manutenção do playground", periodicidade: "mensal", recurso: "playground" },
];

export type Predio = {
  id: string;
  criado_em: string;
  atualizado_em: string;
  nome: string;
  endereco?: string;
  sindico?: string;
  contato?: string; // WhatsApp com DDD
  antecedencia_dias: number;
  recursos?: Recurso[];
  exemplo?: boolean;
};

export type Registro = { data: string; nota?: string };

// aguardando: aviso enviado, esperando o síndico responder
// equipe: a nossa equipe vai buscar o orçamento
// sindico: o síndico vai buscar o orçamento
export type SituacaoOrcamento = "aguardando" | "equipe" | "sindico";

export type Orcamento = {
  situacao: SituacaoOrcamento;
  desde: string; // aaaa-mm-dd, data do aviso
};

export type Manutencao = {
  id: string;
  criado_em: string;
  atualizado_em: string;
  predio_id: string;
  item: string;
  periodicidade: Periodicidade;
  proxima: string; // aaaa-mm-dd
  historico: Registro[];
  orcamento?: Orcamento;
  exemplo?: boolean;
};

export type Config = {
  id: string;
  criado_em: string;
  atualizado_em: string;
  exemplos_criados: boolean;
};

export type CampoPredio = Omit<Predio, "id" | "criado_em" | "atualizado_em">;
export type CampoManutencao = Omit<Manutencao, "id" | "criado_em" | "atualizado_em">;

export type Situacao = "atrasada" | "a_vencer" | "em_dia";

export const situacoes: Record<Situacao, { rotulo: string; classe: string }> = {
  atrasada: { rotulo: "Atrasada", classe: "bg-red-500/15 text-red-300 ring-red-500/30" },
  a_vencer: { rotulo: "A vencer", classe: "bg-amber-500/15 text-amber-300 ring-amber-500/30" },
  em_dia: { rotulo: "Em dia", classe: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" },
};

export type StatusChamado = "aberto" | "em_andamento" | "resolvido";

export const statusChamados: Record<StatusChamado, { rotulo: string; classe: string }> = {
  aberto: { rotulo: "Aberto", classe: "bg-red-500/15 text-red-300 ring-red-500/30" },
  em_andamento: { rotulo: "Em andamento", classe: "bg-amber-500/15 text-amber-300 ring-amber-500/30" },
  resolvido: { rotulo: "Resolvido", classe: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" },
};

export type Chamado = {
  id: string;
  criado_em: string;
  atualizado_em: string;
  predio_id: string;
  titulo: string;
  descricao?: string;
  status: StatusChamado;
  aberto_em: string; // aaaa-mm-dd
  resolvido_em?: string; // aaaa-mm-dd
  exemplo?: boolean;
};

export type CampoChamado = Omit<Chamado, "id" | "criado_em" | "atualizado_em">;
