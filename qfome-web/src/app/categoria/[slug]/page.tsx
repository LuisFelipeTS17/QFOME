import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, Star } from "lucide-react";
import { BrandText } from "@/components/brand-text";
import { getMenuCategoryBySlug, menuCategories } from "@/data/menu-categories";
import { CategoryPromoBanner } from "@/components/category-promo-banner";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export function generateStaticParams() {
  return menuCategories.map((category) => ({ slug: category.slug }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getMenuCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="qfome-shell min-h-screen pb-16 text-[var(--qfome-ink)]">
      <CategoryPromoBanner categoryName={category.name} categorySlug={category.slug} />

      <main className="mx-auto w-full max-w-7xl px-4 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#f0cabd] bg-white px-4 py-2 text-sm font-bold text-[#6a3b32] transition hover:bg-[#fff0e8]"
        >
          <ArrowLeft size={16} />
          Voltar para a home
        </Link>

        <section className="mt-5 overflow-hidden rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] shadow-[0_16px_35px_rgba(121,66,34,0.11)]">
          <div className="relative h-64 sm:h-80">
            <Image
              src={category.image}
              alt={category.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/10" />
            <div
              className={`absolute inset-0 bg-gradient-to-r ${category.tone} opacity-30 mix-blend-multiply`}
            />
            <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.14em]">Explore sabores</p>
              <h1 className="font-display mt-2 text-4xl leading-[0.9] sm:text-7xl">
                {category.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-white/90 sm:text-base">
                {category.description}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a5e52]">
                Cardapio da categoria
              </p>
              <h2 className="font-display text-4xl leading-none text-[#7d141e] sm:text-5xl">
                5 pratos em destaque
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {category.dishes.map((dish) => (
              <Link
                key={dish.slug}
                href={`/produto/${dish.slug}?auto=1`}
                className="group overflow-hidden rounded-3xl border border-[#efcabc] bg-white shadow-[0_9px_22px_rgba(108,53,38,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_26px_rgba(94,40,28,0.14)]"
              >
                <div className="relative h-44">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    sizes="(max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full border border-[#f2b789] bg-[#ffe9cc] px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#7a2a1f] shadow-[0_8px_14px_rgba(72,28,22,0.26)]">
                    {dish.tag}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-extrabold text-[#62261d]">
                    <BrandText text={dish.name} />
                  </h3>
                  <p className="mt-1 min-h-12 text-sm text-[#8a5b50]">
                    <BrandText text={dish.description} />
                  </p>

                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#f4d2c6] bg-[#fff8f5] px-3 py-2 text-xs font-semibold text-[#71433a]">
                    <span className="flex items-center gap-1">
                      <Clock3 size={14} />
                      {dish.prepTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={14} className="fill-[#f5b340] text-[#f5b340]" />
                      {dish.rating.toFixed(1)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-2xl font-black text-[#bf1f34]">{formatPrice(dish.price)}</p>
                    <span className="rounded-xl bg-[#d72638] px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-white transition group-hover:bg-[#a81a2a]">
                      Ver pedido
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
