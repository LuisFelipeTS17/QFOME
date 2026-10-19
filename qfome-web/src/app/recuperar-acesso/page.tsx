"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

type UserProfile = {
  name: string;
  email: string;
  phone?: string;
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const readStoredUser = (): UserProfile | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = localStorage.getItem("qfome-user");
  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved) as UserProfile;
    if (!parsed?.name || !parsed?.email) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export default function RecuperarAcessoPage() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleRecovery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const storedUser = readStoredUser();
    if (!storedUser) {
      setFeedback("Nenhuma conta cadastrada neste navegador. Crie sua conta para continuar.");
      return;
    }

    if (normalizeEmail(storedUser.email) !== normalizeEmail(email)) {
      setFeedback("E-mail nao encontrado. Confira o e-mail informado.");
      return;
    }

    setFeedback(
      `Pronto! Encontramos sua conta (${storedUser.name}). No backend, aqui entra o envio real do link de recuperacao.`,
    );
  };

  return (
    <div className="qfome-shell min-h-screen pb-16 text-[var(--qfome-ink)]">
      <main className="mx-auto w-full max-w-xl px-4 pt-6">
        <Link
          href="/entrar"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#f0cabd] bg-white px-4 py-2 text-sm font-bold text-[#6a3b32] transition hover:bg-[#fff0e8]"
        >
          <ArrowLeft size={16} />
          Voltar para login
        </Link>

        <section className="mt-5 rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] p-4 shadow-[0_16px_35px_rgba(121,66,34,0.11)] sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a5e52]">
            Recuperar acesso
          </p>
          <h1 className="font-display mt-2 text-4xl leading-[0.9] text-[#7d141e] sm:text-6xl">
            Esqueceu seu login?
          </h1>
          <p className="mt-3 text-sm text-[#8a5b50]">
            Informe seu e-mail para recuperar o acesso da sua conta.
          </p>

          <form className="mt-5 space-y-3" onSubmit={handleRecovery}>
            <label className="flex items-center gap-2 rounded-2xl border border-[#efcabc] bg-white px-3 py-3">
              <Mail size={16} className="text-[#8b5145]" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFeedback("");
                }}
                placeholder="Digite seu e-mail de cadastro"
                className="w-full bg-transparent text-sm font-semibold text-[#542a24] outline-none placeholder:text-[#b98476]"
              />
            </label>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d72638] px-4 py-3 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#a81a2a]"
            >
              <ShieldCheck size={16} />
              Recuperar acesso
            </button>
          </form>

          {feedback ? (
            <p className="mt-4 rounded-xl border border-[#efcabc] bg-[#fff4ef] px-3 py-2 text-xs font-semibold text-[#7b3f34]">
              {feedback}
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
