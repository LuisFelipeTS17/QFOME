export type CategoryDish = {
  slug: string;
  name: string;
  description: string;
  price: number;
  prepTime: string;
  rating: number;
  tag: string;
  image: string;
};

export type MenuCategory = {
  slug: string;
  name: string;
  description: string;
  tone: string;
  image: string;
  dishes: CategoryDish[];
};

export const menuCategories: MenuCategory[] = [
  {
    slug: "caseira",
    name: "Caseira",
    description: "Comida de panela e sabor de casa.",
    tone: "from-[#ff8c3a] to-[#ff5a2d]",
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80",
    dishes: [
      {
        slug: "bowl-nordestino",
        name: "Bowl Nordestino",
        description: "Arroz cremoso, carne de sol desfiada e vinagrete.",
        price: 39.9,
        prepTime: "24-34 min",
        rating: 4.9,
        tag: "Mais pedido",
        image:
          "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "strogonoff-da-casa",
        name: "Strogonoff da Casa",
        description: "Frango ao molho cremoso, arroz soltinho e batata palha.",
        price: 34.9,
        prepTime: "22-30 min",
        rating: 4.8,
        tag: "Classico",
        image:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "feijao-tropeiro-premium",
        name: "Feijao Tropeiro Premium",
        description: "Feijao, linguiça, couve salteada e ovo caipira.",
        price: 37.9,
        prepTime: "26-34 min",
        rating: 4.7,
        tag: "Sabor raiz",
        image:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "picadinho-rustico",
        name: "Picadinho Rustico",
        description: "Carne macia ao molho, pure de mandioquinha e farofa.",
        price: 41.9,
        prepTime: "25-33 min",
        rating: 4.8,
        tag: "Chef indica",
        image:
          "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "frango-crocante-supreme",
        name: "Frango Crocante Supreme",
        description: "File empanado, pure rustico e molho de alho assado.",
        price: 36.9,
        prepTime: "20-28 min",
        rating: 4.8,
        tag: "Novo no menu",
        image:
          "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    slug: "fit-fresh",
    name: "Fit & Fresh",
    description: "Proteina limpa com vegetais frescos.",
    tone: "from-[#46b97e] to-[#1f7c54]",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
    dishes: [
      {
        slug: "bowl-proteico",
        name: "Bowl Proteico",
        description: "Frango grelhado, quinoa, brocolis e tomate confit.",
        price: 35.9,
        prepTime: "20-28 min",
        rating: 4.7,
        tag: "Leve",
        image:
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "salada-mediterranea",
        name: "Salada Mediterranea",
        description: "Folhas frescas, atum, ovo, azeitona e molho de iogurte.",
        price: 32.9,
        prepTime: "16-24 min",
        rating: 4.6,
        tag: "Fresh",
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "fit-wrap-frango",
        name: "Fit Wrap de Frango",
        description: "Wrap integral com frango, cenoura e creme de ricota.",
        price: 29.9,
        prepTime: "14-20 min",
        rating: 4.6,
        tag: "Rapido",
        image:
          "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "salmao-tropical",
        name: "Salmao Tropical",
        description: "Salmao grelhado com quinoa e mix citrico de legumes.",
        price: 47.9,
        prepTime: "28-36 min",
        rating: 4.9,
        tag: "Chef recomenda",
        image:
          "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "omelete-veg",
        name: "Omelete Veg",
        description: "Ovos caipiras, espinafre, tomate seco e queijo branco.",
        price: 27.9,
        prepTime: "12-18 min",
        rating: 4.5,
        tag: "Saudavel",
        image:
          "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    slug: "grelhados",
    name: "Grelhados",
    description: "Carnes no ponto e acompanhamentos premium.",
    tone: "from-[#e35a5a] to-[#9f2222]",
    image:
      "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=80",
    dishes: [
      {
        slug: "picanha-na-chapa",
        name: "Picanha na Chapa",
        description: "Picanha fatiada, arroz biro-biro e batata rustica.",
        price: 54.9,
        prepTime: "30-40 min",
        rating: 4.9,
        tag: "Premium",
        image:
          "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "fraldinha-bourbon",
        name: "Fraldinha Bourbon",
        description: "Fraldinha grelhada com molho bourbon e legumes.",
        price: 49.9,
        prepTime: "28-36 min",
        rating: 4.8,
        tag: "Suculenta",
        image:
          "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "bbq-chicken-plate",
        name: "BBQ Chicken Plate",
        description: "Frango grelhado com barbecue artesanal e milho tostado.",
        price: 38.9,
        prepTime: "22-30 min",
        rating: 4.7,
        tag: "Defumado",
        image:
          "https://images.unsplash.com/photo-1598515214211-89d3c737d349?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "costela-smash",
        name: "Costela Smash",
        description: "Costela bovina desfiada com pure e vinagrete.",
        price: 45.9,
        prepTime: "26-34 min",
        rating: 4.8,
        tag: "Campeao",
        image:
          "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "combo-street-burguer",
        name: "Combo Street Burguer",
        description: "Burger artesanal, batata chips e refrigerante 350 ml.",
        price: 33.9,
        prepTime: "18-25 min",
        rating: 4.7,
        tag: "Oferta relampago",
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    slug: "peixes",
    name: "Peixes",
    description: "Leve, fresco e temperado na medida.",
    tone: "from-[#5db2f0] to-[#246ca4]",
    image:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=80",
    dishes: [
      {
        slug: "salmao-tropical",
        name: "Salmao Tropical",
        description: "Salmao grelhado com quinoa e mix citrico de legumes.",
        price: 47.9,
        prepTime: "28-36 min",
        rating: 4.9,
        tag: "Chef recomenda",
        image:
          "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "tilapia-crisp",
        name: "Tilapia Crisp",
        description: "Tilapia empanada com arroz de coco e salada verde.",
        price: 39.9,
        prepTime: "24-32 min",
        rating: 4.7,
        tag: "Crocrante",
        image:
          "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "moqueca-da-baia",
        name: "Moqueca da Baia",
        description: "Peixe branco, leite de coco, azeite de dende e arroz.",
        price: 44.9,
        prepTime: "30-38 min",
        rating: 4.8,
        tag: "Tradicional",
        image:
          "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "poke-atum",
        name: "Poke de Atum",
        description: "Atum fresco, arroz japones, manga e crispy de cebola.",
        price: 41.9,
        prepTime: "16-24 min",
        rating: 4.7,
        tag: "Fresh bowl",
        image:
          "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "camarao-cremoso",
        name: "Camarao Cremoso",
        description: "Camaroes ao molho de limao siciliano com linguine.",
        price: 52.9,
        prepTime: "26-34 min",
        rating: 4.8,
        tag: "Especial",
        image:
          "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    slug: "sopas",
    name: "Sopas",
    description: "Conforto quente para qualquer hora.",
    tone: "from-[#f9ba4f] to-[#f06d2f]",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
    dishes: [
      {
        slug: "caldo-verde-artesanal",
        name: "Caldo Verde Artesanal",
        description: "Caldo de batata com couve, linguiça e pao torrado.",
        price: 24.9,
        prepTime: "14-22 min",
        rating: 4.7,
        tag: "Conforto",
        image:
          "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "sopa-legumes-fit",
        name: "Sopa de Legumes Fit",
        description: "Mix de legumes frescos com caldo leve e ervas.",
        price: 22.9,
        prepTime: "12-20 min",
        rating: 4.6,
        tag: "Leve",
        image:
          "https://images.unsplash.com/photo-1601315488950-3b5047998b38?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "creme-abobora-gengibre",
        name: "Creme de Abobora e Gengibre",
        description: "Creme aveludado com toque de gengibre e croutons.",
        price: 23.9,
        prepTime: "14-22 min",
        rating: 4.7,
        tag: "Aveludada",
        image:
          "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "ramen-qfome",
        name: "Ramen QFome",
        description: "Lamen artesanal com caldo rico, ovo e legumes.",
        price: 31.9,
        prepTime: "20-28 min",
        rating: 4.8,
        tag: "Oriental",
        image:
          "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "canja-premium",
        name: "Canja Premium",
        description: "Canja cremosa de frango com arroz e cheiro-verde.",
        price: 26.9,
        prepTime: "16-24 min",
        rating: 4.6,
        tag: "Caseira",
        image:
          "https://images.unsplash.com/photo-1615485291234-9f49518595d1?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    slug: "sobremesas",
    name: "Sobremesas",
    description: "Doces artesanais para finalizar.",
    tone: "from-[#fc8cb3] to-[#d24d79]",
    image:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80",
    dishes: [
      {
        slug: "mini-churros",
        name: "Mini Churros",
        description: "Churros crocantes com doce de leite artesanal.",
        price: 19.9,
        prepTime: "10-16 min",
        rating: 4.8,
        tag: "Queridinho",
        image:
          "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "brownie-calda",
        name: "Brownie com Calda",
        description: "Brownie de chocolate intenso com calda quente.",
        price: 21.9,
        prepTime: "10-16 min",
        rating: 4.8,
        tag: "Chocolate",
        image:
          "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "mousse-maracuja",
        name: "Mousse de Maracuja",
        description: "Mousse aerado com crocante de castanhas.",
        price: 16.9,
        prepTime: "8-14 min",
        rating: 4.6,
        tag: "Refrescante",
        image:
          "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "cheesecake-frutas-vermelhas",
        name: "Cheesecake Frutas Vermelhas",
        description: "Massa amanteigada e cobertura artesanal.",
        price: 23.9,
        prepTime: "10-18 min",
        rating: 4.9,
        tag: "Premium",
        image:
          "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "torta-limao",
        name: "Torta de Limao",
        description: "Creme citrico com base crocante e merengue leve.",
        price: 18.9,
        prepTime: "10-16 min",
        rating: 4.7,
        tag: "Classica",
        image:
          "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
];

export function getMenuCategoryBySlug(slug: string): MenuCategory | undefined {
  return menuCategories.find((category) => category.slug === slug);
}
