import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock3, Star } from "lucide-react";
import { BrandText } from "@/components/brand-text";
import { allMenuProducts } from "@/data/menu-products";

const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function CardapioPage() {
  return (
    <div className="qfome-shell min-h-screen pb-16 text-[var(--qfome-ink)]">
      <main className="mx-auto w-full max-w-7xl px-4 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#f0cabd] bg-white px-4 py-2 text-sm font-bold text-[#6a3b32] transition hover:bg-[#fff0e8]"
        >
          <ArrowLeft size={16} />
          Voltar para a home
        </Link>

        <section className="mt-5 rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] p-4 shadow-[0_16px_35px_rgba(121,66,34,0.11)] sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a5e52]">
            Cardapio completo
          </p>
          <h1 className="font-display mt-2 text-4xl leading-[0.9] text-[#7d141e] sm:text-6xl">
            Todos os pratos
          </h1>
          <p className="mt-3 text-sm text-[#8a5b50]">
            Escolha um prato para ver detalhes e montar seu pedido.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {allMenuProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/produto/${product.slug}?auto=1`}
                className="group overflow-hidden rounded-3xl border border-[#efcabc] bg-white shadow-[0_9px_22px_rgba(108,53,38,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_26px_rgba(94,40,28,0.14)]"
              >
                <div className="relative h-36">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                  <span className="absolute left-2 top-2 rounded-full border border-[#f2b789] bg-[#ffe9cc] px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#7a2a1f] shadow-[0_8px_14px_rgba(72,28,22,0.26)]">
                    {product.tag}
                  </span>
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-extrabold text-[#62261d]">
                    <BrandText text={product.name} />
                  </h2>
                  <p className="mt-1 min-h-12 text-sm text-[#8a5b50]">
                    <BrandText text={product.shortDescription} />
                  </p>
                  <div className="mt-3 flex items-center justify-between rounded-2xl border border-[#f4d2c6] bg-[#fff8f5] px-3 py-2 text-xs font-semibold text-[#71433a]">
                    <span className="flex items-center gap-1">
                      <Clock3 size={13} />
                      {product.prepTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={13} className="fill-[#f5b340] text-[#f5b340]" />
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-black text-[#bf1f34]">{formatPrice(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
