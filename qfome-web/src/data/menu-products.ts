import { menuCategories } from "@/data/menu-categories";

export type ProductExtra = {
  id: string;
  name: string;
  price: number;
};

export type MenuProduct = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  prepTime: string;
  rating: number;
  tag: string;
  tone: string;
  image: string;
  gallery: string[];
  includes: string[];
  extras: ProductExtra[];
};

export const menuProducts: MenuProduct[] = [
  {
    slug: "bowl-nordestino",
    name: "Bowl Nordestino",
    shortDescription: "Arroz cremoso, carne de sol desfiada e vinagrete de feijao.",
    description:
      "Bowl completo com arroz cremoso da casa, carne de sol desfiada, queijo coalho dourado e vinagrete de feijao fradinho.",
    price: 39.9,
    prepTime: "24-34 min",
    rating: 4.9,
    tag: "Mais pedido",
    tone: "from-[#f97352] to-[#db3046]",
    image:
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    ],
    includes: ["Arroz cremoso", "Carne de sol desfiada", "Vinagrete de feijao"],
    extras: [
      { id: "farofa-bacon", name: "Farofa de bacon", price: 4 },
      { id: "queijo-gratinado", name: "Queijo gratinado", price: 5 },
      { id: "molho-picante", name: "Molho picante da casa", price: 3 },
    ],
  },
  {
    slug: "frango-crocante-supreme",
    name: "Frango Crocante Supreme",
    shortDescription: "File empanado, pure rustico e molho de alho assado.",
    description:
      "File de frango empanado ultra crocante, pure rustico de batata e molho cremoso de alho assado com ervas frescas.",
    price: 36.9,
    prepTime: "20-28 min",
    rating: 4.8,
    tag: "Novo no menu",
    tone: "from-[#f8ad3d] to-[#e46f2f]",
    image:
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1598515213692-5f252f75d785?auto=format&fit=crop&w=1200&q=80",
    ],
    includes: ["File crocante", "Pure rustico", "Molho de alho assado"],
    extras: [
      { id: "batata-rustica", name: "Porcao extra de batata rustica", price: 8 },
      { id: "maionese-verde", name: "Maionese verde artesanal", price: 3 },
      { id: "queijo-cremoso", name: "Cobertura de queijo cremoso", price: 6 },
    ],
  },
  {
    slug: "salmao-tropical",
    name: "Salmao Tropical",
    shortDescription: "Salmao grelhado com quinoa e mix citrico de legumes.",
    description:
      "Posta de salmao grelhado no ponto, quinoa de ervas e mix de legumes com toque citrico.",
    price: 47.9,
    prepTime: "28-36 min",
    rating: 4.9,
    tag: "Chef recomenda",
    tone: "from-[#56a9ff] to-[#2d5fcc]",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80",
    ],
    includes: ["Salmao grelhado", "Quinoa de ervas", "Legumes citricos"],
    extras: [
      { id: "legumes-extra", name: "Mix extra de legumes", price: 6 },
      { id: "molho-limao", name: "Molho de limao e manteiga", price: 4 },
      { id: "chips-batata", name: "Chips de batata doce", price: 7 },
    ],
  },
  {
    slug: "combo-street-burguer",
    name: "Combo Street Burguer",
    shortDescription: "Burger artesanal, batata chips e refrigerante 350 ml.",
    description:
      "Burger artesanal com pao brioche, blend da casa, queijo cheddar, batata chips crocante e refrigerante 350 ml.",
    price: 33.9,
    prepTime: "18-25 min",
    rating: 4.7,
    tag: "Oferta relampago",
    tone: "from-[#e94f5d] to-[#9c1d30]",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=80",
    ],
    includes: ["Burger artesanal", "Batata chips", "Refrigerante 350 ml"],
    extras: [
      { id: "bacon-crocante", name: "Bacon crocante", price: 5 },
      { id: "ovo-frito", name: "Ovo frito", price: 4 },
      { id: "onion-rings", name: "Onion rings", price: 7 },
    ],
  },
];

const generatedExtrasByCategory: Record<string, ProductExtra[]> = {
  caseira: [
    { id: "arroz-extra", name: "Arroz soltinho extra", price: 5 },
    { id: "feijao-extra", name: "Feijao temperado da casa", price: 5 },
    { id: "farofa-extra", name: "Farofa crocante", price: 4 },
  ],
  "fit-fresh": [
    { id: "quinoa-extra", name: "Quinoa de ervas", price: 6 },
    { id: "mix-folhas", name: "Mix extra de folhas", price: 5 },
    { id: "molho-iogurte", name: "Molho de iogurte", price: 4 },
  ],
  grelhados: [
    { id: "batata-rustica", name: "Batata rustica", price: 8 },
    { id: "barbecue", name: "Molho barbecue", price: 4 },
    { id: "queijo-cremoso", name: "Queijo cremoso", price: 6 },
  ],
  peixes: [
    { id: "arroz-coco", name: "Arroz de coco", price: 7 },
    { id: "legumes-grelhados", name: "Legumes grelhados", price: 6 },
    { id: "molho-limao", name: "Molho de limao", price: 4 },
  ],
  sopas: [
    { id: "croutons", name: "Croutons artesanais", price: 3 },
    { id: "queijo-ralado", name: "Queijo ralado", price: 4 },
    { id: "pao-artesanal", name: "Pao artesanal", price: 5 },
  ],
  sobremesas: [
    { id: "calda-extra", name: "Calda extra", price: 4 },
    { id: "chantilly", name: "Chantilly fresco", price: 3 },
    { id: "frutas-frescas", name: "Frutas frescas", price: 5 },
  ],
};

const defaultGeneratedExtras: ProductExtra[] = [
  { id: "extra-casa-1", name: "Acompanhamento da casa", price: 5 },
  { id: "extra-casa-2", name: "Molho especial", price: 4 },
  { id: "extra-casa-3", name: "Porcao extra", price: 6 },
];

const buildGeneratedIncludes = (dishName: string, description: string) => {
  const parsed = description
    .split(/[,.]/)
    .map((part) => part.trim())
    .filter(Boolean);

  const includes = [
    ...parsed.slice(0, 2),
    `Finalizacao especial para ${dishName}`,
    "Receita artesanal QFome",
  ];

  return Array.from(new Set(includes)).slice(0, 3);
};

const existingSlugs = new Set(menuProducts.map((product) => product.slug));

const generatedProducts: MenuProduct[] = menuCategories.flatMap((category) =>
  category.dishes.flatMap((dish) => {
    if (existingSlugs.has(dish.slug)) {
      return [];
    }

    existingSlugs.add(dish.slug);
    const extraTemplates = generatedExtrasByCategory[category.slug] ?? defaultGeneratedExtras;
    const gallery = Array.from(new Set([dish.image, category.image])).slice(0, 2);

    return [
      {
        slug: dish.slug,
        name: dish.name,
        shortDescription: dish.description,
        description: `${dish.description} Preparado na hora com ingredientes selecionados pela cozinha QFome.`,
        price: dish.price,
        prepTime: dish.prepTime,
        rating: dish.rating,
        tag: dish.tag,
        tone: category.tone,
        image: dish.image,
        gallery,
        includes: buildGeneratedIncludes(dish.name, dish.description),
        extras: extraTemplates.map((extra) => ({ ...extra })),
      },
    ];
  }),
);

export const allMenuProducts: MenuProduct[] = [...menuProducts, ...generatedProducts];

export function getMenuProductBySlug(slug: string): MenuProduct | undefined {
  return allMenuProducts.find((product) => product.slug === slug);
}
