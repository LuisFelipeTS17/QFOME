import { menuCategories } from "@/data/menu-categories";
import { allMenuProducts, menuProducts } from "@/data/menu-products";

export const normalizar = (value: string) =>
  value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

const slugify = (value: string) =>
  normalizar(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const produtosPorNome = new Map(allMenuProducts.map((product) => [normalizar(product.name), product]));
const nomesEmDestaque = new Set(menuProducts.map((product) => normalizar(product.name)));
const categoriasPorNome = new Map(menuCategories.map((category) => [normalizar(category.name), category]));

export function vitrineDoProduto(nome: string) {
  const chave = normalizar(nome);
  const product = produtosPorNome.get(chave);
  return {
    tag: product?.tag,
    rating: product?.rating ?? null,
    includes: product?.includes,
    image: product?.image,
    destaque: nomesEmDestaque.has(chave),
  };
}

export function vitrineDaCategoria(nome: string) {
  const category = categoriasPorNome.get(normalizar(nome));
  return {
    slug: category?.slug ?? slugify(nome),
    description: category?.description,
    image: category?.image,
  };
}
