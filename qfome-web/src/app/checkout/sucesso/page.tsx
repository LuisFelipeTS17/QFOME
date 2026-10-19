import Link from "next/link";
import { CheckCircle2, Home, MapPinned, UserRound } from "lucide-react";

type CheckoutSuccessPageProps = {
  searchParams?: Promise<{ codigo?: string | string[] }>;
};

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const rawCode = resolvedSearchParams?.codigo;
  const orderCode = Array.isArray(rawCode) ? rawCode[0] : rawCode;

  return (
    <div className="qfome-shell min-h-screen pb-16 text-[var(--qfome-ink)]">
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 sm:pt-10">
        <section className="rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] p-5 text-center shadow-[0_16px_35px_rgba(121,66,34,0.11)] sm:p-8">
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf9ef] text-[#2c8f54]">
            <CheckCircle2 size={30} />
          </span>

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#9a5e52]">
            Pedido confirmado
          </p>
          <h1 className="font-display mt-2 text-4xl leading-[0.9] text-[#7d141e] sm:text-6xl">
            Sucesso no checkout
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#8a5b50]">
            Recebemos seu pedido. Sua cozinha ja iniciou a preparacao e em breve ele sai para entrega.
          </p>

          <div className="mt-5 rounded-2xl border border-[#efcabc] bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8f594b]">
              Codigo do pedido
            </p>
            <p className="mt-1 text-2xl font-black text-[#bf1f34]">{orderCode ?? "QF-SEM-CODIGO"}</p>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            <Link
              href={orderCode ? `/acompanhar-pedido?codigo=${orderCode}` : "/acompanhar-pedido"}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d72638] px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#a81a2a]"
            >
              <MapPinned size={15} />
              Acompanhar
            </Link>
            <Link
              href="/cliente"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#efcabc] bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#6a3b32] transition hover:bg-[#fff3ed]"
            >
              <UserRound size={15} />
              Area cliente
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#efcabc] bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#6a3b32] transition hover:bg-[#fff3ed]"
            >
              <Home size={15} />
              Voltar home
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
