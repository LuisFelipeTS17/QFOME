"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  WalletCards,
} from "lucide-react";
import { BrandText } from "@/components/brand-text";
import { getMenuProductBySlug } from "@/data/menu-products";

type OrderExtra = {
  id: string;
  name: string;
  price: number;
  quantity?: number;
};

type OrderItem = {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
  extras: OrderExtra[];
  note: string;
  totalPrice: number;
  addedAt: string;
  source?: "manual" | "auto";
};

const STORAGE_KEY = "qfome-order-items";

const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const safeNumber = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const getExtraQuantity = (extra: OrderExtra) => Math.max(1, safeNumber(extra.quantity, 1));

const calcExtrasTotal = (extras: OrderExtra[]) =>
  extras.reduce((sum, extra) => sum + safeNumber(extra.price) * getExtraQuantity(extra), 0);

const calculateItemTotal = (item: OrderItem) => {
  const product = getMenuProductBySlug(item.slug);
  const quantity = Math.max(1, safeNumber(item.quantity, 1));

  if (!product) {
    return safeNumber(item.unitPrice) * quantity;
  }

  return (product.price + calcExtrasTotal(item.extras)) * quantity;
};

const normalizeLoadedItem = (item: Partial<OrderItem>): OrderItem => {
  const normalized: OrderItem = {
    slug: String(item.slug ?? ""),
    name: String(item.name ?? "Item sem nome"),
    quantity: Math.max(1, safeNumber(item.quantity, 1)),
    unitPrice: safeNumber(item.unitPrice, 0),
    extras: Array.isArray(item.extras)
      ? item.extras.map((extra) => ({
          id: String(extra.id ?? ""),
          name: String(extra.name ?? "Acompanhamento"),
          price: safeNumber(extra.price, 0),
          quantity: getExtraQuantity(extra),
        }))
      : [],
    note: String(item.note ?? ""),
    totalPrice: safeNumber(item.totalPrice, 0),
    addedAt: String(item.addedAt ?? new Date().toISOString()),
    source: item.source === "auto" ? "auto" : "manual",
  };

  const product = getMenuProductBySlug(normalized.slug);
  if (product) {
    normalized.unitPrice = product.price;
  }

  normalized.totalPrice = calculateItemTotal(normalized);
  return normalized;
};

const loadCartItems = (): OrderItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved) as Partial<OrderItem>[];
    return Array.isArray(parsed) ? parsed.map(normalizeLoadedItem) : [];
  } catch {
    return [];
  }
};

