"use client";

import Link from "next/link";
import { useState } from "react";
import { Facebook, Instagram, Mail, MessageCircle, Send, TicketPercent } from "lucide-react";
import { BrandText } from "@/components/brand-text";

type SavedLead = {
  email: string;
  createdAt: string;
};

function TwitterBrandIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M8.29 20c7.547 0 11.675-6.253 11.675-11.676 0-.177 0-.355-.012-.53A8.348 8.348 0 0022 5.67a8.19 8.19 0 01-2.357.646A4.118 4.118 0 0021.448 4.1a8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.742A11.653 11.653 0 013.392 4.95a4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.91v.051a4.106 4.106 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407 11.616 11.616 0 008.29 20" />
    </svg>
  );
}

const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function SiteContactFooter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submitLead = () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!validateEmail(cleanEmail)) {
      setMessage("Digite um e-mail valido para receber promocoes.");
      return;
    }

    try {
      const saved = localStorage.getItem("qfome-newsletter");
      const parsed = saved ? (JSON.parse(saved) as SavedLead[]) : [];
      const safeList = Array.isArray(parsed) ? parsed : [];
      const alreadyExists = safeList.some((lead) => lead.email === cleanEmail);

      if (alreadyExists) {
        setMessage("Esse e-mail ja esta cadastrado na nossa lista.");
        return;
      }

      const nextList: SavedLead[] = [
        ...safeList,
        { email: cleanEmail, createdAt: new Date().toISOString() },
      ];

      localStorage.setItem("qfome-newsletter", JSON.stringify(nextList));
      setEmail("");
      setMessage("Cadastro confirmado! Novas promocoes e cupons vao chegar no seu e-mail.");
    } catch {
      setMessage("Nao foi possivel salvar seu cadastro agora. Tente novamente.");
    }
  };

  return (
    <section
      id="contato"
      className="rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] px-4 py-5 shadow-[0_12px_28px_rgba(118,64,38,0.1)] sm:px-6 sm:py-7"
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9b6053]">Contato</p>
          <h2 className="font-display mt-2 text-4xl leading-none text-[#7d141e] sm:text-5xl">
            <BrandText text="Fale com a QFome" />
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[#8a5b50]">
            Atendimento todos os dias das 10h as 23h. Receba novidades da loja, promocoes
            relampago e cupons exclusivos direto no e-mail.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href="https://instagram.com/qfome"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#efcabc] bg-white px-3 py-2 text-sm font-bold text-[#683a30] transition hover:bg-[#fff2eb]"
            >
              <Instagram size={16} />
              Instagram
            </a>
            <a
              href="https://facebook.com/qfome"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#efcabc] bg-white px-3 py-2 text-sm font-bold text-[#683a30] transition hover:bg-[#fff2eb]"
            >
              <Facebook size={16} />
              Facebook
            </a>
            <a
              href="https://twitter.com/qfome"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#efcabc] bg-white px-3 py-2 text-sm font-bold text-[#683a30] transition hover:bg-[#fff2eb]"
            >
              <TwitterBrandIcon />
              Twitter
            </a>
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#efcabc] bg-white px-3 py-2 text-sm font-bold text-[#683a30] transition hover:bg-[#fff2eb]"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>

          <div className="mt-5 rounded-2xl border border-[#efcabc] bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.13em] text-[#9a6254]">
              E-mail da loja
            </p>
            <a
              href="mailto:contato@qfome.com.br"
              className="mt-2 inline-flex items-center gap-2 text-base font-extrabold text-[#642a20] hover:text-[#a32a28]"
            >
              <Mail size={16} />
              contato@qfome.com.br
            </a>
          </div>
        </article>

        <article className="rounded-3xl border border-[#e6b5aa] bg-[#321312] p-4 text-[#ffe5d0] shadow-[0_14px_30px_rgba(60,15,12,0.28)] sm:p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f6c699]">
            <BrandText text="Clube QFome" />
          </p>
          <h3 className="font-display mt-2 text-3xl leading-none text-white sm:text-4xl">
            PROMOCOES & CUPONS
          </h3>
          <p className="mt-3 text-sm text-[#e6b89e]">
            Cadastre seu e-mail e receba novidades semanais, ofertas especiais e cupons.
          </p>

          <label className="mt-4 flex items-center gap-2 rounded-2xl border border-[#6f4138] bg-[#47211d] px-3 py-3">
            <Mail size={16} className="text-[#ffcc96]" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-[#d7a98f]"
            />
          </label>

          <button
            type="button"
            onClick={submitLead}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ffb348] px-4 py-3 text-sm font-black uppercase tracking-[0.1em] text-[#4f220d] transition hover:bg-[#ffc770]"
          >
            <Send size={14} />
            Cadastrar e-mail
          </button>

          <div className="mt-4 rounded-2xl border border-[#6f4138] bg-[#431f1b] p-3 text-xs text-[#ffd4ad]">
            <p className="inline-flex items-center gap-2 font-bold">
              <TicketPercent size={14} />
              <BrandText text="Cupom de boas-vindas: QFOME10" />
            </p>
          </div>

          {message ? (
            <p className="mt-3 rounded-xl border border-[#845348] bg-[#4a231e] px-3 py-2 text-xs font-semibold text-[#ffce95]">
              {message}
            </p>
          ) : null}

          <Link
            href="/contato"
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[#8f5c50] px-3 py-2 text-sm font-bold text-[#ffe5d0] transition hover:bg-[#4d231e]"
          >
            Ir para pagina de contato
          </Link>
        </article>
      </div>
    </section>
  );
}
