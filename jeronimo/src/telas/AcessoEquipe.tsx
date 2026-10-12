import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, TriangleAlert, Wrench } from "lucide-react";
import { auth } from "../nucleo";
import { btnPrimario, input } from "../components/estilos";

type Props = {
  onEntrar: (email: string) => void;
};

export function AcessoEquipe({ onEntrar }: Props) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    if (auth.local) {
      onEntrar("");
      return;
    }
    if (!email.trim() || !senha) {
      setErro("Digite o e-mail e a senha.");
      return;
    }
    setErro("");
    setEntrando(true);
    try {
      await auth.entrar(email, senha);
      onEntrar(email.trim().toLowerCase());
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível entrar. Tente de novo.");
      setEntrando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-4 text-neutral-100">
      <div className="w-full max-w-md space-y-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-300 text-neutral-950">
            <Wrench className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Manutenções</h1>
            <p className="text-sm text-neutral-400">Acesso da equipe</p>
          </div>
        </div>

        {auth.local && (
          <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <div className="space-y-2">
              <p className="font-semibold text-amber-300">Modo local de teste</p>
              <p>Os dados ficam só neste navegador e não há login. Para a equipe usar junto, configure o Supabase.</p>
            </div>
          </div>
        )}

        <form onSubmit={entrar} noValidate className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          {!auth.local && (
            <>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-neutral-300">E-mail</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErro("");
                    }}
                    autoComplete="username"
                    className={`${input} pl-9`}
                  />
                </div>
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-neutral-300">Senha</span>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    type={mostrar ? "text" : "password"}
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      setErro("");
                    }}
                    autoComplete="current-password"
                    className={`${input} pl-9 pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrar((v) => !v)}
                    aria-label={mostrar ? "Esconder senha" : "Mostrar senha"}
                    className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800"
                  >
                    {mostrar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
            </>
          )}
          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <button type="submit" disabled={entrando} className={`${btnPrimario} w-full`}>
            {entrando ? "Entrando..." : "Entrar"}
          </button>
          {!auth.local && (
            <p className="text-center text-xs text-neutral-500">Esqueceu a senha? Peça ao responsável para redefinir.</p>
          )}
        </form>
      </div>
    </div>
  );
}
