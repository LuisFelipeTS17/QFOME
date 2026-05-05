import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Beef,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Fish,
  Flame,
  IceCreamCone,
  Leaf,
  MapPin,
  Menu,
  Percent,
  Pizza,
  ShoppingBag,
  Soup,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { HeroSearch } from "@/components/hero-search";
import { BrandText } from "@/components/brand-text";
import { HeaderAccountAction } from "@/components/header-account-action";
import { HomeCartWorkspace } from "@/components/home-cart-workspace";
import { SiteContactFooter } from "@/components/site-contact-footer";
import { menuCategories } from "@/data/menu-categories";
import { menuProducts } from "@/data/menu-products";

type Category = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  image: string;
};

const categoryIcons: Record<string, LucideIcon> = {
  caseira: UtensilsCrossed,
  "fit-fresh": Leaf,
  grelhados: Beef,
  peixes: Fish,
  sopas: Soup,
  sobremesas: IceCreamCone,
};

const categories: Category[] = menuCategories.map((category) => ({
  slug: category.slug,
  name: category.name,
  description: category.description,
  tone: category.tone,
  image: category.image,
  icon: categoryIcons[category.slug] ?? UtensilsCrossed,
}));

const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const highlightCardOverlayBySlug: Record<string, string> = {
  "bowl-nordestino":
    "linear-gradient(to top, rgba(149, 23, 44, 0.9) 0%, rgba(249, 115, 82, 0.58) 58%, rgba(249, 115, 82, 0.1) 100%)",
  "frango-crocante-supreme":
    "linear-gradient(to top, rgba(146, 58, 20, 0.9) 0%, rgba(248, 173, 61, 0.58) 58%, rgba(248, 173, 61, 0.1) 100%)",
  "salmao-tropical":
    "linear-gradient(to top, rgba(33, 71, 147, 0.9) 0%, rgba(86, 169, 255, 0.58) 58%, rgba(86, 169, 255, 0.1) 100%)",
  "combo-street-burguer":
    "linear-gradient(to top, rgba(119, 22, 42, 0.9) 0%, rgba(233, 79, 93, 0.58) 58%, rgba(233, 79, 93, 0.1) 100%)",
};

