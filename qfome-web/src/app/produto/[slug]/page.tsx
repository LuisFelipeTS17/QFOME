import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, Flame, Star } from "lucide-react";
import { BrandText } from "@/components/brand-text";
import { ProductOrderPanel } from "@/components/product-order-panel";
import { menuCategories } from "@/data/menu-categories";
import { allMenuProducts, getMenuProductBySlug } from "@/data/menu-products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ auto?: string | string[] }>;
};

const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export function generateStaticParams() {
  return allMenuProducts.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const autoParam = resolvedSearchParams?.auto;
  const autoAddEnabled = Array.isArray(autoParam) ? autoParam.includes("1") : autoParam === "1";
  const product = getMenuProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const knownProductSlugs = new Set(allMenuProducts.map((item) => item.slug));
  const allCategoryDishes = menuCategories.flatMap((category) =>
    category.dishes.map((dish) => ({
      ...dish,
      categorySlug: category.slug,
      categoryName: category.name,
    })),
  );

  const currentCategory = allCategoryDishes.find((dish) => dish.slug === product.slug)?.categorySlug;

  const prioritizedSuggestions = [
    ...allCategoryDishes.filter(
      (dish) => dish.slug !== product.slug && dish.categorySlug === currentCategory,
    ),
    ...allCategoryDishes.filter(
      (dish) => dish.slug !== product.slug && dish.categorySlug !== currentCategory,
    ),
  ];

  const uniqueSuggestions = prioritizedSuggestions.filter(
    (dish, index, array) => array.findIndex((item) => item.slug === dish.slug) === index,
  );

  const suggestedDishes = uniqueSuggestions.slice(0, 4);

  return (
    <div className="qfome-shell min-h-screen pb-16 text-[var(--qfome-ink)]">
      <div className="border-b border-[#f3c7b6] bg-[#3b1916] px-4 py-2 text-sm text-[#ffe9d2]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center text-center">
          <p className="flex items-center justify-center gap-2 font-semibold">
            <Flame size={16} />
            Detalhes do produto e montagem do pedido.
          </p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#f0cabd] bg-white px-4 py-2 text-sm font-bold text-[#6a3b32] transition hover:bg-[#fff0e8]"
        >
          <ArrowLeft size={16} />
          Voltar para a home
        </Link>

        <section className="mt-5 grid items-start gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] p-5 shadow-[0_16px_35px_rgba(121,66,34,0.11)] sm:p-7">
            <div className="relative h-72 overflow-hidden rounded-3xl sm:h-96">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${product.tone} opacity-55`} />
              <span className="absolute left-4 top-4 inline-flex rounded-full border border-[#f2b789] bg-[#ffe9cc] px-3 py-1 text-xs font-black uppercase tracking-[0.13em] text-[#7a2a1f] shadow-[0_8px_14px_rgba(72,28,22,0.26)]">
                {product.tag}
              </span>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a5e52]">
                <BrandText text="Produto QFome" />
              </p>
              <h1 className="font-display mt-2 text-4xl leading-[0.9] text-[#7d141e] sm:text-6xl">
                <BrandText text={product.name} />
              </h1>
              <p className="mt-3 text-base text-[#73463d]">
                <BrandText text={product.description} />
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#f4d2c6] bg-white px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a6052]">
                    Preco base
                  </p>
                  <p className="mt-1 text-lg font-black text-[#bf1f34]">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#f4d2c6] bg-white px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a6052]">
                    Tempo medio
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-lg font-black text-[#5f2a20]">
                    <Clock3 size={16} />
                    {product.prepTime}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#f4d2c6] bg-white px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a6052]">
                    Avaliacao
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-lg font-black text-[#5f2a20]">
                    <Star size={16} className="fill-[#f5b340] text-[#f5b340]" />
                    {product.rating.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-[#f0ccbe] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#9a6254]">
                O que vem no prato
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {product.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-xl border border-[#f2d3c8] bg-[#fff9f6] px-3 py-2 text-sm text-[#623128]"
                  >
                    <CheckCircle2 size={16} className="text-[#cf2841]" />
                    <BrandText text={item} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a5e52]">
                Pratos sugeridos
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {suggestedDishes.map((dish) => {
                  const href = knownProductSlugs.has(dish.slug)
                    ? `/produto/${dish.slug}?auto=1`
                    : `/categoria/${dish.categorySlug}`;

                  return (
                    <Link
                      key={`${dish.categorySlug}-${dish.slug}`}
                      href={href}
                      className="group overflow-hidden rounded-2xl border border-[#efcabc] bg-white shadow-[0_8px_18px_rgba(108,53,38,0.08)] transition hover:-translate-y-1 hover:shadow-[0_14px_24px_rgba(94,40,28,0.14)]"
                    >
                      <div className="relative h-36">
                        <Image
                          src={dish.image}
                          alt={dish.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 30vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                        <span className="absolute left-2 top-2 rounded-full border border-[#f2b789] bg-[#ffe9cc] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#7a2a1f] shadow-[0_8px_14px_rgba(72,28,22,0.26)]">
                          {dish.tag}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-extrabold text-[#62261d]">
                          <BrandText text={dish.name} />
                        </p>
                        <p className="mt-1 min-h-8 text-xs text-[#8a5b50]">
                          <BrandText text={dish.description} />
                        </p>
                        <div className="mt-2 flex items-center justify-between text-xs font-semibold text-[#71433a]">
                          <span className="flex items-center gap-1">
                            <Clock3 size={13} />
                            {dish.prepTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star size={13} className="fill-[#f5b340] text-[#f5b340]" />
                            {dish.rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-lg font-black text-[#bf1f34]">
                            {formatPrice(dish.price)}
                          </span>
                          <span className="text-xs font-black uppercase tracking-[0.08em] text-[#d72638]">
                            Ver prato
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </article>

          <ProductOrderPanel product={product} autoAddEnabled={autoAddEnabled} />
        </section>
      </main>
    </div>
  );
}