export function HomeCartWorkspace() {
  const [items, setItems] = useState<OrderItem[]>(() => loadCartItems());

  const persist = (nextItems: OrderItem[]) => {
    setItems(nextItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  };

  const updateItem = (index: number, updater: (item: OrderItem) => OrderItem) => {
    const nextItems = items.map((item, itemIndex) =>
      itemIndex === index ? normalizeLoadedItem(updater(item)) : item,
    );
    persist(nextItems);
  };

  const removeItem = (index: number) => {
    persist(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const clearItems = () => {
    persist([]);
  };

  const changeItemQuantity = (index: number, delta: number) => {
    updateItem(index, (item) => ({
      ...item,
      quantity: Math.max(1, item.quantity + delta),
    }));
  };

  const addExtra = (index: number, extra: { id: string; name: string; price: number }) => {
    updateItem(index, (item) => {
      const existing = item.extras.find((savedExtra) => savedExtra.id === extra.id);

      if (existing) {
        return {
          ...item,
          extras: item.extras.map((savedExtra) =>
            savedExtra.id === extra.id
              ? { ...savedExtra, quantity: getExtraQuantity(savedExtra) + 1 }
              : savedExtra,
          ),
        };
      }

      return {
        ...item,
        extras: [...item.extras, { ...extra, quantity: 1 }],
      };
    });
  };

  const updateExtraQuantity = (index: number, extraId: string, delta: number) => {
    updateItem(index, (item) => ({
      ...item,
      extras: item.extras
        .map((extra) =>
          extra.id === extraId ? { ...extra, quantity: getExtraQuantity(extra) + delta } : extra,
        )
        .filter((extra) => getExtraQuantity(extra) > 0),
    }));
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + calculateItemTotal(item), 0),
    [items],
  );
  const deliveryFee = subtotal > 0 && subtotal < 45 ? 6.9 : 0;
  const total = subtotal + deliveryFee;

  return (
    <>
      <article className="rise-in rounded-[2rem] border border-[var(--qfome-outline)] bg-[var(--qfome-surface)] p-4 shadow-[0_15px_30px_rgba(108,53,34,0.11)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a6052]">
              Personalize seu pedido
            </p>
            <h2 className="font-display mt-2 text-4xl leading-none text-[#7d141e] sm:text-5xl">
              Monte seu combo
            </h2>
            <p className="mt-2 text-sm text-[#8c5b4e]">
              Seus pratos salvos no carrinho aparecem aqui com os acompanhamentos para editar.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/cardapio"
              className="rounded-xl bg-[#d72638] px-3 py-2 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#a81a2a]"
            >
              Monte seu combo
            </Link>
            {items.length > 0 ? (
              <button
                type="button"
                onClick={clearItems}
                className="rounded-xl border border-[#efcabc] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[#7d463b] transition hover:bg-[#fff2eb]"
              >
                Limpar carrinho
              </button>
            ) : null}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-[#f0ccbe] bg-white p-5">
            <p className="text-sm font-semibold text-[#6f3b30]">
              Seu carrinho ainda esta vazio.
            </p>
            <Link
              href="/cardapio"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#d72638] px-3 py-2 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#a81a2a]"
            >
              <ShoppingBag size={14} />
              Escolher pratos
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {items.map((item, index) => {
              const product = getMenuProductBySlug(item.slug);
              const itemTotal = calculateItemTotal(item);

              return (
                <article
                  key={`${item.slug}-${item.addedAt}-${index}`}
                  className="rounded-3xl border border-[#f0ccbe] bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-extrabold text-[#642a20]">
                        <BrandText text={item.name} />
                      </p>
                      {item.note ? (
                        <p className="mt-1 text-xs font-semibold text-[#966153]">Obs.: {item.note}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-lg border border-[#efcabc] px-2 py-1 text-xs font-bold text-[#7b3f34] transition hover:bg-[#fff2eb]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-2xl border border-[#f2d3c8] bg-[#fff9f6] px-3 py-2 text-sm">
                    <span className="font-semibold text-[#6b3427]">Quantidade</span>
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => changeItemQuantity(index, -1)}
                        className="rounded-md border border-[#efc9bd] p-1"
                        aria-label={`Diminuir quantidade de ${item.name}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-4 text-center font-black text-[#6b3427]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeItemQuantity(index, 1)}
                        className="rounded-md bg-[#d72638] p-1 text-white"
                        aria-label={`Aumentar quantidade de ${item.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {item.extras.length > 0 ? (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a6254]">
                          Acompanhamentos escolhidos
                        </p>
                        <ul className="mt-2 space-y-2">
                          {item.extras.map((extra) => (
                            <li
                              key={`${item.slug}-${extra.id}`}
                              className="flex items-center justify-between rounded-2xl border border-[#f2d3c8] bg-[#fff9f6] px-3 py-2 text-sm"
                            >
                              <span className="font-semibold text-[#66352d]">{extra.name}</span>
                              <span className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#cf2841]">
                                  +{formatPrice(extra.price)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateExtraQuantity(index, extra.id, -1)}
                                  className="rounded-md border border-[#efc9bd] p-1"
                                  aria-label={`Diminuir ${extra.name}`}
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="min-w-4 text-center font-black text-[#6b3427]">
                                  {getExtraQuantity(extra)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateExtraQuantity(index, extra.id, 1)}
                                  className="rounded-md bg-[#d72638] p-1 text-white"
                                  aria-label={`Aumentar ${extra.name}`}
                                >
                                  <Plus size={14} />
                                </button>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {product ? (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a6254]">
                          Adicionar acompanhamentos
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {product.extras.map((extra) => (
                            <button
                              key={`${item.slug}-${extra.id}-add`}
                              type="button"
                              onClick={() => addExtra(index, extra)}
                              className="inline-flex items-center gap-1 rounded-xl border border-[#efcabc] bg-[#fff8f5] px-3 py-2 text-xs font-bold text-[#6f3d33] transition hover:bg-[#ffece4]"
                            >
                              <CheckCircle2 size={13} className="text-[#cf2841]" />
                              {extra.name} (+{formatPrice(extra.price)})
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#f2d3c8] pt-3">
                    <span className="text-sm font-bold text-[#7f493d]">Total do item</span>
                    <span className="text-xl font-black text-[#bf1f34]">{formatPrice(itemTotal)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </article>

      <aside
        id="pedido"
        className="rise-in rise-delay-1 rounded-[2rem] border border-[#e6b5aa] bg-[#321312] p-4 text-[#ffe5d0] shadow-[0_16px_35px_rgba(60,15,12,0.34)] sm:p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f6c699]">
              Resumo do pedido
            </p>
            <h3 className="font-display text-3xl leading-none text-white sm:text-4xl">CHECKOUT</h3>
          </div>
          <span className="rounded-full border border-[#8f5c50] px-2 py-1 text-xs font-black uppercase tracking-[0.13em]">
            {items.length} itens
          </span>
        </div>

        {items.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-[#75443a] bg-[#431f1b] px-3 py-3 text-sm text-[#e6b89e]">
            Adicione pratos para ver o resumo do checkout.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {items.map((item, index) => (
              <li
                key={`${item.slug}-${item.addedAt}-${index}`}
                className="flex items-center justify-between rounded-2xl border border-[#75443a] bg-[#431f1b] px-3 py-2"
              >
                <div>
                  <p className="text-sm font-bold text-white">
                    <BrandText text={item.name} />
                  </p>
                  <p className="text-xs text-[#e6b89e]">Quantidade: {item.quantity}</p>
                </div>
                <p className="text-sm font-black text-[#ffd08e]">{formatPrice(calculateItemTotal(item))}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 space-y-2 rounded-2xl border border-[#704339] bg-[#3f1b18] p-3 text-sm">
          <div className="flex items-center justify-between text-[#efcfbb]">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-[#efcfbb]">
            <span>Entrega</span>
            <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : "Gratis"}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#73463a] pt-2 text-white">
            <span className="font-bold">Total</span>
            <span className="text-lg font-black">{formatPrice(total)}</span>
          </div>
        </div>

        <div className="mt-5 grid gap-2 text-xs font-semibold">
          <p className="inline-flex items-center gap-2">
            <Truck size={14} className="text-[#ffd08e]" />
            Entrega estimada: 24-35 min
          </p>
          <p className="inline-flex items-center gap-2">
            <WalletCards size={14} className="text-[#ffd08e]" />
            Pagamento: pix, cartao e vale refeicao
          </p>
          <p className="inline-flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#ffd08e]" />
            Checkout seguro com criptografia
          </p>
        </div>

        <Link
          href="/checkout"
          className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#ffb348] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#4f220d] transition hover:bg-[#ffc770]"
        >
          Ir para checkout
        </Link>
      </aside>
    </>
  );
}