const spotlightDeals = [
  {
    title: "Almoco Express",
    subtitle: "2 pratos + 1 bebida",
    discount: "ate 30% OFF",
    tone: "from-[#d72638] to-[#8f1424]",
    href: "/categoria/caseira",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Festival de Grelhados",
    subtitle: "Escolha 1 proteina + 3 acompanhamentos",
    discount: "frete gratis hoje",
    tone: "from-[#f29d35] to-[#cb5b1f]",
    href: "/categoria/grelhados",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Noite QFome",
    subtitle: "Combo jantar para 2 pessoas",
    discount: "cupom QFOME10",
    tone: "from-[#3f2624] to-[#26120f]",
    href: "/cardapio",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function Home() {
  return (
    <div id="inicio" className="qfome-shell min-h-screen text-[var(--qfome-ink)]">
      <div className="border-b border-[#f3c7b6] bg-[#3b1916] px-4 py-2 text-sm text-[#ffe9d2]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center text-center">
          <p className="flex items-center justify-center gap-2 font-semibold">
            <Flame size={16} />
            Promocao de abertura: frete gratis para pedidos acima de R$ 45. Valido hoje.
          </p>
        </div>
      </div>

      <header className="mx-auto w-full max-w-7xl px-4 pt-5">
        <nav className="rise-in flex items-center justify-between gap-3 rounded-3xl border border-[var(--qfome-outline)] bg-[var(--qfome-surface)]/95 px-4 py-3 shadow-[0_12px_35px_rgba(125,53,28,0.12)] backdrop-blur md:px-6 md:py-4">
          <div className="flex items-center gap-4">
            <button
              aria-label="Abrir menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f4c9ba] bg-white text-[#7f2a20] transition hover:bg-[#ffece4] lg:hidden"
            >
              <Menu size={19} />
            </button>
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-content-center rounded-2xl bg-gradient-to-br from-[#ffb34e] to-[#d85b2f] text-white shadow-[0_8px_16px_rgba(189,39,52,0.25)]">
                <Pizza size={24} />
              </div>
              <div>
                <p className="font-display text-4xl leading-none text-[#cc1f2f]">
                  <BrandText text="QFOME" />
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#794842]">
                  food market
                </p>
              </div>
            </Link>
          </div>

          <ul className="hidden items-center gap-7 text-sm font-semibold text-[#60342d] lg:flex">
            <li>
              <Link href="/#inicio" className="transition hover:text-[#d72638]">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/#cardapio-em-alta" className="transition hover:text-[#d72638]">
                Cardapio
              </Link>
            </li>
            <li>
              <Link href="/#combos" className="transition hover:text-[#d72638]">
                Combos
              </Link>
            </li>
            <li>
              <Link href="/#ofertas" className="transition hover:text-[#d72638]">
                Ofertas
              </Link>
            </li>
            <li>
              <Link href="/contato" className="transition hover:text-[#d72638]">
                Contato
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <HeaderAccountAction />
            <Link
              href="/pedido"
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--qfome-brand)] px-4 py-2 text-sm font-bold text-white shadow-[0_10px_22px_rgba(190,32,47,0.3)] transition hover:bg-[var(--qfome-brand-deep)]"
            >
              <ShoppingBag size={16} />
              <span>Meu pedido</span>
            </Link>
          </div>
        </nav>
        <div className="qfome-mobile-scroll mt-3 flex gap-2 lg:hidden">
          <Link
            href="/#inicio"
            className="whitespace-nowrap rounded-xl border border-[#efcabc] bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#6f3e33]"
          >
            Inicio
          </Link>
          <Link
            href="/#cardapio-em-alta"
            className="whitespace-nowrap rounded-xl border border-[#efcabc] bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#6f3e33]"
          >
            Cardapio
          </Link>
          <Link
            href="/#combos"
            className="whitespace-nowrap rounded-xl border border-[#efcabc] bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#6f3e33]"
          >
            Combos
          </Link>
          <Link
            href="/#ofertas"
            className="whitespace-nowrap rounded-xl border border-[#efcabc] bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#6f3e33]"
          >
            Ofertas
          </Link>
          <Link
            href="/contato"
            className="whitespace-nowrap rounded-xl border border-[#efcabc] bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#6f3e33]"
          >
            Contato
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-20 pt-6 md:gap-10 md:pt-8">
        <section className="grid items-stretch gap-6 lg:grid-cols-[1.24fr_0.9fr]">
          <div className="rise-in rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] px-4 py-5 shadow-[0_16px_35px_rgba(121,66,34,0.11)] sm:px-8 sm:py-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#fff0d6] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#a1512d]">
              <Sparkles size={14} />
              delivery rapido
            </span>
            <h1 className="font-display mt-4 text-5xl leading-[0.88] text-[#7d141e] sm:text-7xl lg:text-8xl">
              MATOU A FOME,
              <br />
              CHAMOU <span className="qfome-word">QFOME</span>.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--qfome-muted)] sm:text-lg">
              O ecommerce de comida da sua cidade. Pratos artesanais, combos com
              preco justo e entrega rastreada em tempo real.
            </p>

            <HeroSearch />

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#f7d4c7] bg-white px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a6052]">
                  Entrega media
                </p>
                <p className="mt-1 flex items-center gap-2 text-lg font-extrabold text-[#602519]">
                  <Clock3 size={16} />
                  29 min
                </p>
              </div>
              <div className="rounded-2xl border border-[#f7d4c7] bg-white px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a6052]">
                  Taxa de satisfacao
                </p>
                <p className="mt-1 flex items-center gap-2 text-lg font-extrabold text-[#602519]">
                  <Star size={16} className="fill-[#f8b13d] text-[#f8b13d]" />
                  4.9
                </p>
              </div>
              <div className="rounded-2xl border border-[#f7d4c7] bg-white px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a6052]">
                  Alcance local
                </p>
                <p className="mt-1 flex items-center gap-2 text-lg font-extrabold text-[#602519]">
                  <MapPin size={16} />
                  18 bairros
                </p>
              </div>
            </div>
          </div>

          <aside className="float-card rise-in rise-delay-2 relative overflow-hidden rounded-[2rem] border border-[#e8b1a6] bg-[#2e1211] p-4 text-[#ffe9d6] shadow-[0_16px_40px_rgba(61,17,14,0.35)] sm:p-6">
            <div className="absolute right-5 top-5 rounded-full bg-[#ffca6f] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#7c380f]">
              35% OFF
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#f9c58f]">
              Oferta destaque
            </p>
            <h2 className="font-display mt-2 text-4xl leading-[0.92] text-white sm:text-5xl">
              COMBO ALMOCO
              <br />
              DA CASA
            </h2>
            <p className="mt-3 max-w-sm text-sm text-[#f0ccb2]">
              Prato principal + bebida + sobremesa. Oferta valida para pedidos
              feitos ate as 15h.
            </p>

            <ul className="mt-5 space-y-3">
              <li className="flex items-center justify-between rounded-2xl border border-[#784c43] bg-[#3e1d1a] px-3 py-2 text-sm">
                <span className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 size={15} className="text-[#ffca6f]" />
                  Frango ao molho rustico
                </span>
                <span>R$ 0,00</span>
              </li>
              <li className="flex items-center justify-between rounded-2xl border border-[#784c43] bg-[#3e1d1a] px-3 py-2 text-sm">
                <span className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 size={15} className="text-[#ffca6f]" />
                  Suco natural 300 ml
                </span>
                <span>R$ 0,00</span>
              </li>
              <li className="flex items-center justify-between rounded-2xl border border-[#784c43] bg-[#3e1d1a] px-3 py-2 text-sm">
                <span className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 size={15} className="text-[#ffca6f]" />
                  Mousse de chocolate
                </span>
                <span>R$ 0,00</span>
              </li>
            </ul>

            <div className="mt-5 flex items-end justify-between border-t border-[#6b3e38] pt-4">
              <div>
                <p className="text-xs uppercase tracking-[0.13em] text-[#d4ad97]">
                  Valor final
                </p>
                <p className="text-3xl font-extrabold text-white">R$ 47,90</p>
              </div>
              <Link
                href="/#pedido"
                className="rounded-2xl bg-[#ffb34e] px-4 py-2 text-sm font-extrabold text-[#4a210f] transition hover:bg-[#ffc66f]"
              >
                Fechar pedido
              </Link>
            </div>
          </aside>
        </section>

        <section
          id="categorias"
          className="rise-in rise-delay-1 rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] px-5 py-6 shadow-[0_14px_32px_rgba(120,67,45,0.12)] sm:px-7"
        >
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9b6053]">
                Categorias
              </p>
              <h2 className="font-display text-4xl leading-none text-[#7d141e] sm:text-5xl">
                Explore sabores
              </h2>
            </div>
            <Link
              href="/#categorias"
              className="hidden rounded-2xl border border-[#efcabc] bg-white px-4 py-2 text-sm font-bold text-[#6a3d33] transition hover:bg-[#fff2eb] sm:inline-flex"
            >
              Ver todas
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categoria/${category.slug}`}
                className="group rounded-3xl border border-[#f0cabc] bg-white p-4 transition hover:-translate-y-1 hover:shadow-[0_14px_26px_rgba(114,54,34,0.14)]"
              >
                <div className="relative mb-3 h-28 overflow-hidden rounded-2xl">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.tone} opacity-50`}
                  />
                  <div className="absolute bottom-2 left-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/30 text-white backdrop-blur-sm">
                    <category.icon size={18} />
                  </div>
                </div>
                <h3 className="text-lg font-extrabold text-[#66281f]">{category.name}</h3>
                <p className="mt-1 text-sm text-[#8f6056]">{category.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-[#c12034]">
                  ver 5 pratos
                  <ChevronRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section id="ofertas" className="rise-in rise-delay-2 grid gap-4 md:grid-cols-3">
          {spotlightDeals.map((deal) => (
            <Link
              key={deal.title}
              href={deal.href}
              className={`shine-hover relative overflow-hidden rounded-[1.7rem] bg-gradient-to-br ${deal.tone} p-5 text-white shadow-[0_14px_28px_rgba(62,24,18,0.24)]`}
            >
              <Image
                src={deal.image}
                alt={deal.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${deal.tone} opacity-78`} />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[11px] font-black uppercase tracking-[0.13em]">
                  <Percent size={12} />
                  imperdivel
                </span>
                <h3 className="mt-3 text-2xl font-extrabold leading-tight">
                  <BrandText text={deal.title} />
                </h3>
                <p className="mt-1 text-sm text-white/90">{deal.subtitle}</p>
                <p className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-[#ffe8c2]">
                  <BrandText text={deal.discount} />
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-extrabold">
                  Aproveitar
                  <ChevronRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section
          id="cardapio-em-alta"
          className="rise-in rise-delay-3 rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] p-5 shadow-[0_16px_32px_rgba(106,52,32,0.12)] sm:p-7"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a5e52]">
                Cardapio em alta
              </p>
              <h2 className="font-display text-4xl leading-none text-[#7d141e] sm:text-5xl">
                Pratos em destaque
              </h2>
            </div>
            <Link
              href="/#cardapio-em-alta"
              className="rounded-2xl border border-[#efcabc] bg-white px-4 py-2 text-sm font-bold text-[#63372f] transition hover:bg-[#fff2eb]"
            >
              Ver cardapio completo
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {menuProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/produto/${product.slug}?auto=1`}
                className="group overflow-hidden rounded-3xl border border-[#efcabc] bg-white shadow-[0_9px_22px_rgba(108,53,38,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_26px_rgba(94,40,28,0.14)]"
              >
                <div className="relative isolate h-36 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1280px) 50vw, 25vw"
                    className="z-0 object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
                  />
                  <div
                    className="pointer-events-none absolute -inset-px z-10"
                    style={{
                      background:
                        highlightCardOverlayBySlug[product.slug] ??
                        "linear-gradient(to top, rgba(120, 40, 30, 0.86), rgba(215, 86, 58, 0.4), rgba(215, 86, 58, 0.06))",
                    }}
                  />
                  <div className="relative z-20 px-4 py-3 text-white">
                    <span className="inline-flex rounded-full border border-[#f2b789] bg-[#ffe9cc] px-2 py-1 text-[11px] font-black uppercase tracking-[0.13em] text-[#7a2a1f] shadow-[0_8px_14px_rgba(72,28,22,0.26)]">
                      {product.tag}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-extrabold text-[#62261d]">
                    <BrandText text={product.name} />
                  </h3>
                  <p className="mt-1 min-h-12 text-sm text-[#8a5b50]">
                    <BrandText text={product.shortDescription} />
                  </p>

                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#f4d2c6] bg-[#fff8f5] px-3 py-2 text-xs font-semibold text-[#71433a]">
                    <span className="flex items-center gap-1">
                      <Clock3 size={14} />
                      {product.prepTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={14} className="fill-[#f5b340] text-[#f5b340]" />
                      {product.rating.toFixed(1)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-2xl font-black text-[#bf1f34]">
                      {formatPrice(product.price)}
                    </p>
                    <span className="rounded-xl bg-[#d72638] px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-white transition group-hover:bg-[#a81a2a]">
                      Ver produto
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="combos" className="grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
          <HomeCartWorkspace />
        </section>

        <SiteContactFooter />
      </main>
    </div>
  );
}
