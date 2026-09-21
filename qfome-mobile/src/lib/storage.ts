import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Equivalente mobile do `localStorage` usado no site. As chaves sao as mesmas
 * (`qfome-order-items`, `qfome-user`, ...) para manter a paridade de contrato
 * quando o carrinho for sincronizado com o backend.
 */

export type OrderExtra = {
  id: string;
  name: string;
  price: number;
  quantity?: number;
};

export type OrderItem = {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
  extras: OrderExtra[];
  note: string;
  totalPrice: number;
  addedAt: string;
};

export type UserProfile = {
  id?: number;
  name: string;
  email: string;
  phone?: string;
};

export type PaymentMethod = "pix" | "cartao" | "dinheiro";

export type OrderStatus = "recebido" | "em_preparo" | "saiu_para_entrega" | "entregue";

export type OrderRecord = {
  code: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
  total: number;
  deliveryFee: number;
  status: OrderStatus;
  estimatedMinutes: number;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  deliveryAddress: {
    cep: string;
    street: string;
    number: string;
    district: string;
    complement: string;
  };
  items: OrderItem[];
};

const KEYS = {
  items: "qfome-order-items",
  user: "qfome-user",
  lastOrder: "qfome-last-order",
  history: "qfome-order-history",
} as const;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const saved = await AsyncStorage.getItem(key);
    if (!saved) {
      return fallback;
    }
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Armazenamento indisponivel: a tela continua funcionando em memoria.
  }
}

// --- Carrinho ---
export async function readOrderItems(): Promise<OrderItem[]> {
  const parsed = await readJson<OrderItem[]>(KEYS.items, []);
  return Array.isArray(parsed) ? parsed : [];
}

export async function saveOrderItems(items: OrderItem[]) {
  await writeJson(KEYS.items, items);
}

export async function addOrderItem(item: OrderItem) {
  const current = await readOrderItems();
  const next = [...current, item];
  await saveOrderItems(next);
  return next;
}

export async function clearOrderItems() {
  await saveOrderItems([]);
}

// --- Usuario ---
export async function readUser(): Promise<UserProfile | null> {
  const parsed = await readJson<UserProfile | null>(KEYS.user, null);
  if (!parsed?.name || !parsed?.email) {
    return null;
  }
  return parsed;
}

export async function saveUser(user: UserProfile) {
  await writeJson(KEYS.user, user);
}

export async function clearUser() {
  try {
    await AsyncStorage.removeItem(KEYS.user);
  } catch {
    // ignora
  }
}

// --- Pedidos ---
export async function readLastOrder(): Promise<OrderRecord | null> {
  const parsed = await readJson<OrderRecord | null>(KEYS.lastOrder, null);
  return parsed?.code ? parsed : null;
}

export async function readOrderHistory(): Promise<OrderRecord[]> {
  const parsed = await readJson<OrderRecord[]>(KEYS.history, []);
  return Array.isArray(parsed) ? parsed : [];
}

export async function saveOrder(order: OrderRecord) {
  const history = await readOrderHistory();
  await writeJson(KEYS.lastOrder, order);
  await writeJson(KEYS.history, [order, ...history].slice(0, 20));
}
