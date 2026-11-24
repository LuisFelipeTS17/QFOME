import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useFocusEffect } from "expo-router";
import { ApiError, getSessaoAdmin } from "@/lib/api";
import {
  abrirSessaoAdmin,
  clearSessaoAdmin,
  encerrarSessaoAdmin,
  readSessaoAdmin,
  type SessaoAdmin,
} from "@/lib/admin-session";
import { clearSessao, readSessao } from "@/lib/session";

type AdminContexto = {
  /** Administrador logado, ou null. */
  admin: SessaoAdmin | null;
  carregando: boolean;
  /** Motivo do ultimo encerramento da sessao, mostrado na tela de login. */
  aviso: string;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  /**
   * Executa uma chamada da API com o token. Se o servidor recusar a sessao (401),
   * encerra o acesso e a navegacao volta para o login.
   */
  comSessao: <T>(chamada: (token: string) => Promise<T>) => Promise<T>;
};

const Contexto = createContext<AdminContexto | null>(null);

export function useAdmin() {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error("useAdmin precisa estar dentro de <AdminProvider>.");
  }
  return contexto;
}

const SESSAO_ENCERRADA = "Sua sessao terminou. Entre novamente.";
const semSessao = (error: unknown) => error instanceof ApiError && error.status === 401;

/**
 * Sessao do login administrativo. Quem protege os dados e o backend, que confere o
 * token a cada requisicao; aqui ficam so a tela de login e a navegacao.
 */
export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<SessaoAdmin | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState("");

  // Confere ao abrir a area e sempre que se volta para ela: o login e o logout tambem
  // podem acontecer pelas telas do cliente.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        const salva = await readSessaoAdmin();
        let valida = salva;
        if (salva) {
          try {
            await getSessaoAdmin(salva.token);
          } catch (error) {
            // Sem conexao a sessao e mantida: as telas mostram o erro de rede.
            if (semSessao(error)) {
              valida = null;
              await clearSessaoAdmin().catch(() => {});
            }
          }
        }
        if (ativo) {
          if (salva && !valida) {
            setAviso(SESSAO_ENCERRADA);
          }
          setAdmin(valida);
          setCarregando(false);
        }
      })();

      return () => {
        ativo = false;
      };
    }, []),
  );

  const entrar = useCallback(async (email: string, senha: string) => {
    const sessao = await abrirSessaoAdmin(email, senha);
    setAviso("");
    setAdmin(sessao);
  }, []);

  const sair = useCallback(async () => {
    await encerrarSessaoAdmin().catch(() => {});
    // Quem entrou pelo login comum com a conta de administrador sai das duas sessoes.
    if ((await readSessao())?.perfil === "ADMIN") {
      await clearSessao().catch(() => {});
    }
    setAviso("");
    setAdmin(null);
  }, []);

  const comSessao = useCallback(
    async <T,>(chamada: (token: string) => Promise<T>) => {
      if (!admin) {
        throw new Error(SESSAO_ENCERRADA);
      }
      try {
        return await chamada(admin.token);
      } catch (error) {
        if (semSessao(error)) {
          await clearSessaoAdmin().catch(() => {});
          setAviso(SESSAO_ENCERRADA);
          setAdmin(null);
        }
        throw error;
      }
    },
    [admin],
  );

  const valor = useMemo(
    () => ({ admin, carregando, aviso, entrar, sair, comSessao }),
    [admin, carregando, aviso, entrar, sair, comSessao],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
