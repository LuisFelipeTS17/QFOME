import AsyncStorage from "@react-native-async-storage/async-storage";


export type OrderExtra = {
  id: number;
  name: string;
  price: number;
};

export type OrderItem = {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  extras: OrderExtra[];
  note: string;
  totalPrice: number;
  addedAt: string;
};

const ITEMS_KEY = "qfome-order-items";

export async function readOrderItems(): Promise<OrderItem[]> {
  try {
    const saved = await AsyncStorage.getItem(ITEMS_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item: OrderItem) => typeof item?.productId === "number")
      : [];
  } catch {
    return [];
  }
}

export async function saveOrderItems(items: OrderItem[]) {
  try {
    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {
  }
}

export async function addOrderItem(item: OrderItem) {
  const next = [...(await readOrderItems()), item];
  await saveOrderItems(next);
  return next;
}

export async function clearOrderItems() {
  await saveOrderItems([]);
}
