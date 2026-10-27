import Link from "next/link";
import { ArrowLeft, Clock3, Mail, MapPin, Phone } from "lucide-react";
import { BrandText } from "@/components/brand-text";

export default function ContatoPage() {
  return (
    <div className="qfome-shell min-h-screen pb-16 text-[var(--qfome-ink)]">
      <main className="mx-auto w-full max-w-3xl px-4 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#f0cabd] bg-white px-4 py-2 text-sm font-bold text-[#6a3b32] transition hover:bg-[#fff0e8]"
        >
          <ArrowLeft size={16} />
          Voltar para a home
        </Link>

        <section className="mt-5 rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] p-4 shadow-[0_16px_35px_rgba(121,66,34,0.11)] sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a5e52]">Contato</p>
          <h1 className="font-display mt-2 text-4xl leading-[0.9] text-[#7d141e] sm:text-6xl">
            <BrandText text="Fale com a QFome" />
          </h1>
          <p className="mt-3 text-sm text-[#8a5b50]">
            Estamos aqui para ajudar com pedidos, suporte e parcerias.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-[#efcabc] bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-[#61261d]">
                <Phone size={16} />
                Telefone
              </p>
              <p className="mt-2 text-[#8a5b50]">(11) 3000-0000</p>
            </article>
            <article className="rounded-2xl border border-[#efcabc] bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-[#61261d]">
                <Mail size={16} />
                E-mail
              </p>
              <p className="mt-2 text-[#8a5b50]">contato@qfome.com.br</p>
            </article>
            <article className="rounded-2xl border border-[#efcabc] bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-[#61261d]">
                <Clock3 size={16} />
                Atendimento
              </p>
              <p className="mt-2 text-[#8a5b50]">Todos os dias, das 10h as 23h</p>
            </article>
            <article className="rounded-2xl border border-[#efcabc] bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-[#61261d]">
                <MapPin size={16} />
                Area de entrega
              </p>
              <p className="mt-2 text-[#8a5b50]">18 bairros na regiao metropolitana</p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
