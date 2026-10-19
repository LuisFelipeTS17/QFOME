"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { BrandText } from "@/components/brand-text";
import { menuCategories } from "@/data/menu-categories";
import { allMenuProducts } from "@/data/menu-products";

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  kind: "prato" | "categoria";
};

const normalizeText = (value: string) =>
  value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

function createSearchItems(): SearchItem[] {
  const items: SearchItem[] = [
    ...allMenuProducts.map((product) => ({
      id: `product-${product.slug}`,
      title: product.name,
      subtitle: product.shortDescription,
      href: `/produto/${product.slug}?auto=1`,
      kind: "prato" as const,
    })),
    ...menuCategories.map((category) => ({
      id: `category-${category.slug}`,
      title: category.name,
      subtitle: `Categoria: ${category.description}`,
      href: `/categoria/${category.slug}`,
      kind: "categoria" as const,
    })),
  ];

  const knownProductSlugs = new Set(allMenuProducts.map((product) => product.slug));
  const seenDishSlugs = new Set(allMenuProducts.map((product) => product.slug));

  menuCategories.forEach((category) => {
    category.dishes.forEach((dish) => {
      if (seenDishSlugs.has(dish.slug)) {
        return;
      }

      seenDishSlugs.add(dish.slug);
      items.push({
        id: `dish-${category.slug}-${dish.slug}`,
        title: dish.name,
        subtitle: `${category.name} - ${dish.description}`,
        href: knownProductSlugs.has(dish.slug)
          ? `/produto/${dish.slug}?auto=1`
          : `/categoria/${category.slug}`,
        kind: "prato",
      });
    });
  });

  return items;
}

const searchItems = createSearchItems();

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    const term = normalizeText(query.trim());
    if (!term) {
      return [];
    }

    return searchItems
      .filter((item) => normalizeText(`${item.title} ${item.subtitle}`).includes(term))
      .slice(0, 7);
  }, [query]);

  const goTo = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  const submitSearch = () => {
    if (results[0]) {
      goTo(results[0].href);
      return;
    }

    router.push("/#cardapio-em-alta");
    setIsOpen(false);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitSearch();
      }}
      className="mt-6 flex flex-col gap-3 sm:flex-row"
    >
      <div className="relative flex-1">
        <label className="flex items-center gap-2 rounded-2xl border border-[#f4ccbd] bg-white px-3 py-3">
          <Search size={18} className="text-[#9f5c4b]" />
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              setTimeout(() => setIsOpen(false), 120);
            }}
            placeholder="O que voce quer comer hoje?"
            className="w-full bg-transparent text-sm font-semibold text-[#542a24] outline-none placeholder:text-[#b98476]"
          />
        </label>

        {isOpen && query.trim() ? (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-[#f1cbbc] bg-white shadow-[0_14px_30px_rgba(114,54,34,0.16)]">
            {results.length > 0 ? (
              <ul className="max-h-72 overflow-y-auto p-2">
                {results.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      onMouseDown={() => goTo(result.href)}
                      className="flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-[#fff2eb]"
                    >
                      <span>
                        <span className="block text-sm font-extrabold text-[#5e281e]">
                          <BrandText text={result.title} />
                        </span>
                        <span className="block text-xs text-[#8c5d52]">
                          <BrandText text={result.subtitle} />
                        </span>
                      </span>
                      <span className="rounded-full bg-[#fde7dd] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#b5392f]">
                        {result.kind}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-3 text-sm font-semibold text-[#8c5d52]">
                Nenhum resultado encontrado. Tente outro termo.
              </p>
            )}
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        className="shine-hover relative inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--qfome-brand)] px-6 py-3 text-sm font-extrabold text-white shadow-[0_14px_24px_rgba(194,49,61,0.35)] transition hover:translate-y-[-1px] hover:bg-[var(--qfome-brand-deep)]"
      >
        Ver cardapio
        <ChevronRight size={18} />
      </button>
    </form>
  );
}
