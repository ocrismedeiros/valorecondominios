import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, TriangleAlert, Wrench } from "lucide-react";
import { SENHA_EQUIPE } from "../lib/acesso";
import { btnPrimario, input } from "../components/estilos";

type Props = {
  onEntrar: () => void;
};

export function AcessoEquipe({ onEntrar }: Props) {
  const [senha, setSenha] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState("");

  function entrar(e: FormEvent) {
    e.preventDefault();
    if (!senha) {
      setErro("Digite a senha da equipe.");
      return;
    }
    if (senha !== SENHA_EQUIPE) {
      setErro("Senha incorreta. Confira com o responsável.");
      return;
    }
    setErro("");
    onEntrar();
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

        <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div className="space-y-2">
            <p className="font-semibold text-amber-300">Esta senha não protege os dados</p>
            <p>
              Ela só evita o uso acidental do sistema. Quem souber mexer no navegador consegue ver as informações dos prédios.
              Não guarde nada sigiloso aqui. Para o síndico ver só o próprio prédio, é preciso uma ferramenta com contas e permissões.
            </p>
          </div>
        </div>

        <form onSubmit={entrar} noValidate className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-300">Senha da equipe</span>
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
            {erro && <span className="text-xs text-red-400">{erro}</span>}
          </label>

          <button type="submit" className={`${btnPrimario} w-full`}>
            Entrar
          </button>
          <p className="text-center text-xs text-neutral-500">Ao atualizar a página, a senha será pedida de novo.</p>
        </form>
      </div>
    </div>
  );
}
